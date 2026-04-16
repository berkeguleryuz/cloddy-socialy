// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CloddyReputation
 * @dev On-chain XP/Reputation system for Cloddy platform
 *
 * XP Sources:
 * - Post creation: +10 XP
 * - Receiving like: +2 XP
 * - Receiving comment: +5 XP
 * - Adding friend: +15 XP
 * - Badge earned: Variable XP
 * - Event organized: +50 XP
 */
contract CloddyReputation is AccessControl, Pausable {
    bytes32 public constant XP_MANAGER_ROLE = keccak256("XP_MANAGER_ROLE");

    // User XP data
    struct UserXP {
        uint256 totalXP;
        uint256 level;
        uint256 lastActionAt;
        uint256 actionsToday;
    }

    mapping(address => UserXP) public userXP;
    mapping(address => mapping(string => uint256)) public xpByCategory;

    // Leaderboard
    address[] public leaderboard;
    mapping(address => uint256) public leaderboardIndex;
    mapping(address => bool) public isOnLeaderboard;

    // XP limits to prevent farming
    uint256 public constant MAX_DAILY_XP = 1000;
    uint256 public constant DAY_DURATION = 1 days;

    // Events
    event XPAdded(address indexed user, uint256 amount, string reason, uint256 newTotal);
    event LevelUp(address indexed user, uint256 newLevel);
    event LeaderboardUpdated(address indexed user, uint256 position);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(XP_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Add XP to a user
     * @param user Address of the user
     * @param amount Amount of XP to add
     * @param reason Reason for XP (for tracking)
     */
    function addXP(
        address user,
        uint256 amount,
        string calldata reason
    ) external onlyRole(XP_MANAGER_ROLE) whenNotPaused {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Amount must be > 0");

        UserXP storage data = userXP[user];

        // Reset daily count if new day
        if (block.timestamp > data.lastActionAt + DAY_DURATION) {
            data.actionsToday = 0;
        }

        // Check daily limit
        uint256 cappedAmount = amount;
        if (data.actionsToday + amount > MAX_DAILY_XP) {
            cappedAmount = MAX_DAILY_XP > data.actionsToday ? MAX_DAILY_XP - data.actionsToday : 0;
        }

        if (cappedAmount > 0) {
            data.totalXP += cappedAmount;
            data.actionsToday += cappedAmount;
            data.lastActionAt = block.timestamp;

            // Track XP by category
            xpByCategory[user][reason] += cappedAmount;

            // Calculate new level
            uint256 newLevel = calculateLevel(data.totalXP);
            if (newLevel > data.level) {
                data.level = newLevel;
                emit LevelUp(user, newLevel);
            }

            // Update leaderboard
            _updateLeaderboard(user);

            emit XPAdded(user, cappedAmount, reason, data.totalXP);
        }
    }

    /**
     * @dev Calculate level based on XP
     * Level formula: XP required = 100 * level^2 (simplified from 100 * 1.5^level)
     * @param xp Total XP
     * @return level Current level
     */
    function calculateLevel(uint256 xp) public pure returns (uint256) {
        if (xp == 0) return 0;

        // Binary search for level
        uint256 low = 1;
        uint256 high = 100; // Max level 100

        while (low < high) {
            uint256 mid = (low + high + 1) / 2;
            if (_xpForLevel(mid) <= xp) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        return low;
    }

    /**
     * @dev Calculate XP required for a specific level
     * @param level Target level
     * @return XP required
     */
    function _xpForLevel(uint256 level) internal pure returns (uint256) {
        return 100 * level * level;
    }

    /**
     * @dev Get XP required for next level
     * @param user Address of the user
     * @return XP needed for next level
     */
    function xpForNextLevel(address user) external view returns (uint256) {
        UserXP storage data = userXP[user];
        uint256 nextLevel = data.level + 1;
        uint256 required = _xpForLevel(nextLevel);

        if (data.totalXP >= required) {
            return 0;
        }

        return required - data.totalXP;
    }

    /**
     * @dev Get user's XP data
     * @param user Address of the user
     * @return totalXP Total XP
     * @return level Current level
     * @return progressPercent Progress to next level (0-100)
     */
    function getXP(address user) external view returns (
        uint256 totalXP,
        uint256 level,
        uint256 progressPercent
    ) {
        UserXP storage data = userXP[user];
        totalXP = data.totalXP;
        level = data.level;

        // Calculate progress percentage
        uint256 currentLevelXP = _xpForLevel(level);
        uint256 nextLevelXP = _xpForLevel(level + 1);
        uint256 levelRange = nextLevelXP - currentLevelXP;

        if (levelRange > 0) {
            uint256 currentProgress = totalXP - currentLevelXP;
            progressPercent = (currentProgress * 100) / levelRange;
        } else {
            progressPercent = 100;
        }
    }

    /**
     * @dev Get top users from leaderboard
     * @param limit Max number of users to return
     * @return users Array of top user addresses
     * @return xps Array of corresponding XP values
     */
    function getLeaderboard(uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory xps
    ) {
        uint256 count = limit > leaderboard.length ? leaderboard.length : limit;
        users = new address[](count);
        xps = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            users[i] = leaderboard[i];
            xps[i] = userXP[leaderboard[i]].totalXP;
        }
    }

    /**
     * @dev Update leaderboard position for a user
     * @param user Address of the user
     */
    function _updateLeaderboard(address user) internal {
        uint256 userXPAmount = userXP[user].totalXP;

        if (!isOnLeaderboard[user]) {
            // Add to leaderboard
            leaderboard.push(user);
            leaderboardIndex[user] = leaderboard.length - 1;
            isOnLeaderboard[user] = true;
        }

        // Bubble up if XP is higher than previous entries
        uint256 currentIndex = leaderboardIndex[user];

        while (currentIndex > 0) {
            address prevUser = leaderboard[currentIndex - 1];
            if (userXPAmount > userXP[prevUser].totalXP) {
                // Swap positions
                leaderboard[currentIndex] = prevUser;
                leaderboard[currentIndex - 1] = user;
                leaderboardIndex[prevUser] = currentIndex;
                leaderboardIndex[user] = currentIndex - 1;
                currentIndex--;
            } else {
                break;
            }
        }

        emit LeaderboardUpdated(user, leaderboardIndex[user] + 1);
    }

    /**
     * @dev Get user's rank on leaderboard
     * @param user Address of the user
     * @return rank User's rank (1-indexed), 0 if not on leaderboard
     */
    function getUserRank(address user) external view returns (uint256) {
        if (!isOnLeaderboard[user]) return 0;
        return leaderboardIndex[user] + 1;
    }

    /**
     * @dev Pause the contract
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
