import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";

// Contract addresses - Update after deployment to Base Sepolia
export const CONTRACT_ADDRESSES = {
  CloddyToken: process.env.NEXT_PUBLIC_CLODDY_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  CloddyProfile: process.env.NEXT_PUBLIC_CLODDY_PROFILE_ADDRESS || "0x0000000000000000000000000000000000000000",
  CloddyBadges: process.env.NEXT_PUBLIC_CLODDY_BADGES_ADDRESS || "0x0000000000000000000000000000000000000000",
  CloddyReputation: process.env.NEXT_PUBLIC_CLODDY_REPUTATION_ADDRESS || "0x0000000000000000000000000000000000000000",
  CloddyMarketplace: process.env.NEXT_PUBLIC_CLODDY_MARKETPLACE_ADDRESS || "0x0000000000000000000000000000000000000000",
  CloddyTokenGate: process.env.NEXT_PUBLIC_CLODDY_TOKEN_GATE_ADDRESS || "0x0000000000000000000000000000000000000000",
  CloddyEquippable: process.env.NEXT_PUBLIC_CLODDY_EQUIPPABLE_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

// Chain ID for Base Sepolia
export const CHAIN_ID = 84532;

// Simplified ABIs - Only essential functions
const CloddyProfileABI = [
  {
    name: "createProfile",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "username", type: "string" }, { name: "metadataURI", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "addressToTokenId",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getProfileByAddress",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "tokenId", type: "uint256" },
      {
        name: "profile",
        type: "tuple",
        components: [
          { name: "reputation", type: "uint256" },
          { name: "level", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "lastActiveAt", type: "uint256" },
          { name: "isSoulbound", type: "bool" },
          { name: "username", type: "string" },
        ],
      },
    ],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "profiles",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "reputation", type: "uint256" },
      { name: "level", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "lastActiveAt", type: "uint256" },
      { name: "isSoulbound", type: "bool" },
      { name: "username", type: "string" },
    ],
  },
] as const;

const CloddyBadgesABI = [
  {
    name: "mintBadge",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }, { name: "badgeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }, { name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "badges",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "badgeId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "xpReward", type: "uint256" },
      { name: "isSoulbound", type: "bool" },
      { name: "maxSupply", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "hasBadge",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getUserBadges",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "badgeIds", type: "uint256[]" }],
  },
  {
    name: "getBadgeHolderCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "badgeId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const CloddyReputationABI = [
  {
    name: "getXP",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalXP", type: "uint256" },
      { name: "level", type: "uint256" },
      { name: "progressPercent", type: "uint256" },
    ],
  },
  {
    name: "userXP",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "totalXP", type: "uint256" },
      { name: "level", type: "uint256" },
      { name: "lastActionAt", type: "uint256" },
      { name: "actionsToday", type: "uint256" },
    ],
  },
  {
    name: "getLeaderboard",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "limit", type: "uint256" }],
    outputs: [
      { name: "users", type: "address[]" },
      { name: "xps", type: "uint256[]" },
    ],
  },
  {
    name: "getUserRank",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "xpForNextLevel",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const CloddyTokenABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "stake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "unstake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "stakedBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "stakingTimestamp",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "pendingRewards",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "claimRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "totalStaked",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Profile Hooks
export function useHasProfile(address: `0x${string}` | undefined) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.CloddyProfile as `0x${string}`,
    abi: CloddyProfileABI,
    functionName: "addressToTokenId",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    ...result,
    data: result.data ? result.data > BigInt(0) : false,
  };
}

