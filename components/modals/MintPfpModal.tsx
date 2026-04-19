"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMintPfp, uploadNftAssets } from "@/hooks/useMintNft";

interface MintPfpModalProps {
  open: boolean;
  onClose: () => void;
  onMinted?: () => void;
}

type Step = "choose" | "uploading" | "signing" | "indexing" | "success" | "error";

export default function MintPfpModal({ open, onClose, onMinted }: MintPfpModalProps) {
  const t = useTranslations("pfp");
  const tc = useTranslations("common");
  const {
    mint,
    mintFeeEth,
    isConfigured,
    isSigning,
    isConfirming,
    isConfirmed,
    signError,
    indexStatus,
    indexError,
    reset,
  } = useMintPfp();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [step, setStep] = useState<Step>("choose");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setName("");
      setStep("choose");
      setErrorMessage(null);
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    if (isSigning) setStep("signing");
  }, [isSigning]);

  useEffect(() => {
    if (isConfirming) setStep("indexing");
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      setStep("success");
      onMinted?.();
    }
  }, [isConfirmed, onMinted]);

  useEffect(() => {
    if (signError) {
      setErrorMessage(signError.message);
      setStep("error");
    }
  }, [signError]);

  useEffect(() => {
    if (indexStatus === "error" && indexError) {
      setErrorMessage(indexError);
      setStep("error");
    }
  }, [indexStatus, indexError]);

  const canMint = useMemo(
    () => Boolean(file && name.trim().length > 0 && isConfigured),
    [file, name, isConfigured]
  );

  const handleMint = useCallback(async () => {
    if (!file) return;
    setErrorMessage(null);
    setStep("uploading");
    try {
      const uploaded = await uploadNftAssets({
        file,
        name: name.trim(),
        kind: "pfp",
      });
      mint({ metadataURI: uploaded.metadataUri, imageURI: uploaded.imageUri });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
      setStep("error");
    }
  }, [file, name, mint]);

  const closeable = step === "choose" || step === "success" || step === "error";

  return (
    <Modal
      open={open}
      onClose={closeable ? onClose : () => undefined}
      title={t("title")}
      description={`${t("mintFee")}: ${mintFeeEth} ETH`}
      size="md"
      hideCloseButton={!closeable}
    >
      {step === "choose" && (
        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
              {t("upload")}
            </span>
            <div className="mt-1.5 relative rounded-xl border border-dashed border-border bg-background hover:border-primary/60 transition-colors cursor-pointer h-48 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={t("preview")}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-text-muted text-sm">
                  {t("upload")} (PNG, JPG, WebP · ≤10MB)
                </span>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
              {tc("edit")}
            </span>
            <input
              type="text"
              value={name}
              maxLength={48}
              onChange={(event) => setName(event.target.value)}
              placeholder="PFP name"
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-text-main placeholder:text-text-muted/60 focus:border-primary focus:outline-none"
            />
          </label>

          {!isConfigured && (
            <p className="text-xs text-accent-orange">
              PFP contract not configured. Set NEXT_PUBLIC_CLODDY_PFP_ADDRESS.
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              {tc("cancel")}
            </Button>
            <Button disabled={!canMint} onClick={handleMint}>
              {t("mintButton")}
            </Button>
          </div>
        </div>
      )}

      {(step === "uploading" || step === "signing" || step === "indexing") && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Spinner />
          <p className="text-sm text-text-muted">
            {step === "uploading"
              ? "Uploading to IPFS…"
              : step === "signing"
              ? "Confirm in wallet…"
              : "Waiting for confirmation…"}
          </p>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-text-main font-bold">{tc("success")}</p>
          <Button onClick={onClose}>{tc("close")}</Button>
        </div>
      )}

      {step === "error" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center text-accent-orange">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">{errorMessage ?? tc("error")}</p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              {tc("close")}
            </Button>
            <Button onClick={() => setStep("choose")}>{tc("retry")}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Spinner() {
  return (
    <svg
      className="w-8 h-8 animate-spin text-primary"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="40 20"
      />
    </svg>
  );
}
