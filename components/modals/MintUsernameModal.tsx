"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMintUsername, uploadNftAssets } from "@/hooks/useMintNft";
import { validateUsername, USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH } from "@/lib/username";

interface MintUsernameModalProps {
  open: boolean;
  onClose: () => void;
  defaultTld?: string;
  availableTlds?: string[];
  onMinted?: () => void;
}

type Step =
  | "choose"
  | "uploading"
  | "signing"
  | "indexing"
  | "success"
  | "error";

type Availability =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "unavailable"; reason: string };

export default function MintUsernameModal({
  open,
  onClose,
  defaultTld = "cloddy",
  availableTlds = ["cloddy"],
  onMinted,
}: MintUsernameModalProps) {
  const t = useTranslations("username");
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
  } = useMintUsername();

  const [label, setLabel] = useState("");
  const [tld, setTld] = useState(defaultTld);
  const [availability, setAvailability] = useState<Availability>({
    status: "idle",
  });
  const [step, setStep] = useState<Step>("choose");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLabel("");
      setTld(defaultTld);
      setAvailability({ status: "idle" });
      setStep("choose");
      setErrorMessage(null);
      reset();
    }
  }, [open, defaultTld, reset]);

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

  // Client-side validation + debounced availability check.
  const validation = useMemo(() => validateUsername(label), [label]);

  useEffect(() => {
    if (!open || label.trim().length === 0) {
      setAvailability({ status: "idle" });
      return;
    }
    if (!validation.valid) {
      setAvailability({ status: "unavailable", reason: validation.reason });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setAvailability({ status: "checking" });
      try {
        const response = await fetch(
          `/api/username/check?label=${encodeURIComponent(validation.display)}&tld=${encodeURIComponent(tld)}`,
          { signal: controller.signal }
        );
        const body = await response.json();
        if (body.available) {
          setAvailability({ status: "available" });
        } else {
          setAvailability({
            status: "unavailable",
            reason: body.reason ?? "taken",
          });
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          setAvailability({ status: "unavailable", reason: "lookup_failed" });
        }
      }
    }, 280);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, label, tld, validation]);

  const canMint =
    availability.status === "available" &&
    validation.valid &&
    isConfigured &&
    step === "choose";

  const handleMint = useCallback(async () => {
    if (!validation.valid) return;
    setErrorMessage(null);
    setStep("uploading");
    try {
      // Build a lightweight text-image for the username NFT so OpenSea shows something.
      const svg = buildUsernameSvg(`${validation.display}.${tld}`);
      const file = new File([svg], `${validation.handle}.${tld}.svg`, {
        type: "image/svg+xml",
      });
      const uploaded = await uploadNftAssets({
        file,
        name: `${validation.display}.${tld}`,
        kind: "username",
        attributes: [
          { trait_type: "TLD", value: tld },
          { trait_type: "Label", value: validation.handle },
          { trait_type: "Length", value: validation.handle.length },
        ],
        description: `Cloddy username NFT: ${validation.display}.${tld}`,
      });
      mint({
        tld,
        label: validation.handle,
        display: validation.display,
        metadataURI: uploaded.metadataUri,
        setPrimary: true,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
      setStep("error");
    }
  }, [validation, tld, mint]);

  const validationError =
    !validation.valid && label.trim().length > 0
      ? t(`errors.${validation.reason}` as const, {
          min: USERNAME_MIN_LENGTH,
          max: USERNAME_MAX_LENGTH,
        })
      : null;

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
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                {t("inputLabel")}
              </span>
              <div className="mt-1.5 flex items-center rounded-xl border border-border bg-background focus-within:border-primary">
                <input
                  type="text"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder={t("inputPlaceholder")}
                  maxLength={USERNAME_MAX_LENGTH}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-text-main placeholder:text-text-muted/60 focus:outline-none"
                />
                <select
                  value={tld}
                  onChange={(event) => setTld(event.target.value)}
                  className="h-11 bg-transparent pr-3 text-sm font-bold text-primary focus:outline-none"
                  aria-label="TLD"
                >
                  {availableTlds.map((opt) => (
                    <option key={opt} value={opt} className="bg-surface">
                      .{opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="min-h-[20px] text-xs">
            {validationError ? (
              <span className="text-accent-orange">{validationError}</span>
            ) : availability.status === "checking" ? (
              <span className="text-text-muted">{t("checking")}</span>
            ) : availability.status === "available" ? (
              <span className="text-secondary font-bold">
                ✓ {t("available")}
              </span>
            ) : availability.status === "unavailable" ? (
              <span className="text-accent-orange">
                {availability.reason === "reserved"
                  ? t("errors.reserved")
                  : availability.reason === "taken"
                  ? t("errors.taken")
                  : t("unavailable")}
              </span>
            ) : null}
          </div>

          {!isConfigured && (
            <p className="text-xs text-accent-orange">
              Username contract not configured. Set NEXT_PUBLIC_CLODDY_USERNAME_ADDRESS.
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
              ? "Uploading metadata…"
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

function buildUsernameSvg(display: string): string {
  const safe = display.replace(/[<>&"]/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#7750f8"/>
      <stop offset="100%" stop-color="#23d2e2"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#161b28"/>
  <rect x="24" y="24" width="464" height="464" rx="48" fill="url(#g)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        fill="#fff" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="56">${safe}</text>
  <text x="50%" y="84%" dominant-baseline="middle" text-anchor="middle"
        fill="rgba(255,255,255,0.75)" font-family="Inter" font-size="22" letter-spacing="6">CLODDY</text>
</svg>`;
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