export function useProfileTokenId(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyProfile as `0x${string}`,
    abi: CloddyProfileABI,
    functionName: "addressToTokenId",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useProfile(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyProfile as `0x${string}`,
    abi: CloddyProfileABI,
    functionName: "getProfileByAddress",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useCreateProfile() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (username: string, metadataURI: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyProfile as `0x${string}`,
      abi: CloddyProfileABI,
      functionName: "createProfile",
      args: [username, metadataURI],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error };
}

// Legacy alias for backward compatibility
export function useMintProfile() {
  const { create, hash, isPending, isConfirming, isSuccess, error } = useCreateProfile();
  return { mint: create, hash, isPending, isConfirming, isSuccess, error };
}

// Badge Hooks
export function useHasBadge(address: `0x${string}` | undefined, badgeId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyBadges as `0x${string}`,
    abi: CloddyBadgesABI,
    functionName: "hasBadge",
    args: address ? [address, BigInt(badgeId)] : undefined,
    query: { enabled: !!address },
  });
}

export function useUserBadges(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyBadges as `0x${string}`,
    abi: CloddyBadgesABI,
    functionName: "getUserBadges",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useBadgeInfo(badgeId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyBadges as `0x${string}`,
    abi: CloddyBadgesABI,
    functionName: "badges",
    args: [BigInt(badgeId)],
  });
}

export function useBadgeHolderCount(badgeId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyBadges as `0x${string}`,
    abi: CloddyBadgesABI,
    functionName: "getBadgeHolderCount",
    args: [BigInt(badgeId)],
  });
}

export function useMintBadge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Note: mintBadge requires MINTER_ROLE - only backend/admin can call this
  const mint = (to: `0x${string}`, badgeId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyBadges as `0x${string}`,
      abi: CloddyBadgesABI,
      functionName: "mintBadge",
      args: [to, BigInt(badgeId)],
    });
  };

  return { mint, hash, isPending, isConfirming, isSuccess, error };
}

// Reputation Hooks
export function useXP(address: `0x${string}` | undefined) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.CloddyReputation as `0x${string}`,
    abi: CloddyReputationABI,
    functionName: "getXP",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Parse the tuple return into a more usable format
  const data = result.data as [bigint, bigint, bigint] | undefined;
  return {
    ...result,
    totalXP: data ? Number(data[0]) : 0,
    level: data ? Number(data[1]) : 0,
    progressPercent: data ? Number(data[2]) : 0,
  };
}

export function useLevel(address: `0x${string}` | undefined) {
  // Level is included in getXP return, so we use that
  const xpData = useXP(address);
  return {
    ...xpData,
    data: xpData.level,
  };
}

export function useUserRank(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyReputation as `0x${string}`,
    abi: CloddyReputationABI,
    functionName: "getUserRank",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useXPForNextLevel(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyReputation as `0x${string}`,
    abi: CloddyReputationABI,
    functionName: "xpForNextLevel",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useLeaderboard(limit: number = 10) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyReputation as `0x${string}`,
    abi: CloddyReputationABI,
    functionName: "getLeaderboard",
    args: [BigInt(limit)],
  });
}

// Token Hooks
export function useTokenBalance(address: `0x${string}` | undefined) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
    abi: CloddyTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    ...result,
    formatted: result.data ? formatEther(result.data) : "0",
  };
}

export function useStakedBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
    abi: CloddyTokenABI,
    functionName: "stakedBalance",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useStakingTimestamp(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
    abi: CloddyTokenABI,
    functionName: "stakingTimestamp",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function usePendingRewards(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
    abi: CloddyTokenABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useTotalStaked() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
    abi: CloddyTokenABI,
    functionName: "totalStaked",
  });
}

// Combined stake info hook for convenience
export function useStakeInfo(address: `0x${string}` | undefined) {
  const stakedResult = useStakedBalance(address);
  const timestampResult = useStakingTimestamp(address);
  const rewardsResult = usePendingRewards(address);

  return {
    stakedBalance: stakedResult.data,
    stakingTimestamp: timestampResult.data,
    pendingRewards: rewardsResult.data,
    isLoading: stakedResult.isLoading || timestampResult.isLoading || rewardsResult.isLoading,
    error: stakedResult.error || timestampResult.error || rewardsResult.error,
    refetch: () => {
      stakedResult.refetch();
      timestampResult.refetch();
      rewardsResult.refetch();
    },
  };
}

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
      abi: CloddyTokenABI,
      functionName: "stake",
      args: [parseEther(amount)],
    });
  };

  return { stake, hash, isPending, isConfirming, isSuccess, error };
}

