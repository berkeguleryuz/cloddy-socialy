// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CloddyProfile
 * @dev ERC-721 NFT representing user profiles on the Cloddy platform
 *
 * Features:
 * - One profile per wallet (soulbound option)
 * - Stores profile metadata hash (IPFS)
 * - On-chain reputation score
 * - ENS integration ready
 */
contract CloddyProfile is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REPUTATION_MANAGER_ROLE = keccak256("REPUTATION_MANAGER_ROLE");

    // Profile data
    struct Profile {
        uint256 reputation;
        uint256 level;
        uint256 createdAt;
        uint256 lastActiveAt;
        bool isSoulbound;
        string username;
    }

    mapping(uint256 => Profile) public profiles;
    mapping(address => uint256) public addressToTokenId;
    mapping(string => address) public usernameToAddress;

    uint256 private _tokenIdCounter;
    bool public soulboundByDefault = true;

    // Events
    event ProfileMinted(address indexed owner, uint256 indexed tokenId, string username);
    event ProfileUpdated(uint256 indexed tokenId, string newURI);
    event ReputationUpdated(uint256 indexed tokenId, uint256 newReputation);
    event UsernameChanged(uint256 indexed tokenId, string oldUsername, string newUsername);

    constructor() ERC721("Cloddy Profile", "CPROFILE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(REPUTATION_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new profile NFT
     * @param to Address to mint to
     * @param username Unique username
     * @param metadataURI IPFS URI for profile metadata
     */
    function mint(
        address to,
        string calldata username,
        string calldata metadataURI
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(addressToTokenId[to] == 0, "Already has profile");
        require(bytes(username).length >= 3 && bytes(username).length <= 20, "Invalid username length");
        require(usernameToAddress[username] == address(0), "Username taken");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        profiles[tokenId] = Profile({
            reputation: 0,
            level: 1,
            createdAt: block.timestamp,
            lastActiveAt: block.timestamp,
            isSoulbound: soulboundByDefault,
            username: username
        });

        addressToTokenId[to] = tokenId;
        usernameToAddress[username] = to;

        emit ProfileMinted(to, tokenId, username);
        return tokenId;
    }

    /**
     * @dev Self-mint a profile (for users to create their own)
     * @param username Unique username
     * @param metadataURI IPFS URI for profile metadata
     */
    function createProfile(
        string calldata username,
        string calldata metadataURI
    ) external whenNotPaused returns (uint256) {
        require(addressToTokenId[msg.sender] == 0, "Already has profile");
        require(bytes(username).length >= 3 && bytes(username).length <= 20, "Invalid username length");
        require(usernameToAddress[username] == address(0), "Username taken");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        profiles[tokenId] = Profile({
            reputation: 0,
            level: 1,
            createdAt: block.timestamp,
            lastActiveAt: block.timestamp,
            isSoulbound: soulboundByDefault,
            username: username
        });

        addressToTokenId[msg.sender] = tokenId;
        usernameToAddress[username] = msg.sender;

        emit ProfileMinted(msg.sender, tokenId, username);
        return tokenId;
    }

    /**
     * @dev Update profile metadata
     * @param tokenId Token ID to update
     * @param newURI New IPFS URI
     */
    function updateMetadata(uint256 tokenId, string calldata newURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _setTokenURI(tokenId, newURI);
        profiles[tokenId].lastActiveAt = block.timestamp;
        emit ProfileUpdated(tokenId, newURI);
    }

    /**
     * @dev Add reputation to a profile
     * @param tokenId Token ID to update
     * @param amount Amount of reputation to add
     */
    function addReputation(uint256 tokenId, uint256 amount) external onlyRole(REPUTATION_MANAGER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Profile does not exist");
        profiles[tokenId].reputation += amount;
        profiles[tokenId].lastActiveAt = block.timestamp;

        // Level up calculation (100 * 1.5^level)
        uint256 currentLevel = profiles[tokenId].level;
        uint256 requiredRep = _calculateRequiredReputation(currentLevel + 1);

        if (profiles[tokenId].reputation >= requiredRep) {
            profiles[tokenId].level = currentLevel + 1;
        }

        emit ReputationUpdated(tokenId, profiles[tokenId].reputation);
    }

    /**
     * @dev Calculate required reputation for a level
     * @param level Target level
     * @return Required reputation points
     */
    function _calculateRequiredReputation(uint256 level) internal pure returns (uint256) {
        if (level <= 1) return 0;
        // Simplified: 100 * level * level (approximates 1.5^level growth)
        return 100 * level * level;
    }

    /**
     * @dev Get reputation for a profile
     * @param tokenId Token ID
     * @return Reputation score
     */
    function getReputation(uint256 tokenId) external view returns (uint256) {
        return profiles[tokenId].reputation;
    }

    /**
     * @dev Get level for a profile
     * @param tokenId Token ID
     * @return Level
     */
    function getLevel(uint256 tokenId) external view returns (uint256) {
        return profiles[tokenId].level;
    }

    /**
     * @dev Get profile by address
     * @param user Address to lookup
     * @return tokenId The token ID
     * @return profile The profile data
     */
    function getProfileByAddress(address user) external view returns (uint256 tokenId, Profile memory profile) {
        tokenId = addressToTokenId[user];
        if (tokenId != 0) {
            profile = profiles[tokenId];
        }
    }

    /**
     * @dev Change username
     * @param tokenId Token ID
     * @param newUsername New username
     */
    function changeUsername(uint256 tokenId, string calldata newUsername) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(bytes(newUsername).length >= 3 && bytes(newUsername).length <= 20, "Invalid username length");
        require(usernameToAddress[newUsername] == address(0), "Username taken");

        string memory oldUsername = profiles[tokenId].username;
        delete usernameToAddress[oldUsername];

        profiles[tokenId].username = newUsername;
        usernameToAddress[newUsername] = msg.sender;

        emit UsernameChanged(tokenId, oldUsername, newUsername);
    }

    /**
     * @dev Set soulbound default for new profiles
     * @param _soulbound Whether new profiles should be soulbound
     */
    function setSoulboundDefault(bool _soulbound) external onlyRole(DEFAULT_ADMIN_ROLE) {
        soulboundByDefault = _soulbound;
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

    // Override transfer to respect soulbound status
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            require(!profiles[tokenId].isSoulbound, "Soulbound token cannot be transferred");
        }

        // Update address mapping on transfer
        if (from != address(0)) {
            delete addressToTokenId[from];
        }
        if (to != address(0)) {
            addressToTokenId[to] = tokenId;
            usernameToAddress[profiles[tokenId].username] = to;
        }

        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
