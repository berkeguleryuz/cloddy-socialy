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
 * @title CloddyPfp
 * @dev Open-edition profile picture NFT collection for Cloddy.
 *
 * - ERC-721 + Enumerable + URIStorage + ERC-2981 royalties
 * - Transferable, OpenSea-compatible (contractURI + tokenURI + royalty info)
 * - Unlimited mints per wallet
 * - Flat mint fee forwarded to the treasury
 */
contract CloddyPfp is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    ERC2981,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    uint256 public mintFee;
    address payable public treasury;
    string private _contractURI;

    uint256 private _tokenIdCounter;

    event PfpMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );
    event MintFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);
    event ContractURIUpdated(string newURI);

    constructor(
        address payable _treasury,
        uint256 _mintFee,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator,
        string memory contractLevelURI
    ) ERC721("Cloddy PFP", "CLPFP") Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury required");
        treasury = _treasury;
        mintFee = _mintFee;
        _contractURI = contractLevelURI;
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    /**
     * @dev Mint a new PFP to msg.sender. Requires exact `mintFee` as msg.value.
     *      Any overpayment is refunded to the sender.
     */
    function mint(string calldata metadataURI)
        external
        payable
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Forward fee to treasury.
        (bool sent, ) = treasury.call{value: mintFee}("");
        require(sent, "Treasury transfer failed");

        // Refund any excess.
        uint256 excess = msg.value - mintFee;
        if (excess > 0) {
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        emit PfpMinted(msg.sender, tokenId, metadataURI);
        return tokenId;
    }

    /**
     * @dev Owner-only metadata update (for moderation / fix cases).
     *      Normal users cannot change metadata after mint.
     */
    function updateMetadata(uint256 tokenId, string calldata newURI)
        external
        onlyOwner
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newURI);
    }

    // --- Admin ---

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

    // --- Views ---

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // --- Required overrides ---

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        whenNotPaused
        returns (address)
    {
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
        override(ERC721, ERC721URIStorage, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
