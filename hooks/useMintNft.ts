"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { decodeEventLog, formatEther, type Hash } from "viem";
import { CloddyPfpAbi } from "@/lib/web3/abis/CloddyPfp";
import { CloddyUsernameAbi } from "@/lib/web3/abis/CloddyUsername";
import { CONTRACT_ADDRESSES } from "@/hooks/useContracts";

export const MINT_FEE_ETH = "0.0077";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function isConfigured(address: string): address is `0x${string}` {
  return address !== ZERO_ADDRESS && /^0x[a-fA-F0-9]{40}$/.test(address);
}

export interface MintPfpArgs {
  /** ipfs://... metadata URI (OpenSea-compatible) */
  metadataURI: string;
  /** ipfs://... image URI — used purely for server-side DB indexing */
  imageURI: string;
  /** Override mint fee, defaults to on-chain fee read */
  feeWei?: bigint;
}

export function useMintPfp() {
  const { address, chainId } = useAccount();
  const pfpAddress = CONTRACT_ADDRESSES.CloddyPfp;
  const enabled = isConfigured(pfpAddress);

  const feeQuery = useReadContract({
    address: enabled ? (pfpAddress as `0x${string}`) : undefined,
    abi: CloddyPfpAbi,
    functionName: "mintFee",
    query: { enabled },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: signError,
    reset,
  } = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  });

  const [indexStatus, setIndexStatus] = useState<
    "idle" | "indexing" | "indexed" | "error"
  >("idle");
  const [indexError, setIndexError] = useState<string | null>(null);

  const indexOnServer = useCallback(
    async (args: {
      tokenId: string;
      txHash: Hash;
      imageURI: string;
      metadataURI: string;
      feeWei: bigint;
    }) => {
      if (!chainId) return;
      setIndexStatus("indexing");
      setIndexError(null);
      try {
        const response = await fetch("/api/mint/pfp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: args.tokenId,
            txHash: args.txHash,
            contractAddress: pfpAddress,
            chainId,
            imageUri: args.imageURI,
            metadataUri: args.metadataURI,
            mintFeeWei: args.feeWei.toString(),
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Index failed");
        }
        setIndexStatus("indexed");
      } catch (err) {
        setIndexStatus("error");
        setIndexError(err instanceof Error ? err.message : "Index failed");
      }
    },
    [chainId, pfpAddress]
  );

  const mint = useCallback(
    (args: MintPfpArgs) => {
      if (!enabled) throw new Error("PFP contract not configured");
      if (!address) throw new Error("Wallet not connected");
      reset();
      setIndexStatus("idle");
      setIndexError(null);
      const feeWei = args.feeWei ?? (feeQuery.data as bigint | undefined);
      if (feeWei === undefined) throw new Error("Mint fee unavailable");
      writeContract({
        address: pfpAddress as `0x${string}`,
        abi: CloddyPfpAbi,
        functionName: "mint",
        args: [args.metadataURI],
        value: feeWei,
      });
      return { feeWei, metadataURI: args.metadataURI, imageURI: args.imageURI };
    },
    [address, enabled, feeQuery.data, pfpAddress, reset, writeContract]
  );

  // Once receipt arrives with status success, extract tokenId from PfpMinted event, then index.
  useEffect(() => {
    if (!receipt.data || receipt.data.status !== "success" || !txHash) return;
    if (indexStatus !== "idle") return;
    const event = receipt.data.logs
      .map((log) => {
        try {
          return decodeEventLog({ abi: CloddyPfpAbi, ...log });
        } catch {
          return null;
        }
      })
      .find(
        (log): log is { eventName: "PfpMinted"; args: { minter: `0x${string}`; tokenId: bigint; tokenURI: string } } =>
          log?.eventName === "PfpMinted"
      );
    if (!event) return;
    const feeWei = (feeQuery.data as bigint | undefined) ?? 0n;
    void indexOnServer({
      tokenId: event.args.tokenId.toString(),
      txHash,
      imageURI: event.args.tokenURI,
      metadataURI: event.args.tokenURI,
      feeWei,
    });
  }, [receipt.data, txHash, indexStatus, feeQuery.data, indexOnServer]);

  return useMemo(
    () => ({
      mint,
      mintFeeWei: feeQuery.data as bigint | undefined,
      mintFeeEth: feeQuery.data
        ? formatEther(feeQuery.data as bigint)
        : MINT_FEE_ETH,
      isConfigured: enabled,
      txHash,
      isSigning,
      signError,
      isConfirming: receipt.isLoading,
      isConfirmed:
        receipt.data?.status === "success" && indexStatus === "indexed",
      indexStatus,
      indexError,
      reset: () => {
        reset();
        setIndexStatus("idle");
        setIndexError(null);
      },
    }),
    [
      mint,
      feeQuery.data,
      enabled,
      txHash,
      isSigning,
      signError,
      receipt.isLoading,
      receipt.data?.status,
      indexStatus,
      indexError,
      reset,
    ]
  );
}

export interface MintUsernameArgs {
  tld: string;
  label: string;
  display: string;
  metadataURI: string;
  feeWei?: bigint;
  setPrimary?: boolean;
}

