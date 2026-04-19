import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { pinFile, pinJson } from "@/lib/ipfs/pinata";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

interface OpenSeaAttribute {
  trait_type: string;
  value: string | number;
}

interface OpenSeaMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: OpenSeaAttribute[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawName = String(formData.get("name") ?? "").trim();
    const rawDescription = String(formData.get("description") ?? "").trim();
    const kind = String(formData.get("kind") ?? "pfp"); // "pfp" | "username"
    const extraAttributesRaw = formData.get("attributes");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }
    if (!rawName) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    let attributes: OpenSeaAttribute[] = [];
    if (typeof extraAttributesRaw === "string" && extraAttributesRaw.length > 0) {
      try {
        const parsed = JSON.parse(extraAttributesRaw);
        if (Array.isArray(parsed)) {
          attributes = parsed.filter(
            (a): a is OpenSeaAttribute =>
              a &&
              typeof a === "object" &&
              typeof a.trait_type === "string" &&
              (typeof a.value === "string" || typeof a.value === "number")
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid attributes JSON" },
          { status: 400 }
        );
      }
    }

    // 1. Pin the image to IPFS.
    const image = await pinFile(file, `${kind}-${Date.now()}-${file.name}`, {
      userId: session.userId,
      kind,
    });

    // 2. Build OpenSea-compatible metadata.
    const metadata: OpenSeaMetadata = {
      name: rawName,
      description: rawDescription || `Cloddy ${kind.toUpperCase()} NFT`,
      image: image.uri,
      attributes: [
        { trait_type: "Kind", value: kind },
        { trait_type: "Minted By", value: session.walletAddress ?? session.userId },
        ...attributes,
      ],
    };

    const metadataPin = await pinJson(metadata, `${kind}-metadata-${Date.now()}.json`);

    return NextResponse.json({
      imageUri: image.uri,
      imageGateway: image.gatewayUrl,
      metadataUri: metadataPin.uri,
      metadataGateway: metadataPin.gatewayUrl,
      size: image.size,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "IPFS upload failed";
    console.error("IPFS upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
