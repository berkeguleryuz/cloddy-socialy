"use client";

import { useState, useEffect, memo } from "react";
import { useAccount } from "wagmi";
import { useHasBadge, useMintBadge } from "@/hooks/useContracts";

interface MintBadgeButtonProps {
  badgeId: number;
  badgeName: string;
  isEligible?: boolean;
  onSuccess?: () => void;
  className?: string;
}

const MintBadgeButton = memo(function MintBadgeButton({
  badgeId,
  badgeName,
  isEligible = true,
  onSuccess,
  className = "",
}: MintBadgeButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const { address } = useAccount();
  const { data: hasBadge, isLoading: checkingBadge } = useHasBadge(address, badgeId);
  const { mint, isPending, isConfirming, isSuccess, error } = useMintBadge();

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      setShowModal(false);
    }
  }, [isSuccess, onSuccess]);

  const handleMint = () => {
    if (!address) return;
    mint(address, badgeId);
  };

  // Already has badge
  if (hasBadge && !checkingBadge) {
    return (
      <button
        disabled
        className={`px-4 py-2 bg-secondary/20 text-secondary text-xs font-bold rounded-lg flex items-center gap-2 ${className}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Minted
      </button>
    );
  }

  // Not eligible
  if (!isEligible) {
    return (
      <button
        disabled
        className={`px-4 py-2 bg-background text-text-muted text-xs font-bold rounded-lg ${className}`}
      >
        Not Eligible
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={checkingBadge}
        className={`px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 ${className}`}
      >
        {checkingBadge ? "Checking..." : "Mint Badge"}
      </button>

      {/* Mint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="widget-box w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            {!isPending && !isConfirming && !error && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Mint {badgeName}</h3>
                  <p className="text-text-muted text-sm">
                    Claim this badge as an NFT on the blockchain!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-background text-text-muted font-bold rounded-xl hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMint}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Mint Now
                  </button>
                </div>
              </>
            )}

            {(isPending || isConfirming) && (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold mb-1">
                  {isPending ? "Confirm in Wallet" : "Minting..."}
                </h3>
                <p className="text-text-muted text-sm">
                  {isPending
                    ? "Please confirm the transaction"
                    : "Your badge is being minted"}
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="font-bold mb-1">Minting Failed</h3>
                <p className="text-text-muted text-sm mb-4">
                  {error.message || "Something went wrong"}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-background text-white font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default MintBadgeButton;
