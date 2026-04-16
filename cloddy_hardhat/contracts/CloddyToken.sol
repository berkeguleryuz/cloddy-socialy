// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CloddyToken
 * @dev ERC20 token for the Cloddy platform with governance and staking capabilities
 *
 * Token Distribution:
 * - Community Rewards: 40% (400M)
 * - Team: 15% (150M) - 2 year vesting
 * - Treasury: 20% (200M)
 * - Liquidity: 15% (150M)
 * - Advisors: 5% (50M)
 * - Airdrop: 5% (50M)
 */
contract CloddyToken is ERC20, ERC20Burnable, ERC20Permit, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

    // Staking
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public totalStaked;
    uint256 public stakingRewardRate = 500; // 5% APY (500 basis points)

    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(address admin) ERC20("Cloddy", "CLODDY") ERC20Permit("Cloddy") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        // Mint initial supply to admin (will be distributed according to tokenomics)
        _mint(admin, TOTAL_SUPPLY);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Stake tokens to earn rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Claim existing rewards before staking more
        if (stakedBalance[msg.sender] > 0) {
            _claimRewards();
        }

        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens and claim rewards
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");

        uint256 reward = _calculateReward(msg.sender);

        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        stakingTimestamp[msg.sender] = block.timestamp;

        _transfer(address(this), msg.sender, amount);

        // Mint rewards if any
        if (reward > 0) {
            _mint(msg.sender, reward);
        }

        emit Unstaked(msg.sender, amount, reward);
    }

    /**
     * @dev Claim staking rewards without unstaking
     */
    function claimRewards() external whenNotPaused {
        _claimRewards();
    }

    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards() internal {
        uint256 reward = _calculateReward(msg.sender);
        require(reward > 0, "No rewards to claim");

        stakingTimestamp[msg.sender] = block.timestamp;
        _mint(msg.sender, reward);
    }

    /**
     * @dev Calculate pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount
     */
    function _calculateReward(address user) internal view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakingTimestamp[user];
        uint256 annualReward = (stakedBalance[user] * stakingRewardRate) / 10000;
        uint256 reward = (annualReward * stakingDuration) / 365 days;

        return reward;
    }

    /**
     * @dev Get pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount
     */
    function pendingRewards(address user) external view returns (uint256) {
        return _calculateReward(user);
    }

    /**
     * @dev Update staking reward rate (only admin)
     * @param newRate New reward rate in basis points
     */
    function setStakingRewardRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate <= 2000, "Rate too high"); // Max 20% APY
        stakingRewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /**
     * @dev Override _update to include pause functionality
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
