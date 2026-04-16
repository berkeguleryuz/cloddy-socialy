// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title CloddyMarketplace
 * @dev Trustless marketplace for NFT trading on Cloddy platform
 *
 * Features:
 * - ERC-721 and ERC-1155 support
 * - Native ETH and ERC-20 payments
 * - Escrow mechanism
 * - Royalty support (ERC-2981)
 * - Platform fee (2.5%)
 */
contract CloddyMarketplace is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Fee configuration
    uint256 public platformFeeBps = 250; // 2.5%
    uint256 public constant MAX_FEE_BPS = 1000; // 10% max
    address public feeRecipient;

    // Listing types
    enum TokenType { ERC721, ERC1155 }
    enum ListingStatus { Active, Sold, Cancelled }

    // Listing structure
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 amount; // For ERC1155
        uint256 price;
        address paymentToken; // address(0) for ETH
        TokenType tokenType;
        ListingStatus status;
        uint256 createdAt;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId = 1;

    // User listings
    mapping(address => uint256[]) public userListings;

    // Events
    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        address paymentToken
    );
    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event ListingCancelled(uint256 indexed listingId);
    event PlatformFeeUpdated(uint256 newFeeBps);

    constructor(address _feeRecipient) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev List an ERC721 NFT for sale
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @param price Listing price
     * @param paymentToken Payment token (address(0) for ETH)
     */
    function listERC721(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    ) external whenNotPaused returns (uint256) {
        require(price > 0, "Price must be > 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "Not approved"
        );

        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            amount: 1,
            price: price,
            paymentToken: paymentToken,
            tokenType: TokenType.ERC721,
            status: ListingStatus.Active,
            createdAt: block.timestamp
        });

        userListings[msg.sender].push(listingId);

        emit ItemListed(listingId, msg.sender, nftContract, tokenId, 1, price, paymentToken);
        return listingId;
    }

    /**
     * @dev List an ERC1155 NFT for sale
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @param amount Amount to sell
     * @param price Listing price (per unit)
     * @param paymentToken Payment token (address(0) for ETH)
     */
    function listERC1155(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        address paymentToken
    ) external whenNotPaused returns (uint256) {
        require(price > 0, "Price must be > 0");
        require(amount > 0, "Amount must be > 0");

        IERC1155 nft = IERC1155(nftContract);
        require(nft.balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(nft.isApprovedForAll(msg.sender, address(this)), "Not approved");

        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            amount: amount,
            price: price,
            paymentToken: paymentToken,
            tokenType: TokenType.ERC1155,
            status: ListingStatus.Active,
            createdAt: block.timestamp
        });

        userListings[msg.sender].push(listingId);

        emit ItemListed(listingId, msg.sender, nftContract, tokenId, amount, price, paymentToken);
        return listingId;
    }

    /**
     * @dev Buy a listed item with ETH
     * @param listingId Listing ID
     */
    function buyWithETH(uint256 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];

        require(listing.status == ListingStatus.Active, "Not active");
        require(listing.paymentToken == address(0), "ETH not accepted");
        require(msg.value >= listing.price, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy own listing");

        _executeSale(listingId, msg.sender, msg.value);
    }

    /**
     * @dev Buy a listed item with ERC20
     * @param listingId Listing ID
     */
    function buyWithToken(uint256 listingId) external whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];

        require(listing.status == ListingStatus.Active, "Not active");
        require(listing.paymentToken != address(0), "Token not accepted");
        require(listing.seller != msg.sender, "Cannot buy own listing");

        IERC20 token = IERC20(listing.paymentToken);
        require(token.balanceOf(msg.sender) >= listing.price, "Insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= listing.price, "Insufficient allowance");

        // Transfer tokens from buyer to contract
        token.safeTransferFrom(msg.sender, address(this), listing.price);

        _executeSale(listingId, msg.sender, listing.price);
    }

    /**
     * @dev Execute the sale
     * @param listingId Listing ID
     * @param buyer Buyer address
     * @param payment Payment amount
     */
    function _executeSale(uint256 listingId, address buyer, uint256 payment) internal {
        Listing storage listing = listings[listingId];

        // Calculate fees
        uint256 platformFee = (payment * platformFeeBps) / 10000;
        uint256 royaltyAmount = 0;
        address royaltyRecipient = address(0);

        // Check for ERC2981 royalty
        if (_supportsInterface(listing.nftContract, type(IERC2981).interfaceId)) {
            (royaltyRecipient, royaltyAmount) = IERC2981(listing.nftContract).royaltyInfo(
                listing.tokenId,
                payment
            );
        }

        uint256 sellerProceeds = payment - platformFee - royaltyAmount;

        // Transfer NFT to buyer
        if (listing.tokenType == TokenType.ERC721) {
            IERC721(listing.nftContract).safeTransferFrom(listing.seller, buyer, listing.tokenId);
        } else {
            IERC1155(listing.nftContract).safeTransferFrom(
                listing.seller,
                buyer,
                listing.tokenId,
                listing.amount,
                ""
            );
        }

        // Transfer payments
        if (listing.paymentToken == address(0)) {
            // ETH payments
            _transferETH(listing.seller, sellerProceeds);
            _transferETH(feeRecipient, platformFee);
            if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
                _transferETH(royaltyRecipient, royaltyAmount);
            }
            // Refund excess
            if (payment > listing.price) {
                _transferETH(buyer, payment - listing.price);
            }
        } else {
            // Token payments
            IERC20 token = IERC20(listing.paymentToken);
            token.safeTransfer(listing.seller, sellerProceeds);
            token.safeTransfer(feeRecipient, platformFee);
            if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
                token.safeTransfer(royaltyRecipient, royaltyAmount);
            }
        }

        listing.status = ListingStatus.Sold;

        emit ItemSold(listingId, buyer, listing.seller, payment);
    }

    /**
     * @dev Cancel a listing
     * @param listingId Listing ID
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];

        require(listing.status == ListingStatus.Active, "Not active");
        require(listing.seller == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");

        listing.status = ListingStatus.Cancelled;

        emit ListingCancelled(listingId);
    }

    /**
     * @dev Update platform fee
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyRole(ADMIN_ROLE) {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    /**
     * @dev Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Transfer ETH safely
     */
    function _transferETH(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    /**
     * @dev Check if contract supports interface
     */
    function _supportsInterface(address contractAddr, bytes4 interfaceId) internal view returns (bool) {
        try IERC165(contractAddr).supportsInterface(interfaceId) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }

    /**
     * @dev Get active listings
     */
    function getActiveListings(uint256 offset, uint256 limit) external view returns (Listing[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextListingId && count < limit; i++) {
            if (listings[i].status == ListingStatus.Active) {
                count++;
            }
        }

        Listing[] memory result = new Listing[](count);
        uint256 index = 0;
        uint256 skipped = 0;

        for (uint256 i = 1; i < nextListingId && index < count; i++) {
            if (listings[i].status == ListingStatus.Active) {
                if (skipped >= offset) {
                    result[index++] = listings[i];
                } else {
                    skipped++;
                }
            }
        }

        return result;
    }

    /**
     * @dev Pause the contract
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Required for receiving ETH
    receive() external payable {}
}
