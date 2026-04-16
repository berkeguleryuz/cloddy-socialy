// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CloddyBadges
 * @dev ERC-1155 contract for achievement badges on the Cloddy platform
 *
 * Badge IDs:
 * 1: "Early Adopter" (first 1000 users)
 * 2: "Social Butterfly" (100+ friends)
 * 3: "Content Creator" (50+ posts)
 * 4: "Community Leader" (group owner)
 * 5: "Event Organizer" (hosted events)
 * 6: "Verified" (verified user)
 * ... and more
 */
contract CloddyBadges is ERC1155, ERC1155Supply, AccessControl, Pausable {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");

    string public name = "Cloddy Badges";
    string public symbol = "CBADGE";

    // Badge definitions
    struct BadgeInfo {
        string name;
        string description;
        uint256 xpReward;
        bool isSoulbound;
        uint256 maxSupply; // 0 = unlimited
        bool active;
    }

    mapping(uint256 => BadgeInfo) public badges;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => mapping(uint256 => bool)) public hasBadge;

    uint256 public nextBadgeId = 1;
    string private _baseURI;

    // Events
    event BadgeCreated(uint256 indexed badgeId, string name, uint256 xpReward, bool isSoulbound);
    event BadgeMinted(address indexed to, uint256 indexed badgeId);
    event BadgeBatchMinted(address indexed to, uint256[] badgeIds);

    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _baseURI = baseURI;

        // Initialize default badges
        _createBadge("Early Adopter", "One of the first 1000 users", 100, true, 1000);
        _createBadge("Social Butterfly", "Made 100+ friends", 50, true, 0);
        _createBadge("Content Creator", "Created 50+ posts", 75, true, 0);
        _createBadge("Community Leader", "Owns a community group", 100, false, 0);
        _createBadge("Event Organizer", "Organized community events", 80, true, 0);
        _createBadge("Verified", "Verified user", 200, true, 0);
        _createBadge("NFT Collector", "Owns 10+ NFTs", 60, false, 0);
        _createBadge("Diamond Hands", "Staked for 30+ days", 150, true, 0);
        _createBadge("Whale", "Top 100 token holders", 300, false, 100);
        _createBadge("OG", "Platform OG member", 500, true, 100);
    }

    /**
     * @dev Create a new badge type (internal)
     */
    function _createBadge(
        string memory _name,
        string memory description,
        uint256 xpReward,
        bool isSoulbound,
        uint256 maxSupply
    ) internal returns (uint256) {
        uint256 badgeId = nextBadgeId++;

        badges[badgeId] = BadgeInfo({
            name: _name,
            description: description,
            xpReward: xpReward,
            isSoulbound: isSoulbound,
            maxSupply: maxSupply,
            active: true
        });

        emit BadgeCreated(badgeId, _name, xpReward, isSoulbound);
        return badgeId;
    }

    /**
     * @dev Create a new badge type (admin)
     */
    function createBadge(
        string calldata _name,
        string calldata description,
        uint256 xpReward,
        bool isSoulbound,
        uint256 maxSupply,
        string calldata tokenURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        uint256 badgeId = _createBadge(_name, description, xpReward, isSoulbound, maxSupply);
        if (bytes(tokenURI).length > 0) {
            _tokenURIs[badgeId] = tokenURI;
        }
        return badgeId;
    }

    /**
     * @dev Mint a badge to a user
     * @param to Address to mint to
     * @param badgeId Badge ID to mint
     */
    function mintBadge(address to, uint256 badgeId) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(badges[badgeId].active, "Badge not active");
        require(!hasBadge[to][badgeId], "Already has badge");

        if (badges[badgeId].maxSupply > 0) {
            require(totalSupply(badgeId) < badges[badgeId].maxSupply, "Max supply reached");
        }

        _mint(to, badgeId, 1, "");
        hasBadge[to][badgeId] = true;

        emit BadgeMinted(to, badgeId);
    }

    /**
     * @dev Batch mint multiple badges to a user
     * @param to Address to mint to
     * @param badgeIds Array of badge IDs to mint
     */
    function batchMint(address to, uint256[] calldata badgeIds) external onlyRole(MINTER_ROLE) whenNotPaused {
        uint256[] memory amounts = new uint256[](badgeIds.length);

        for (uint256 i = 0; i < badgeIds.length; i++) {
            require(badges[badgeIds[i]].active, "Badge not active");
            require(!hasBadge[to][badgeIds[i]], "Already has badge");

            if (badges[badgeIds[i]].maxSupply > 0) {
                require(totalSupply(badgeIds[i]) < badges[badgeIds[i]].maxSupply, "Max supply reached");
            }

            amounts[i] = 1;
            hasBadge[to][badgeIds[i]] = true;
        }

        _mintBatch(to, badgeIds, amounts, "");
        emit BadgeBatchMinted(to, badgeIds);
    }

    /**
     * @dev Get badge holders count
     * @param badgeId Badge ID
     * @return Number of badge holders
     */
    function getBadgeHolderCount(uint256 badgeId) external view returns (uint256) {
        return totalSupply(badgeId);
    }

    /**
     * @dev Get user's badges
     * @param user Address to check
     * @return badgeIds Array of badge IDs the user owns
     */
    function getUserBadges(address user) external view returns (uint256[] memory badgeIds) {
        uint256 count = 0;

        // First count how many badges the user has
        for (uint256 i = 1; i < nextBadgeId; i++) {
            if (hasBadge[user][i]) {
                count++;
            }
        }

        // Then populate the array
        badgeIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextBadgeId; i++) {
            if (hasBadge[user][i]) {
                badgeIds[index++] = i;
            }
        }
    }

    /**
     * @dev Set token URI for a badge
     * @param badgeId Badge ID
     * @param tokenURI New URI
     */
    function setTokenURI(uint256 badgeId, string calldata tokenURI) external onlyRole(URI_SETTER_ROLE) {
        require(badges[badgeId].active, "Badge not active");
        _tokenURIs[badgeId] = tokenURI;
    }

    /**
     * @dev Set base URI
     * @param newBaseURI New base URI
     */
    function setBaseURI(string calldata newBaseURI) external onlyRole(URI_SETTER_ROLE) {
        _baseURI = newBaseURI;
    }

    /**
     * @dev Deactivate a badge
     * @param badgeId Badge ID to deactivate
     */
    function deactivateBadge(uint256 badgeId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        badges[badgeId].active = false;
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

    /**
     * @dev Get URI for a badge
     * @param tokenId Badge ID
     * @return URI string
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (bytes(_tokenURIs[tokenId]).length > 0) {
            return _tokenURIs[tokenId];
        }
        return string(abi.encodePacked(_baseURI, tokenId.toString(), ".json"));
    }

    // Override to prevent transfer of soulbound badges
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(!badges[ids[i]].isSoulbound, "Soulbound badge cannot be transferred");
            }
        }

        // Update hasBadge mapping on transfer
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                hasBadge[from][ids[i]] = false;
                hasBadge[to][ids[i]] = true;
            }
        }

        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
