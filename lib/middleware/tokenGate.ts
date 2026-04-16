import { createClient } from "@/lib/supabase/server";
import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";

// Contract addresses
const TOKEN_GATE_ADDRESS = process.env.NEXT_PUBLIC_CLODDY_TOKEN_GATE_ADDRESS;

// Simplified ABI for token checks
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const ERC721_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const ERC1155_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export type GateType = "ERC20" | "ERC721" | "ERC1155";

export interface TokenGateConfig {
  enabled: boolean;
  gateType: GateType;
  tokenAddress: string;
  minAmount: bigint;
  tokenId?: bigint; // For ERC1155
}

export interface GateCheckResult {
  hasAccess: boolean;
  balance: bigint;
  required: bigint;
  message: string;
}

// Create viem public client
function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
  });
}

/**
 * Check if a user has the required tokens for access
 */
export async function checkTokenGate(
  userAddress: Address,
  config: TokenGateConfig
): Promise<GateCheckResult> {
  if (!config.enabled) {
    return {
      hasAccess: true,
      balance: BigInt(0),
      required: BigInt(0),
      message: "No token gate configured",
    };
  }

  const publicClient = getPublicClient();
  let balance: bigint = BigInt(0);

  try {
    switch (config.gateType) {
      case "ERC20":
        balance = await publicClient.readContract({
          address: config.tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [userAddress],
        });
        break;

      case "ERC721":
        balance = await publicClient.readContract({
          address: config.tokenAddress as Address,
          abi: ERC721_ABI,
          functionName: "balanceOf",
          args: [userAddress],
        });
        break;

      case "ERC1155":
        if (config.tokenId === undefined) {
          throw new Error("Token ID required for ERC1155");
        }
        balance = await publicClient.readContract({
          address: config.tokenAddress as Address,
          abi: ERC1155_ABI,
          functionName: "balanceOf",
          args: [userAddress, config.tokenId],
        });
        break;
    }

    const hasAccess = balance >= config.minAmount;

    return {
      hasAccess,
      balance,
      required: config.minAmount,
      message: hasAccess
        ? "Access granted"
        : `Insufficient balance. Required: ${config.minAmount.toString()}, Current: ${balance.toString()}`,
    };
  } catch (error) {
    console.error("Token gate check failed:", error);
    return {
      hasAccess: false,
      balance: BigInt(0),
      required: config.minAmount,
      message: "Failed to check token balance",
    };
  }
}

/**
 * Check if a user can access a token-gated group
 */
export async function checkGroupAccess(
  userId: string,
  groupId: string
): Promise<GateCheckResult> {
  const supabase = await createClient() as any;
  if (!supabase) {
    return {
      hasAccess: false,
      balance: BigInt(0),
      required: BigInt(0),
      message: "Database not configured",
    };
  }

  // Get user's wallet address
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("id", userId)
    .single();

  if (userError || !user?.wallet_address) {
    return {
      hasAccess: false,
      balance: BigInt(0),
      required: BigInt(0),
      message: "User wallet not found",
    };
  }

  // Get group's token gate config
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("token_gate_enabled, gate_type, gate_token_address, gate_min_amount, gate_token_id")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return {
      hasAccess: false,
      balance: BigInt(0),
      required: BigInt(0),
      message: "Group not found",
    };
  }

  // If no token gate, allow access
  if (!group.token_gate_enabled) {
    return {
      hasAccess: true,
      balance: BigInt(0),
      required: BigInt(0),
      message: "Group is open to all",
    };
  }

  const config: TokenGateConfig = {
    enabled: true,
    gateType: group.gate_type as GateType,
    tokenAddress: group.gate_token_address,
    minAmount: BigInt(group.gate_min_amount || 1),
    tokenId: group.gate_token_id ? BigInt(group.gate_token_id) : undefined,
  };

  return checkTokenGate(user.wallet_address as Address, config);
}

/**
 * Middleware helper for API routes
 */
export async function requireTokenGate(
  userId: string,
  groupId: string
): Promise<{ allowed: boolean; error?: string }> {
  const result = await checkGroupAccess(userId, groupId);

  if (!result.hasAccess) {
    return {
      allowed: false,
      error: result.message,
    };
  }

  return { allowed: true };
}

/**
 * Cache token holdings in database for quick access
 */
export async function cacheTokenHolding(
  userId: string,
  tokenAddress: string,
  tokenType: GateType,
  balance: bigint,
  chainId: number = 84532 // Base Sepolia
) {
  const supabase = await createClient() as any;
  if (!supabase) return;

  await supabase.from("token_holdings").upsert(
    {
      user_id: userId,
      token_address: tokenAddress,
      token_type: tokenType,
      balance: balance.toString(),
      chain_id: chainId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,token_address,chain_id",
    }
  );
}
