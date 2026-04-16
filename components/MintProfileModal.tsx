"use client";

import { useState, useEffect, memo } from "react";
import { useAccount } from "wagmi";
import { useHasProfile, useCreateProfile } from "@/hooks/useContracts";

interface MintProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MintProfileModal = memo(function MintProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: MintProfileModalProps) {
  const [username, setUsername] = useState("");
  const [step, setStep] = useState<"form" | "minting" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");

  const { address } = useAccount();
  const { data: hasProfile, isLoading: checkingProfile } = useHasProfile(address);
  const { create, isPending, isConfirming, isSuccess, error } = useCreateProfile();

  useEffect(() => {
    if (isSuccess) {
      setStep("success");
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (error) {
      setStep("error");
      setErrorMessage(error.message || "Failed to mint profile");
    }
  }, [error]);

  const handleMint = () => {
    if (!username.trim()) {
      setErrorMessage("Please enter a username");
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setErrorMessage("Username must be 3-20 characters");
      return;
    }

    setStep("minting");
    setErrorMessage("");

    // Create metadata URI (in production, upload to IPFS first)
    const metadataURI = `ipfs://placeholder/${username}`;
    create(username, metadataURI);
  };

  if (!isOpen) return null;

  // Already has profile
  if (hasProfile && !checkingProfile) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="widget-box w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Profile Already Minted</h2>
            <p className="text-text-muted text-sm mb-6">
              You already have a Cloddy Profile NFT!
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="widget-box w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Mint Your Profile</h2>
              <p className="text-white/80 text-sm">Create your on-chain identity</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "form" && (
            <>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-text-muted mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-background rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  maxLength={20}
                />
                <p className="text-xs text-text-muted mt-2">
                  3-20 characters. This will be your unique on-chain identity.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">Unique on-chain identity</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">Equip NFT accessories</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent-yellow/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">Build on-chain reputation</span>
                </div>
              </div>

              <button
                onClick={handleMint}
                disabled={!username.trim() || checkingProfile}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mint Profile NFT
              </button>
            </>
          )}

          {step === "minting" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">
                {isPending ? "Confirm in Wallet" : "Minting Profile..."}
              </h3>
              <p className="text-text-muted text-sm">
                {isPending
                  ? "Please confirm the transaction in your wallet"
                  : "Please wait while your profile is being minted on-chain"}
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Profile Minted!</h3>
              <p className="text-text-muted text-sm mb-6">
                Welcome to Cloddy! Your on-chain identity has been created.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Minting Failed</h3>
              <p className="text-text-muted text-sm mb-6">{errorMessage}</p>
              <button
                onClick={() => setStep("form")}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MintProfileModal;
