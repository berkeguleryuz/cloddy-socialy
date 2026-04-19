/**
 * Pinata IPFS client (server-only).
 *
 * Uses the JWT auth flow described in https://docs.pinata.cloud/
 * Exposes small helpers: pin a file buffer, pin a JSON blob, resolve gateway URL.
 */

const PINATA_API_BASE = "https://api.pinata.cloud";

function requireJwt(): string {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error(
      "PINATA_JWT is not configured. Add it to .env.local to enable IPFS uploads."
    );
  }
  return jwt;
}

export interface PinResult {
  ipfsHash: string; // "Qm..." or "bafy..."
  uri: string; // ipfs://<hash>
  gatewayUrl: string; // https URL resolved via NEXT_PUBLIC_PINATA_GATEWAY
  size: number;
}

function buildGatewayUrl(hash: string): string {
  const base = process.env.NEXT_PUBLIC_PINATA_GATEWAY?.replace(/\/$/, "");
  if (base) return `${base}/ipfs/${hash}`;
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

export async function pinFile(
  file: Blob,
  name: string,
  metadata?: Record<string, string>
): Promise<PinResult> {
  const jwt = requireJwt();
  const form = new FormData();
  form.append("file", file, name);

  if (metadata && Object.keys(metadata).length > 0) {
    form.append(
      "pinataMetadata",
      JSON.stringify({ name, keyvalues: metadata })
    );
  }

  const response = await fetch(`${PINATA_API_BASE}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata pinFile failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    IpfsHash: string;
    PinSize: number;
  };

  return {
    ipfsHash: data.IpfsHash,
    uri: `ipfs://${data.IpfsHash}`,
    gatewayUrl: buildGatewayUrl(data.IpfsHash),
    size: data.PinSize,
  };
}

export async function pinJson<T extends object>(
  payload: T,
  name: string
): Promise<PinResult> {
  const jwt = requireJwt();

  const response = await fetch(`${PINATA_API_BASE}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataMetadata: { name },
      pinataContent: payload,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata pinJson failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    IpfsHash: string;
    PinSize: number;
  };

  return {
    ipfsHash: data.IpfsHash,
    uri: `ipfs://${data.IpfsHash}`,
    gatewayUrl: buildGatewayUrl(data.IpfsHash),
    size: data.PinSize,
  };
}

export function ipfsToHttp(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return buildGatewayUrl(uri.replace(/^ipfs:\/\//, ""));
  }
  return uri;
}