export function useUnstake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unstake = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
      abi: CloddyTokenABI,
      functionName: "unstake",
      args: [parseEther(amount)],
    });
  };

  return { unstake, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaimRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyToken as `0x${string}`,
      abi: CloddyTokenABI,
      functionName: "claimRewards",
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error };
}

// Equippable Hooks
const CloddyEquippableABI = [
  {
    name: "mintAccessory",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "to", type: "address" },
      { name: "accessoryTypeId", type: "uint256" },
      { name: "tokenURI_", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "equip",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "accessoryTokenId", type: "uint256" },
      { name: "_profileContract", type: "address" },
      { name: "profileTokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "unequip",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "accessoryTokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getEquippedAccessories",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_profileContract", type: "address" },
      { name: "profileTokenId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getAccessory",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "slotType", type: "uint8" },
      { name: "rarity", type: "uint256" },
      { name: "isEquipped", type: "bool" },
      { name: "equippedToProfile", type: "uint256" },
      { name: "profileContract_", type: "address" },
    ],
  },
  {
    name: "accessoryTypes",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "typeId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "slotType", type: "uint8" },
      { name: "rarity", type: "uint256" },
      { name: "baseURI", type: "string" },
      { name: "maxSupply", type: "uint256" },
      { name: "currentSupply", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useEquippedAccessories(profileContract: `0x${string}` | undefined, profileTokenId: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyEquippable as `0x${string}`,
    abi: CloddyEquippableABI,
    functionName: "getEquippedAccessories",
    args: profileContract && profileTokenId !== undefined ? [profileContract, BigInt(profileTokenId)] : undefined,
    query: { enabled: !!profileContract && profileTokenId !== undefined },
  });
}

export function useAccessoryInfo(tokenId: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyEquippable as `0x${string}`,
    abi: CloddyEquippableABI,
    functionName: "getAccessory",
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

export function useAccessoryType(typeId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyEquippable as `0x${string}`,
    abi: CloddyEquippableABI,
    functionName: "accessoryTypes",
    args: [BigInt(typeId)],
  });
}

export function useMintAccessory() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = (to: `0x${string}`, accessoryTypeId: number, tokenURI: string, price: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyEquippable as `0x${string}`,
      abi: CloddyEquippableABI,
      functionName: "mintAccessory",
      args: [to, BigInt(accessoryTypeId), tokenURI],
      value: price,
    });
  };

  return { mint, hash, isPending, isConfirming, isSuccess, error };
}

export function useEquipAccessory() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const equip = (accessoryTokenId: number, profileContract: `0x${string}`, profileTokenId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyEquippable as `0x${string}`,
      abi: CloddyEquippableABI,
      functionName: "equip",
      args: [BigInt(accessoryTokenId), profileContract, BigInt(profileTokenId)],
    });
  };

  return { equip, hash, isPending, isConfirming, isSuccess, error };
}

export function useUnequipAccessory() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unequip = (accessoryTokenId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyEquippable as `0x${string}`,
      abi: CloddyEquippableABI,
      functionName: "unequip",
      args: [BigInt(accessoryTokenId)],
    });
  };

  return { unequip, hash, isPending, isConfirming, isSuccess, error };
}

// =====================
// MARKETPLACE
// =====================

const CloddyMarketplaceABI = [
  {
    name: "listERC721",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "paymentToken", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "listERC1155",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "paymentToken", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "buyWithETH",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "buyWithToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelListing",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "listings",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [
      { name: "seller", type: "address" },
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "paymentToken", type: "address" },
      { name: "tokenType", type: "uint8" },
      { name: "status", type: "uint8" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    name: "userListings",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }, { name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "nextListingId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "platformFeeBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useListing(listingId: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
    abi: CloddyMarketplaceABI,
    functionName: "listings",
    args: listingId !== undefined ? [BigInt(listingId)] : undefined,
    query: { enabled: listingId !== undefined },
  });
}

export function useNextListingId() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
    abi: CloddyMarketplaceABI,
    functionName: "nextListingId",
  });
}

