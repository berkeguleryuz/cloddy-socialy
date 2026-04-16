import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";

// CloddyReputation contract ABI for reading XP
const REPUTATION_ABI = [
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
    name: "getUserRank",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
});

// GET - Get user's on-chain XP and sync with database
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's wallet address
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("wallet_address, experience_points, level")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.wallet_address) {
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_CLODDY_REPUTATION_ADDRESS;
    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      // Contract not deployed yet - return database values
      return NextResponse.json({
        onChain: null,
        database: {
          xp: userData.experience_points || 0,
          level: userData.level || 1,
        },
        synced: false,
        message: "Contract not deployed yet",
      });
    }

    // Fetch on-chain XP
    const [totalXP, level, progressPercent] = await publicClient.readContract({
      address: contractAddress as Address,
      abi: REPUTATION_ABI,
      functionName: "getXP",
      args: [userData.wallet_address as Address],
    });

    // Fetch rank
    const rank = await publicClient.readContract({
      address: contractAddress as Address,
      abi: REPUTATION_ABI,
      functionName: "getUserRank",
      args: [userData.wallet_address as Address],
    });

    const onChainXP = Number(totalXP);
    const onChainLevel = Number(level);
    const onChainRank = Number(rank);

    // Update database if on-chain XP is higher
    if (onChainXP > (userData.experience_points || 0)) {
      await supabase
        .from("users")
        .update({
          experience_points: onChainXP,
          level: onChainLevel,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      onChain: {
        xp: onChainXP,
        level: onChainLevel,
        progressPercent: Number(progressPercent),
        rank: onChainRank,
      },
      database: {
        xp: userData.experience_points || 0,
        level: userData.level || 1,
      },
      synced: true,
    });
  } catch (error) {
    console.error("XP sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync XP" },
      { status: 500 }
    );
  }
}

// POST - Record XP action and queue for on-chain sync
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, amount, reason } = body;

    if (!action || !amount) {
      return NextResponse.json({ error: "Missing action or amount" }, { status: 400 });
    }

    // XP amounts for different actions
    const XP_REWARDS: Record<string, number> = {
      post_created: 10,
      like_received: 2,
      comment_received: 5,
      friend_added: 15,
      badge_earned: 50,
      event_organized: 50,
      profile_updated: 5,
      first_login: 100,
    };

    const xpAmount = XP_REWARDS[action] || amount;

    // Update database XP (off-chain)
    const { data: userData } = await supabase
      .from("users")
      .select("experience_points, level")
      .eq("id", user.id)
      .single();

    const currentXP = userData?.experience_points || 0;
    const newXP = currentXP + xpAmount;
    const newLevel = calculateLevel(newXP);

    await supabase
      .from("users")
      .update({
        experience_points: newXP,
        level: newLevel,
      })
      .eq("id", user.id);

    // Log XP action for potential on-chain sync
    // Note: This table should exist via migration 20260124_blockchain_integration.sql
    try {
      await supabase.from("xp_transactions").insert({
        user_id: user.id,
        amount: xpAmount,
        action_type: action,
        reason: reason || action,
        source: "off_chain",
      });
    } catch {
      // Table might not exist yet, continue without logging
      console.warn("xp_transactions table not available");
    }

    return NextResponse.json({
      success: true,
      xpEarned: xpAmount,
      totalXP: newXP,
      level: newLevel,
      leveledUp: newLevel > (userData?.level || 1),
    });
  } catch (error) {
    console.error("XP add error:", error);
    return NextResponse.json(
      { error: "Failed to add XP" },
      { status: 500 }
    );
  }
}

// Calculate level from XP (100 * level^2)
function calculateLevel(xp: number): number {
  if (xp === 0) return 1;
  let level = 1;
  while (100 * level * level <= xp && level < 100) {
    level++;
  }
  return level;
}
