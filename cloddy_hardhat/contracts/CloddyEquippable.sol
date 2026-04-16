// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CloddyEquippable
 * @dev Equippable accessory NFTs that can be attached to profile NFTs
 * Implements a parent-child relationship for composable NFTs
 */
contract CloddyEquippable is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private _tokenIdCounter;

    // Slot types for equipment
    enum SlotType {
        BACKGROUND,     // 0 - Profile background
        FRAME,          // 1 - Profile frame/border
        HAT,            // 2 - Hat/head accessory
        BADGE_DISPLAY,  // 3 - Badge showcase area
        EFFECT,         // 4 - Special effects
        PET,            // 5 - Companion pet
        AURA            // 6 - Aura effect
    }

    // Accessory item struct
    struct Accessory {
        uint256 id;
        string name;
        SlotType slotType;
        uint256 rarity;         // 1-5 (Common to Legendary)
        bool isTransferable;
        uint256 price;          // Price in wei (for marketplace)
        address creator;
        uint256 createdAt;
    }

    // Equipment state - which accessory is equipped to which profile
    struct EquipmentState {
        uint256 profileTokenId;     // The profile NFT this is equipped to
        address profileContract;     // The profile NFT contract address
        bool isEquipped;
        uint256 equippedAt;
    }

    // Accessory type templates
    struct AccessoryType {
        string name;
        SlotType slotType;
        uint256 rarity;
        string baseURI;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 price;
        bool isActive;
    }

    // Storage
    mapping(uint256 => Accessory) public accessories;
    mapping(uint256 => EquipmentState) public equipmentStates;
    mapping(uint256 => AccessoryType) public accessoryTypes;

    // Profile equipment tracking: profileContract => profileTokenId => slotType => accessoryTokenId
    mapping(address => mapping(uint256 => mapping(SlotType => uint256))) public profileEquipment;

    // Slot availability per profile
    mapping(address => mapping(uint256 => mapping(SlotType => bool))) public slotOccupied;

    uint256 public nextAccessoryTypeId = 1;
    address public profileContract;

    // Fees
    uint256 public equipFee = 0;
    uint256 public creatorRoyaltyPercent = 5; // 5%

    // Events
    event AccessoryMinted(uint256 indexed tokenId, address indexed owner, uint256 accessoryTypeId, SlotType slotType);
    event AccessoryEquipped(uint256 indexed accessoryTokenId, address indexed profileContract, uint256 indexed profileTokenId, SlotType slotType);
    event AccessoryUnequipped(uint256 indexed accessoryTokenId, address indexed profileContract, uint256 indexed profileTokenId, SlotType slotType);
    event AccessoryTypeCreated(uint256 indexed typeId, string name, SlotType slotType, uint256 rarity);
    event ProfileContractUpdated(address indexed oldContract, address indexed newContract);

    constructor(address _profileContract) ERC721("Cloddy Equippable", "CLEQ") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        profileContract = _profileContract;

        // Initialize default accessory types
        _initializeDefaultTypes();
    }

    function _initializeDefaultTypes() internal {
        // Background accessories
        _createAccessoryType("Cosmic Background", SlotType.BACKGROUND, 3, "", 1000, 0.001 ether);
        _createAccessoryType("Neon Grid", SlotType.BACKGROUND, 2, "", 2000, 0.0005 ether);

        // Frame accessories
        _createAccessoryType("Gold Frame", SlotType.FRAME, 4, "", 500, 0.005 ether);
        _createAccessoryType("Diamond Frame", SlotType.FRAME, 5, "", 100, 0.01 ether);
        _createAccessoryType("Pixel Frame", SlotType.FRAME, 2, "", 5000, 0.0002 ether);

        // Hat accessories
        _createAccessoryType("Crown", SlotType.HAT, 5, "", 50, 0.02 ether);
        _createAccessoryType("Wizard Hat", SlotType.HAT, 3, "", 1000, 0.001 ether);
        _createAccessoryType("Cat Ears", SlotType.HAT, 2, "", 3000, 0.0005 ether);

        // Effect accessories
        _createAccessoryType("Fire Aura", SlotType.EFFECT, 4, "", 200, 0.008 ether);
        _createAccessoryType("Sparkles", SlotType.EFFECT, 2, "", 5000, 0.0003 ether);

        // Pet accessories
        _createAccessoryType("Dragon Pet", SlotType.PET, 5, "", 100, 0.015 ether);
        _createAccessoryType("Cat Companion", SlotType.PET, 3, "", 1000, 0.002 ether);
    }

    function _createAccessoryType(
        string memory name,
        SlotType slotType,
        uint256 rarity,
        string memory baseURI,
        uint256 maxSupply,
        uint256 price
    ) internal returns (uint256) {
        uint256 typeId = nextAccessoryTypeId++;
        accessoryTypes[typeId] = AccessoryType({
            name: name,
            slotType: slotType,
            rarity: rarity,
            baseURI: baseURI,
            maxSupply: maxSupply,
            currentSupply: 0,
            price: price,
            isActive: true
        });

        emit AccessoryTypeCreated(typeId, name, slotType, rarity);
        return typeId;
    }

    /**
     * @dev Create a new accessory type (admin only)
     */
    function createAccessoryType(
        string memory name,
        SlotType slotType,
        uint256 rarity,
        string memory baseURI,
        uint256 maxSupply,
        uint256 price
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        return _createAccessoryType(name, slotType, rarity, baseURI, maxSupply, price);
    }

    /**
     * @dev Mint a new accessory NFT
     */
    function mintAccessory(
        address to,
        uint256 accessoryTypeId,
        string memory tokenURI_
    ) external payable nonReentrant returns (uint256) {
        AccessoryType storage accType = accessoryTypes[accessoryTypeId];
        require(accType.isActive, "Accessory type not active");
        require(accType.currentSupply < accType.maxSupply, "Max supply reached");

        // Check payment if not minter
        if (!hasRole(MINTER_ROLE, msg.sender)) {
            require(msg.value >= accType.price, "Insufficient payment");
        }

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        accessories[tokenId] = Accessory({
            id: tokenId,
            name: accType.name,
            slotType: accType.slotType,
            rarity: accType.rarity,
            isTransferable: true,
            price: accType.price,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        accType.currentSupply++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit AccessoryMinted(tokenId, to, accessoryTypeId, accType.slotType);

        return tokenId;
    }

    /**
     * @dev Equip an accessory to a profile NFT
     */
    function equip(
        uint256 accessoryTokenId,
        address _profileContract,
        uint256 profileTokenId
    ) external payable nonReentrant {
        require(ownerOf(accessoryTokenId) == msg.sender, "Not accessory owner");
        require(!equipmentStates[accessoryTokenId].isEquipped, "Already equipped");

        // Verify caller owns the profile NFT
        IERC721 profile = IERC721(_profileContract);
        require(profile.ownerOf(profileTokenId) == msg.sender, "Not profile owner");

        // Check equip fee
        if (equipFee > 0) {
            require(msg.value >= equipFee, "Insufficient equip fee");
        }

        Accessory storage acc = accessories[accessoryTokenId];
        SlotType slot = acc.slotType;

        // Check if slot is already occupied
        if (slotOccupied[_profileContract][profileTokenId][slot]) {
            // Auto-unequip existing accessory
            uint256 existingAccessory = profileEquipment[_profileContract][profileTokenId][slot];
            _unequip(existingAccessory);
        }

        // Update equipment state
        equipmentStates[accessoryTokenId] = EquipmentState({
            profileTokenId: profileTokenId,
            profileContract: _profileContract,
            isEquipped: true,
            equippedAt: block.timestamp
        });

        // Update profile equipment tracking
        profileEquipment[_profileContract][profileTokenId][slot] = accessoryTokenId;
        slotOccupied[_profileContract][profileTokenId][slot] = true;

        emit AccessoryEquipped(accessoryTokenId, _profileContract, profileTokenId, slot);
    }

    /**
     * @dev Unequip an accessory from a profile NFT
     */
    function unequip(uint256 accessoryTokenId) external nonReentrant {
        require(ownerOf(accessoryTokenId) == msg.sender, "Not accessory owner");
        require(equipmentStates[accessoryTokenId].isEquipped, "Not equipped");

        _unequip(accessoryTokenId);
    }

    function _unequip(uint256 accessoryTokenId) internal {
        EquipmentState storage state = equipmentStates[accessoryTokenId];
        Accessory storage acc = accessories[accessoryTokenId];

        address _profileContract = state.profileContract;
        uint256 profileTokenId = state.profileTokenId;
        SlotType slot = acc.slotType;

        // Clear equipment state
        state.isEquipped = false;
        state.equippedAt = 0;

        // Clear profile equipment tracking
        profileEquipment[_profileContract][profileTokenId][slot] = 0;
        slotOccupied[_profileContract][profileTokenId][slot] = false;

        emit AccessoryUnequipped(accessoryTokenId, _profileContract, profileTokenId, slot);
    }

    /**
     * @dev Get all equipped accessories for a profile
     */
    function getEquippedAccessories(
        address _profileContract,
        uint256 profileTokenId
    ) external view returns (uint256[] memory) {
        uint256[] memory equipped = new uint256[](7); // 7 slot types

        for (uint8 i = 0; i < 7; i++) {
            SlotType slot = SlotType(i);
            if (slotOccupied[_profileContract][profileTokenId][slot]) {
                equipped[i] = profileEquipment[_profileContract][profileTokenId][slot];
            }
        }

        return equipped;
    }

    /**
     * @dev Get accessory details
     */
    function getAccessory(uint256 tokenId) external view returns (
        string memory name,
        SlotType slotType,
        uint256 rarity,
        bool isEquipped,
        uint256 equippedToProfile,
        address profileContract_
    ) {
        Accessory storage acc = accessories[tokenId];
        EquipmentState storage state = equipmentStates[tokenId];

        return (
            acc.name,
            acc.slotType,
            acc.rarity,
            state.isEquipped,
            state.profileTokenId,
            state.profileContract
        );
    }

    /**
     * @dev Update profile contract address
     */
    function setProfileContract(address _profileContract) external onlyRole(ADMIN_ROLE) {
        address oldContract = profileContract;
        profileContract = _profileContract;
        emit ProfileContractUpdated(oldContract, _profileContract);
    }

    /**
     * @dev Update equip fee
     */
    function setEquipFee(uint256 _fee) external onlyRole(ADMIN_ROLE) {
        equipFee = _fee;
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(msg.sender).transfer(balance);
    }

    // Override functions for OpenZeppelin v5
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        // Auto-unequip when transferring
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0) && equipmentStates[tokenId].isEquipped) {
            _unequip(tokenId);
        }
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
