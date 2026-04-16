// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CloddyTokenGate
 * @dev Token-gated access control for Cloddy groups and features
 *
 * Gate Types:
 * 1. ERC-20: Minimum token balance required
 * 2. ERC-721: Own any NFT from collection
 * 3. ERC-1155: Own specific badge/item
 * 4. Combined: Multiple requirements
 */
contract CloddyTokenGate is AccessControl, Pausable {
    bytes32 public constant GATE_MANAGER_ROLE = keccak256("GATE_MANAGER_ROLE");

    enum TokenType { ERC20, ERC721, ERC1155 }
    enum GateLogic { ANY, ALL } // ANY = meet any requirement, ALL = meet all requirements

    struct GateRequirement {
        TokenType tokenType;
        address tokenAddress;
        uint256 tokenId;       // For ERC1155 only
        uint256 minAmount;     // Min balance for ERC20, min count for NFTs
        bool active;
    }

    struct Gate {
        bytes32 groupId;
        address owner;
        GateLogic logic;
        bool active;
        uint256[] requirementIds;
    }

    mapping(bytes32 => Gate) public gates;
    mapping(uint256 => GateRequirement) public requirements;

    uint256 public nextRequirementId = 1;

    // Events
    event GateCreated(bytes32 indexed groupId, address indexed owner, GateLogic logic);
    event GateUpdated(bytes32 indexed groupId);
    event GateRemoved(bytes32 indexed groupId);
    event RequirementAdded(bytes32 indexed groupId, uint256 requirementId);
    event AccessChecked(bytes32 indexed groupId, address indexed user, bool hasAccess);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GATE_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new gate for a group
     * @param groupId Unique identifier for the group
     * @param logic Gate logic (ANY or ALL)
     */
    function createGate(
        bytes32 groupId,
        GateLogic logic
    ) external onlyRole(GATE_MANAGER_ROLE) whenNotPaused {
        require(gates[groupId].owner == address(0), "Gate already exists");

        gates[groupId] = Gate({
            groupId: groupId,
            owner: msg.sender,
            logic: logic,
            active: true,
            requirementIds: new uint256[](0)
        });

        emit GateCreated(groupId, msg.sender, logic);
    }

    /**
     * @dev Add an ERC20 token requirement to a gate
     * @param groupId Group ID
     * @param tokenAddress Token contract address
     * @param minAmount Minimum balance required
     */
    function addERC20Requirement(
        bytes32 groupId,
        address tokenAddress,
        uint256 minAmount
    ) external onlyRole(GATE_MANAGER_ROLE) whenNotPaused {
        require(gates[groupId].active, "Gate not active");
        require(minAmount > 0, "Min amount must be > 0");

        uint256 reqId = nextRequirementId++;

        requirements[reqId] = GateRequirement({
            tokenType: TokenType.ERC20,
            tokenAddress: tokenAddress,
            tokenId: 0,
            minAmount: minAmount,
            active: true
        });

        gates[groupId].requirementIds.push(reqId);

        emit RequirementAdded(groupId, reqId);
    }

    /**
     * @dev Add an ERC721 NFT requirement to a gate
     * @param groupId Group ID
     * @param nftAddress NFT contract address
     * @param minCount Minimum number of NFTs required
     */
    function addERC721Requirement(
        bytes32 groupId,
        address nftAddress,
        uint256 minCount
    ) external onlyRole(GATE_MANAGER_ROLE) whenNotPaused {
        require(gates[groupId].active, "Gate not active");
        require(minCount > 0, "Min count must be > 0");

        uint256 reqId = nextRequirementId++;

        requirements[reqId] = GateRequirement({
            tokenType: TokenType.ERC721,
            tokenAddress: nftAddress,
            tokenId: 0,
            minAmount: minCount,
            active: true
        });

        gates[groupId].requirementIds.push(reqId);

        emit RequirementAdded(groupId, reqId);
    }

    /**
     * @dev Add an ERC1155 badge requirement to a gate
     * @param groupId Group ID
     * @param badgeAddress Badge contract address
     * @param badgeId Specific badge ID required
     * @param minAmount Minimum balance required
     */
    function addERC1155Requirement(
        bytes32 groupId,
        address badgeAddress,
        uint256 badgeId,
        uint256 minAmount
    ) external onlyRole(GATE_MANAGER_ROLE) whenNotPaused {
        require(gates[groupId].active, "Gate not active");
        require(minAmount > 0, "Min amount must be > 0");

        uint256 reqId = nextRequirementId++;

        requirements[reqId] = GateRequirement({
            tokenType: TokenType.ERC1155,
            tokenAddress: badgeAddress,
            tokenId: badgeId,
            minAmount: minAmount,
            active: true
        });

        gates[groupId].requirementIds.push(reqId);

        emit RequirementAdded(groupId, reqId);
    }

    /**
     * @dev Check if a user has access to a gated group
     * @param user Address to check
     * @param groupId Group ID
     * @return hasAccess Whether user meets requirements
     */
    function checkAccess(address user, bytes32 groupId) external view returns (bool hasAccess) {
        Gate storage gate = gates[groupId];

        if (!gate.active || gate.requirementIds.length == 0) {
            return true; // No gate or no requirements = open access
        }

        uint256 metCount = 0;

        for (uint256 i = 0; i < gate.requirementIds.length; i++) {
            GateRequirement storage req = requirements[gate.requirementIds[i]];

            if (!req.active) continue;

            bool met = false;

            if (req.tokenType == TokenType.ERC20) {
                met = IERC20(req.tokenAddress).balanceOf(user) >= req.minAmount;
            } else if (req.tokenType == TokenType.ERC721) {
                met = IERC721(req.tokenAddress).balanceOf(user) >= req.minAmount;
            } else if (req.tokenType == TokenType.ERC1155) {
                met = IERC1155(req.tokenAddress).balanceOf(user, req.tokenId) >= req.minAmount;
            }

            if (met) {
                metCount++;

                // For ANY logic, one match is enough
                if (gate.logic == GateLogic.ANY) {
                    return true;
                }
            } else {
                // For ALL logic, one failure means no access
                if (gate.logic == GateLogic.ALL) {
                    return false;
                }
            }
        }

        // For ALL logic, all must be met
        if (gate.logic == GateLogic.ALL) {
            return metCount == gate.requirementIds.length;
        }

        return false;
    }

    /**
     * @dev Update gate logic
     * @param groupId Group ID
     * @param newLogic New gate logic
     */
    function updateGateLogic(
        bytes32 groupId,
        GateLogic newLogic
    ) external onlyRole(GATE_MANAGER_ROLE) {
        require(gates[groupId].active, "Gate not active");
        gates[groupId].logic = newLogic;
        emit GateUpdated(groupId);
    }

    /**
     * @dev Deactivate a requirement
     * @param requirementId Requirement ID
     */
    function deactivateRequirement(uint256 requirementId) external onlyRole(GATE_MANAGER_ROLE) {
        requirements[requirementId].active = false;
    }

    /**
     * @dev Remove a gate
     * @param groupId Group ID
     */
    function removeGate(bytes32 groupId) external onlyRole(GATE_MANAGER_ROLE) {
        require(gates[groupId].active, "Gate not active");
        gates[groupId].active = false;
        emit GateRemoved(groupId);
    }

    /**
     * @dev Get gate requirements
     * @param groupId Group ID
     * @return requirementIds Array of requirement IDs
     */
    function getGateRequirements(bytes32 groupId) external view returns (uint256[] memory) {
        return gates[groupId].requirementIds;
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