export function usePlatformFee() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
    abi: CloddyMarketplaceABI,
    functionName: "platformFeeBps",
  });
}

export function useListERC721() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const list = (nftContract: `0x${string}`, tokenId: number, price: bigint, paymentToken: `0x${string}` = "0x0000000000000000000000000000000000000000") => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
      abi: CloddyMarketplaceABI,
      functionName: "listERC721",
      args: [nftContract, BigInt(tokenId), price, paymentToken],
    });
  };

  return { list, hash, isPending, isConfirming, isSuccess, error };
}

export function useListERC1155() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const list = (nftContract: `0x${string}`, tokenId: number, amount: number, price: bigint, paymentToken: `0x${string}` = "0x0000000000000000000000000000000000000000") => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
      abi: CloddyMarketplaceABI,
      functionName: "listERC1155",
      args: [nftContract, BigInt(tokenId), BigInt(amount), price, paymentToken],
    });
  };

  return { list, hash, isPending, isConfirming, isSuccess, error };
}

export function useBuyWithETH() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buy = (listingId: number, price: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
      abi: CloddyMarketplaceABI,
      functionName: "buyWithETH",
      args: [BigInt(listingId)],
      value: price,
    });
  };

  return { buy, hash, isPending, isConfirming, isSuccess, error };
}

export function useBuyWithToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buy = (listingId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
      abi: CloddyMarketplaceABI,
      functionName: "buyWithToken",
      args: [BigInt(listingId)],
    });
  };

  return { buy, hash, isPending, isConfirming, isSuccess, error };
}

export function useCancelListing() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancel = (listingId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CloddyMarketplace as `0x${string}`,
      abi: CloddyMarketplaceABI,
      functionName: "cancelListing",
      args: [BigInt(listingId)],
    });
  };

  return { cancel, hash, isPending, isConfirming, isSuccess, error };
}

// =====================
// TOKEN GATE
// =====================

const CloddyTokenGateABI = [
  {
    name: "checkAccess",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "groupId", type: "bytes32" },
    ],
    outputs: [{ name: "hasAccess", type: "bool" }],
  },
  {
    name: "gates",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "bytes32" }],
    outputs: [
      { name: "groupId", type: "bytes32" },
      { name: "owner", type: "address" },
      { name: "logic", type: "uint8" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "requirements",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "requirementId", type: "uint256" }],
    outputs: [
      { name: "tokenType", type: "uint8" },
      { name: "tokenAddress", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "minAmount", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "getGateRequirements",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
] as const;

export function useCheckGateAccess(userAddress: `0x${string}` | undefined, groupId: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyTokenGate as `0x${string}`,
    abi: CloddyTokenGateABI,
    functionName: "checkAccess",
    args: userAddress && groupId ? [userAddress, groupId] : undefined,
    query: { enabled: !!userAddress && !!groupId },
  });
}

export function useGate(groupId: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyTokenGate as `0x${string}`,
    abi: CloddyTokenGateABI,
    functionName: "gates",
    args: groupId ? [groupId] : undefined,
    query: { enabled: !!groupId },
  });
}

export function useGateRequirements(groupId: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyTokenGate as `0x${string}`,
    abi: CloddyTokenGateABI,
    functionName: "getGateRequirements",
    args: groupId ? [groupId] : undefined,
    query: { enabled: !!groupId },
  });
}

export function useGateRequirement(requirementId: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CloddyTokenGate as `0x${string}`,
    abi: CloddyTokenGateABI,
    functionName: "requirements",
    args: requirementId !== undefined ? [BigInt(requirementId)] : undefined,
    query: { enabled: requirementId !== undefined },
  });
}
