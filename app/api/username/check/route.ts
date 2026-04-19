import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/username";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const label = searchParams.get("label") ?? "";
  const tld = (searchParams.get("tld") ?? "cloddy").toLowerCase();

  const result = validateUsername(label);
  if (!result.valid) {
    return NextResponse.json(
      { available: false, reason: result.reason },
      { status: 200 }
    );
  }

  const supabase = await createAdminClient();
  if (!supabase) {
    // DB unavailable — fall back to format-only check.
    return NextResponse.json({ available: true, reason: null });
  }

  const { data, error } = await (supabase as any)
    .from("username_nfts")
    .select("id")
    .eq("tld", tld)
    .eq("label", result.handle)
    .limit(1);

  if (error) {
    return NextResponse.json(
      { available: false, reason: "lookup_failed" },
      { status: 500 }
    );
  }

  const taken = Array.isArray(data) && data.length > 0;
  return NextResponse.json({
    available: !taken,
    reason: taken ? "taken" : null,
    handle: result.handle,
    display: result.display,
    tld,
  });
}
