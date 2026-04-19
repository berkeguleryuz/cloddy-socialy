"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import MintPfpModal from "@/components/modals/MintPfpModal";
import { MINT_FEE_ETH } from "@/hooks/useMintNft";

export default function MintPfpPage() {
  const t = useTranslations("pfp");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-text-main">{t("title")}</h1>
        <p className="text-sm text-text-muted">
          {t("mintFee")}: {MINT_FEE_ETH} ETH
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface/60 p-8 flex flex-col items-center gap-6">
        <div className="text-center text-text-muted text-sm">
          Mint an on-chain profile picture. Stored on IPFS, transferable,
          OpenSea-compatible.
        </div>
        <Button size="lg" onClick={() => setOpen(true)}>
          {t("mintButton")}
        </Button>
      </div>

      <MintPfpModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
