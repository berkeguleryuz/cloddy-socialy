import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server";

const BodySchema = z.object({
  tokenId: z.string().min(1),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
  imageUri: z.string().min(1),
  metadataUri: z.string().min(1),
  mintFeeWei: z.string().optional(),
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

    const supabase = await createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const { data, error } = await (supabase as any)
      .from("pfp_nfts")
      .upsert(
        {
          owner_id: session.userId,
          owner_address: session.walletAddress.toLowerCase(),
          token_id: body.tokenId,
          contract_address: body.contractAddress.toLowerCase(),
          chain_id: body.chainId,
          tx_hash: body.txHash,
          image_url: body.imageUri,
          metadata_url: body.metadataUri,
          mint_fee_wei: body.mintFeeWei ?? null,
        },
        { onConflict: "contract_address,token_id,chain_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("PFP index error:", error);
      return NextResponse.json(
        { error: "Failed to index PFP" },
        { status: 500 }
      );
    }

    return NextResponse.json({ pfp: data });
  } catch (error) {
    console.error("PFP mint POST error:", error);
    return NextResponse.json({ error: "Mint indexing failed" }, { status: 500 });
  }
}
