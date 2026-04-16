"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useAuth } from "@/components/AuthContext";
import {
  useTokenBalance,
  useStakeInfo,
  useTotalStaked,
  useStake,
  useUnstake,
  useClaimRewards,
} from "@/hooks/useContracts";

export default function StakingPage() {
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");

  const { isDemo } = useAuth();
  const { address, isConnected } = useAccount();

  // Contract hooks
  const { data: tokenBalance } = useTokenBalance(address);
  const stakeInfo = useStakeInfo(address);
  const { data: totalStaked } = useTotalStaked();

  const { stake, isPending: isStaking, isConfirming: isStakeConfirming, isSuccess: stakeSuccess } = useStake();
  const { unstake, isPending: isUnstaking, isConfirming: isUnstakeConfirming, isSuccess: unstakeSuccess } = useUnstake();
  const { claim, isPending: isClaiming, isConfirming: isClaimConfirming, isSuccess: claimSuccess } = useClaimRewards();

  // Format balances
  const formattedBalance = tokenBalance ? formatEther(tokenBalance) : "0";
  const formattedStaked = stakeInfo.stakedBalance ? formatEther(stakeInfo.stakedBalance) : "0";
  const formattedRewards = stakeInfo.pendingRewards ? formatEther(stakeInfo.pendingRewards) : "0";
  const formattedTotalStaked = totalStaked ? formatEther(totalStaked) : "0";

  // Calculate APY (5% from contract)
  const APY = 5;

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    stake(stakeAmount);
    setStakeAmount("");
  };

  const handleUnstake = () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return;
    unstake(unstakeAmount);
    setUnstakeAmount("");
  };

  const handleClaim = () => {
    claim();
  };

  const handleMaxStake = () => {
    setStakeAmount(formattedBalance);
  };

  const handleMaxUnstake = () => {
    setUnstakeAmount(formattedStaked);
  };

  const formatNumber = (num: string): string => {
    const n = parseFloat(num);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(2) + "M";
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(2) + "K";
    }
    return parseFloat(num).toFixed(2);
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent-blue p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 w-24 h-24 border-4 border-white/30 rounded-full" />
          <div className="absolute bottom-4 right-32 w-16 h-16 border-4 border-white/20 rounded-full" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Staking
          </h1>
          <p className="text-sm text-white/80 font-medium">
            Stake your CLODDY tokens to earn rewards
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="widget-box p-6">
          <div className="text-xs font-bold uppercase text-text-muted mb-2">Your Balance</div>
          <div className="text-2xl font-black text-white">{formatNumber(formattedBalance)}</div>
          <div className="text-xs text-text-muted">CLODDY</div>
        </div>

        <div className="widget-box p-6">
          <div className="text-xs font-bold uppercase text-text-muted mb-2">Your Staked</div>
          <div className="text-2xl font-black text-primary">{formatNumber(formattedStaked)}</div>
          <div className="text-xs text-text-muted">CLODDY</div>
        </div>

        <div className="widget-box p-6">
          <div className="text-xs font-bold uppercase text-text-muted mb-2">Pending Rewards</div>
          <div className="text-2xl font-black text-secondary">{formatNumber(formattedRewards)}</div>
          <div className="text-xs text-text-muted">CLODDY</div>
        </div>

        <div className="widget-box p-6">
          <div className="text-xs font-bold uppercase text-text-muted mb-2">APY</div>
          <div className="text-2xl font-black text-accent-yellow">{APY}%</div>
          <div className="text-xs text-text-muted">Annual yield</div>
        </div>
      </div>

      {/* Main Staking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stake/Unstake Form */}
        <div className="lg:col-span-2 widget-box p-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("stake")}
              className={`flex-1 py-4 text-sm font-bold uppercase transition-colors ${
                activeTab === "stake"
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-muted hover:text-white"
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => setActiveTab("unstake")}
              className={`flex-1 py-4 text-sm font-bold uppercase transition-colors ${
                activeTab === "unstake"
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-muted hover:text-white"
              }`}
            >
              Unstake
            </button>
          </div>

          <div className="p-6">
            {activeTab === "stake" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-muted mb-2">
                    Amount to Stake
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-background rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 pr-20"
                    />
                    <button
                      onClick={handleMaxStake}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-primary hover:text-white transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Available: {formatNumber(formattedBalance)} CLODDY
                  </p>
                </div>

                <button
                  onClick={handleStake}
                  disabled={!isConnected || isStaking || isStakeConfirming || !stakeAmount}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStaking
                    ? "Confirm in Wallet..."
                    : isStakeConfirming
                    ? "Staking..."
                    : "Stake CLODDY"}
                </button>

                {stakeSuccess && (
                  <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg text-center">
                    <p className="text-sm text-secondary">Successfully staked!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-muted mb-2">
                    Amount to Unstake
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-background rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 pr-20"
                    />
                    <button
                      onClick={handleMaxUnstake}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-primary hover:text-white transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Staked: {formatNumber(formattedStaked)} CLODDY
                  </p>
                </div>

                <button
                  onClick={handleUnstake}
                  disabled={!isConnected || isUnstaking || isUnstakeConfirming || !unstakeAmount}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUnstaking
                    ? "Confirm in Wallet..."
                    : isUnstakeConfirming
                    ? "Unstaking..."
                    : "Unstake CLODDY"}
                </button>

                {unstakeSuccess && (
                  <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg text-center">
                    <p className="text-sm text-secondary">Successfully unstaked!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rewards Card */}
        <div className="widget-box p-6">
          <h3 className="text-sm font-bold uppercase text-text-muted mb-4">Rewards</h3>

          <div className="text-center py-6">
            <div className="text-4xl font-black text-secondary mb-2">
              {formatNumber(formattedRewards)}
            </div>
            <div className="text-sm text-text-muted mb-6">CLODDY Earned</div>

            <button
              onClick={handleClaim}
              disabled={!isConnected || isClaiming || isClaimConfirming || parseFloat(formattedRewards) <= 0}
              className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming
                ? "Confirm in Wallet..."
                : isClaimConfirming
                ? "Claiming..."
                : "Claim Rewards"}
            </button>

            {claimSuccess && (
              <div className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <p className="text-sm text-secondary">Rewards claimed!</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Total Value Locked</span>
              <span className="font-bold">{formatNumber(formattedTotalStaked)} CLODDY</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Reward Rate</span>
              <span className="font-bold text-secondary">{APY}% APY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Not Connected Warning */}
      {!isConnected && (
        <div className="widget-box p-4 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h4 className="font-bold text-yellow-500">Wallet Not Connected</h4>
              <p className="text-sm text-text-muted">
                Connect your wallet to stake CLODDY tokens and earn rewards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Notice */}
      {isDemo && (
        <div className="widget-box p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-lg">ℹ️</span>
            </div>
            <div>
              <h4 className="font-bold text-blue-400">Demo Mode</h4>
              <p className="text-sm text-text-muted">
                You&apos;re viewing demo data. Connect your wallet and switch to Base Sepolia to interact with the staking contract.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="widget-box p-6">
        <h3 className="text-lg font-bold mb-4">How Staking Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-lg">1</span>
            </div>
            <div>
              <h4 className="font-bold mb-1">Stake Tokens</h4>
              <p className="text-sm text-text-muted">
                Deposit your CLODDY tokens into the staking contract.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
              <span className="text-lg">2</span>
            </div>
            <div>
              <h4 className="font-bold mb-1">Earn Rewards</h4>
              <p className="text-sm text-text-muted">
                Earn {APY}% APY in CLODDY tokens automatically.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center shrink-0">
              <span className="text-lg">3</span>
            </div>
            <div>
              <h4 className="font-bold mb-1">Claim Anytime</h4>
              <p className="text-sm text-text-muted">
                Withdraw your stake and rewards at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