export function useMintUsername() {
  const { address, chainId } = useAccount();
  const usernameAddress = CONTRACT_ADDRESSES.CloddyUsername;
  const enabled = isConfigured(usernameAddress);

  const feeQuery = useReadContract({
    address: enabled ? (usernameAddress as `0x${string}`) : undefined,
    abi: CloddyUsernameAbi,
    functionName: "mintFee",
    query: { enabled },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: signError,
    reset,
  } = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  });

  const [pendingArgs, setPendingArgs] = useState<MintUsernameArgs | null>(null);
  const [indexStatus, setIndexStatus] = useState<
    "idle" | "indexing" | "indexed" | "error"
  >("idle");
  const [indexError, setIndexError] = useState<string | null>(null);

  const indexOnServer = useCallback(
    async (args: {
      tokenId: string;
      txHash: Hash;
      tld: string;
      label: string;
      display: string;
      metadataURI: string;
      feeWei: bigint;
      setPrimary: boolean;
    }) => {
      if (!chainId) return;
      setIndexStatus("indexing");
      setIndexError(null);
      try {
        const response = await fetch("/api/mint/username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: args.tokenId,
            txHash: args.txHash,
            contractAddress: usernameAddress,
            chainId,
            tld: args.tld,
            label: args.display,
            metadataUri: args.metadataURI,
            mintFeeWei: args.feeWei.toString(),
            setPrimary: args.setPrimary,
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Index failed");
        }
        setIndexStatus("indexed");
      } catch (err) {
        setIndexStatus("error");
        setIndexError(err instanceof Error ? err.message : "Index failed");
      }
    },
    [chainId, usernameAddress]
  );

  const mint = useCallback(
    (args: MintUsernameArgs) => {
      if (!enabled) throw new Error("Username contract not configured");
      if (!address) throw new Error("Wallet not connected");
      reset();
      setIndexStatus("idle");
      setIndexError(null);
      setPendingArgs(args);
      const feeWei = args.feeWei ?? (feeQuery.data as bigint | undefined);
      if (feeWei === undefined) throw new Error("Mint fee unavailable");
      writeContract({
        address: usernameAddress as `0x${string}`,
        abi: CloddyUsernameAbi,
        functionName: "mint",
        args: [args.tld, args.display, args.metadataURI],
        value: feeWei,
      });
    },
    [address, enabled, feeQuery.data, usernameAddress, reset, writeContract]
  );

  useEffect(() => {
    if (!receipt.data || receipt.data.status !== "success" || !txHash) return;
    if (!pendingArgs) return;
    if (indexStatus !== "idle") return;
    const event = receipt.data.logs
      .map((log) => {
        try {
          return decodeEventLog({ abi: CloddyUsernameAbi, ...log });
        } catch {
          return null;
        }
      })
      .find(
        (log): log is {
          eventName: "UsernameMinted";
          args: {
            owner: `0x${string}`;
            tokenId: bigint;
            tld: string;
            label: string;
            display: string;
          };
        } => log?.eventName === "UsernameMinted"
      );
    if (!event) return;
    const feeWei = (feeQuery.data as bigint | undefined) ?? 0n;
    void indexOnServer({
      tokenId: event.args.tokenId.toString(),
      txHash,
      tld: event.args.tld,
      label: event.args.label,
      display: event.args.display,
      metadataURI: pendingArgs.metadataURI,
      feeWei,
      setPrimary: pendingArgs.setPrimary ?? true,
    });
  }, [receipt.data, txHash, pendingArgs, indexStatus, feeQuery.data, indexOnServer]);

  return useMemo(
    () => ({
      mint,
      mintFeeWei: feeQuery.data as bigint | undefined,
      mintFeeEth: feeQuery.data
        ? formatEther(feeQuery.data as bigint)
        : MINT_FEE_ETH,
      isConfigured: enabled,
      txHash,
      isSigning,
      signError,
      isConfirming: receipt.isLoading,
      isConfirmed:
        receipt.data?.status === "success" && indexStatus === "indexed",
      indexStatus,
      indexError,
      reset: () => {
        reset();
        setPendingArgs(null);
        setIndexStatus("idle");
        setIndexError(null);
      },
    }),
    [
      mint,
      feeQuery.data,
      enabled,
      txHash,
      isSigning,
      signError,
      receipt.isLoading,
      receipt.data?.status,
      indexStatus,
      indexError,
      reset,
    ]
  );
}

/**
 * Lightweight client helper: upload image + metadata to IPFS via our server route.
 * Server route forwards to Pinata.
 */
export async function uploadNftAssets(params: {
  file: File;
  name: string;
  description?: string;
  kind: "pfp" | "username";
  attributes?: { trait_type: string; value: string | number }[];
}): Promise<{
  imageUri: string;
  imageGateway: string;
  metadataUri: string;
  metadataGateway: string;
}> {
  const form = new FormData();
  form.append("file", params.file);
  form.append("name", params.name);
  form.append("kind", params.kind);
  if (params.description) form.append("description", params.description);
  if (params.attributes) {
    form.append("attributes", JSON.stringify(params.attributes));
  }

  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Upload failed");
  }

  return response.json();
}
