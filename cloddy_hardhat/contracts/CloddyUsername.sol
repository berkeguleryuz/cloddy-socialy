// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CloddyUsername
 * @dev ENS-style username NFTs with a multi-TLD registry.
 *
 * - Each minted username is an ERC-721 token keyed by keccak256(tld ++ "." ++ label).
 * - Labels are 3-10 chars of [a-zA-Z0-9_-], stored case-insensitively.
 * - Reserved labels (admin, support, cloddy, berke, omegayon, ...) cannot be minted.
 * - Flat mint fee forwarded to treasury (refunds overpayment).
 * - Transferable (OpenSea + ERC-2981 royalties).
 * - Optional primary-name resolver per address for reverse lookup.
 */
contract CloddyUsername is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    ERC2981,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    uint256 public constant LABEL_MIN_LENGTH = 3;
    uint256 public constant LABEL_MAX_LENGTH = 10;

    uint256 public mintFee;
    address payable public treasury;
    string private _contractURI;

    // TLD registry — e.g. "cloddy" is enabled at deploy. Owner can toggle others.
    mapping(string => bool) public allowedTld;

    struct Username {
        string tld; // lowercased
        string label; // lowercased handle
        string display; // original casing supplied by minter
        uint256 mintedAt;
    }

    mapping(uint256 => Username) public usernames;
    // tokenId = keccak256(tld ++ "." ++ label) cast to uint256.
    mapping(uint256 => bool) public tokenExists;
    mapping(address => uint256) public primaryOf;

    // Reserved label set — enforced across all TLDs.
    mapping(bytes32 => bool) public reservedLabelHashes;

    event UsernameMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string tld,
        string label,
        string display
    );
    event PrimaryUpdated(address indexed account, uint256 indexed tokenId);
    event TldAllowed(string tld, bool allowed);
    event MintFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);
    event ReservedLabelUpdated(string label, bool reserved);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);
    event ContractURIUpdated(string newURI);

    constructor(
        address payable _treasury,
        uint256 _mintFee,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator,
        string memory contractLevelURI,
        string memory initialTld,
        string[] memory initialReservedLabels
    ) ERC721("Cloddy Username", "CLUSR") Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury required");
        treasury = _treasury;
        mintFee = _mintFee;
        _contractURI = contractLevelURI;

        string memory loweredTld = _toLowerCase(initialTld);
        allowedTld[loweredTld] = true;
        emit TldAllowed(loweredTld, true);

        for (uint256 i = 0; i < initialReservedLabels.length; i++) {
            string memory lowered = _toLowerCase(initialReservedLabels[i]);
            bytes32 key = keccak256(bytes(lowered));
            reservedLabelHashes[key] = true;
            emit ReservedLabelUpdated(lowered, true);
        }

        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    /**
     * @dev Mint a username within an allowed TLD. Requires exact `mintFee` as msg.value.
     * @param tld     TLD without dot, e.g. "cloddy"
     * @param label   Desired label (3-10 chars, [a-zA-Z0-9_-]). Original casing is preserved for display.
     * @param metadataURI IPFS or HTTPS URI of the token metadata JSON (OpenSea-compatible).
     */
    function mint(
        string calldata tld,
        string calldata label,
        string calldata metadataURI
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        string memory loweredTld = _toLowerCase(tld);
        require(allowedTld[loweredTld], "TLD not allowed");

        _validateLabel(label);
        string memory loweredLabel = _toLowerCase(label);

        bytes32 labelKey = keccak256(bytes(loweredLabel));
        require(!reservedLabelHashes[labelKey], "Label reserved");

        uint256 tokenId = _composeTokenId(loweredTld, loweredLabel);
        require(!tokenExists[tokenId], "Username taken");

        tokenExists[tokenId] = true;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        usernames[tokenId] = Username({
            tld: loweredTld,
            label: loweredLabel,
            display: label,
            mintedAt: block.timestamp
        });

        // Set as primary if caller has none.
        if (primaryOf[msg.sender] == 0) {
            primaryOf[msg.sender] = tokenId;
            emit PrimaryUpdated(msg.sender, tokenId);
        }

        (bool sent, ) = treasury.call{value: mintFee}("");
        require(sent, "Treasury transfer failed");
        uint256 excess = msg.value - mintFee;
        if (excess > 0) {
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        emit UsernameMinted(msg.sender, tokenId, loweredTld, loweredLabel, label);
        return tokenId;
    }

    /**
     * @dev Set the caller's primary username. Must be owned by caller.
     *      Pass tokenId = 0 to clear.
     */
    function setPrimary(uint256 tokenId) external {
        if (tokenId == 0) {
            delete primaryOf[msg.sender];
            emit PrimaryUpdated(msg.sender, 0);
            return;
        }
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        primaryOf[msg.sender] = tokenId;
        emit PrimaryUpdated(msg.sender, tokenId);
    }

    // --- Views ---

    function available(string calldata tld, string calldata label)
        external
        view
        returns (bool)
    {
        string memory loweredTld = _toLowerCase(tld);
        if (!allowedTld[loweredTld]) return false;

        if (!_isValidLabel(label)) return false;
        string memory loweredLabel = _toLowerCase(label);

        if (reservedLabelHashes[keccak256(bytes(loweredLabel))]) return false;

        return !tokenExists[_composeTokenId(loweredTld, loweredLabel)];
    }

    function tokenIdOf(string calldata tld, string calldata label)
        external
        view
        returns (uint256)
    {
        return _composeTokenId(_toLowerCase(tld), _toLowerCase(label));
    }

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    // --- Admin ---

    function setTldAllowed(string calldata tld, bool allowed) external onlyOwner {
        string memory lowered = _toLowerCase(tld);
        allowedTld[lowered] = allowed;
        emit TldAllowed(lowered, allowed);
    }

    function setReserved(string calldata label, bool reserved) external onlyOwner {
        string memory lowered = _toLowerCase(label);
        reservedLabelHashes[keccak256(bytes(lowered))] = reserved;
        emit ReservedLabelUpdated(lowered, reserved);
    }

    function setReservedBatch(string[] calldata labels, bool reserved) external onlyOwner {
        for (uint256 i = 0; i < labels.length; i++) {
            string memory lowered = _toLowerCase(labels[i]);
            reservedLabelHashes[keccak256(bytes(lowered))] = reserved;
            emit ReservedLabelUpdated(lowered, reserved);
        }
    }

    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
        emit MintFeeUpdated(newFee);
    }

    function setTreasury(address payable newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury required");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    function setContractURI(string calldata newURI) external onlyOwner {
        _contractURI = newURI;
        emit ContractURIUpdated(newURI);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Internal ---

    function _composeTokenId(string memory tld, string memory label)
        internal
        pure
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(tld, ".", label)));
    }

    function _validateLabel(string calldata label) internal pure {
        require(_isValidLabel(label), "Invalid label");
    }

    function _isValidLabel(string memory label) internal pure returns (bool) {
        bytes memory b = bytes(label);
        uint256 len = b.length;
        if (len < LABEL_MIN_LENGTH || len > LABEL_MAX_LENGTH) return false;

        for (uint256 i = 0; i < len; i++) {
            bytes1 c = b[i];
            bool ok =
                (c >= 0x30 && c <= 0x39) || // 0-9
                (c >= 0x41 && c <= 0x5A) || // A-Z
                (c >= 0x61 && c <= 0x7A) || // a-z
                c == 0x5F || // _
                c == 0x2D;   // -
            if (!ok) return false;
        }
        return true;
    }

    function _toLowerCase(string memory input) internal pure returns (string memory) {
        bytes memory b = bytes(input);
        bytes memory out = new bytes(b.length);
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            if (c >= 0x41 && c <= 0x5A) {
                out[i] = bytes1(uint8(c) + 32);
            } else {
                out[i] = c;
            }
        }
        return string(out);
    }

    // --- Required overrides ---

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        whenNotPaused
        returns (address)
    {
        address from = _ownerOf(tokenId);
        address resolved = super._update(to, tokenId, auth);

        // If the previous owner had this as primary, clear it on transfer out.
        if (from != address(0) && from != to && primaryOf[from] == tokenId) {
            delete primaryOf[from];
            emit PrimaryUpdated(from, 0);
        }

        return resolved;
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
        override(ERC721, ERC721URIStorage, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
