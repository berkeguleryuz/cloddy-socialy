import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/username";

const BodySchema = z.object({
  tokenId: z.string().min(1),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
  tld: z.string().min(1),
  label: z.string().min(1),
  metadataUri: z.string().min(1),
  mintFeeWei: z.string().optional(),
  setPrimary: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId || !session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const validation = validateUsername(body.label);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid label", reason: validation.reason },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const loweredTld = body.tld.toLowerCase();
    const setPrimary = body.setPrimary ?? true;

    // If making this the primary username, unset any existing primary for owner.
    if (setPrimary) {
      const { error: clearError } = await (supabase as any)
        .from("username_nfts")
        .update({ is_primary: false })
        .eq("owner_address", session.walletAddress.toLowerCase())
        .eq("is_primary", true);
      if (clearError) {
        console.error("Failed to clear previous primary:", clearError);
      }
    }

    const { data, error } = await (supabase as any)
      .from("username_nfts")
      .upsert(
        {
          owner_id: session.userId,
          owner_address: session.walletAddress.toLowerCase(),
          token_id: body.tokenId,
          contract_address: body.contractAddress.toLowerCase(),
          chain_id: body.chainId,
          tx_hash: body.txHash,
          tld: loweredTld,
          label: validation.handle,
          display: validation.display,
          metadata_url: body.metadataUri,
          mint_fee_wei: body.mintFeeWei ?? null,
          is_primary: setPrimary,
        },
        { onConflict: "chain_id,contract_address,tld,label" }
      )
      .select()
      .single();

    if (error) {
      console.error("Username index error:", error);
      return NextResponse.json(
        { error: "Failed to index username" },
        { status: 500 }
      );
    }

    return NextResponse.json({ username: data });
  } catch (error) {
    console.error("Username mint POST error:", error);
    return NextResponse.json({ error: "Mint indexing failed" }, { status: 500 });
  }
}
