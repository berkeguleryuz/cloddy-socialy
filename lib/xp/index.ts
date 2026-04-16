/**
 * XP (Experience Points) Management Utilities
 * Handles XP awarding, level calculation, and progression tracking
 */

import { createClient } from '@/lib/supabase/server'

// XP required for each level (cumulative)
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  450,   // Level 4
  700,   // Level 5
  1000,  // Level 6
  1350,  // Level 7
  1750,  // Level 8
  2200,  // Level 9
  2700,  // Level 10
  3250,  // Level 11
  3850,  // Level 12
  4500,  // Level 13
  5200,  // Level 14
  5950,  // Level 15
  6750,  // Level 16
  7600,  // Level 17
  8500,  // Level 18
  9450,  // Level 19
  10450, // Level 20
  // Beyond 20, each level requires 1000 more XP
]

export type XPSource =
  | 'quest_completion'
  | 'post_created'
  | 'comment_created'
  | 'like_received'
  | 'friend_added'
  | 'badge_earned'
  | 'event_attended'
  | 'group_joined'
  | 'daily_login'
  | 'profile_completed'
  | 'wallet_connected'
  | 'email_verified'
  | 'admin_grant'

interface AwardXPResult {
  success: boolean
  xpAwarded: number
  previousXP: number
  newXP: number
  previousLevel: number
  newLevel: number
  leveledUp: boolean
  error?: string
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }

  // For levels beyond 20
  if (totalXP >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    const extraXP = totalXP - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    return 20 + Math.floor(extraXP / 1000)
  }

  return 1
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[currentLevel]
  }
  // Beyond defined levels, each level needs 1000 more XP
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - 20) * 1000
}

/**
 * Get progress towards next level (0-100%)
 */
export function getLevelProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP)
  const currentLevelXP = currentLevel <= LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[currentLevel - 1]
    : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - 21) * 1000

  const nextLevelXP = getXPForNextLevel(currentLevel)
  const xpInLevel = totalXP - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP

  return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
}

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: XPSource,
  metadata?: Record<string, unknown>
): Promise<AwardXPResult> {
  const supabase = await createClient()

  if (!supabase) {
    return {
      success: false,
      xpAwarded: 0,
      previousXP: 0,
      newXP: 0,
      previousLevel: 1,
      newLevel: 1,
      leveledUp: false,
      error: 'Database not configured',
    }
  }

  try {
    // Get current user XP
    const { data: user, error: fetchError } = await (supabase as any)
      .from('users')
      .select('experience_points, level')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return {
        success: false,
        xpAwarded: 0,
        previousXP: 0,
        newXP: 0,
        previousLevel: 1,
        newLevel: 1,
        leveledUp: false,
        error: 'User not found',
      }
    }

    const previousXP = user.experience_points || 0
    const previousLevel = user.level || calculateLevel(previousXP)
    const newXP = previousXP + amount
    const newLevel = calculateLevel(newXP)
    const leveledUp = newLevel > previousLevel

    // Update user XP and level
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update({
        experience_points: newXP,
        level: newLevel,
      })
      .eq('id', userId)

    if (updateError) {
      return {
        success: false,
        xpAwarded: 0,
        previousXP,
        newXP: previousXP,
        previousLevel,
        newLevel: previousLevel,
        leveledUp: false,
        error: 'Failed to update XP',
      }
    }

    // Log XP transaction
    await (supabase as any)
      .from('xp_transactions')
      .insert({
        user_id: userId,
        amount,
        source,
        metadata,
        previous_xp: previousXP,
        new_xp: newXP,
        leveled_up: leveledUp,
      })
      .then(() => {})
      .catch(console.error)

    // If leveled up, create notification
    if (leveledUp) {
      await (supabase as any)
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'level_up',
          title: `Level ${newLevel} Reached!`,
          message: `Congratulations! You've reached level ${newLevel}!`,
          data: { newLevel, previousLevel },
        })
        .then(() => {})
        .catch(console.error)
    }

    return {
      success: true,
      xpAwarded: amount,
      previousXP,
      newXP,
      previousLevel,
      newLevel,
      leveledUp,
    }
  } catch (error) {
    console.error('Error awarding XP:', error)
    return {
      success: false,
      xpAwarded: 0,
      previousXP: 0,
      newXP: 0,
      previousLevel: 1,
      newLevel: 1,
      leveledUp: false,
      error: 'Internal error',
    }
  }
}

/**
 * Get XP breakdown for a user
 */
export async function getXPBreakdown(userId: string) {
  const supabase = await createClient()

  if (!supabase) {
    return null
  }

  const { data: transactions } = await (supabase as any)
    .from('xp_transactions')
    .select('source, amount')
    .eq('user_id', userId)

  if (!transactions) {
    return null
  }

  const breakdown: Record<XPSource, number> = {
    quest_completion: 0,
    post_created: 0,
    comment_created: 0,
    like_received: 0,
    friend_added: 0,
    badge_earned: 0,
    event_attended: 0,
    group_joined: 0,
    daily_login: 0,
    profile_completed: 0,
    wallet_connected: 0,
    email_verified: 0,
    admin_grant: 0,
  }

  for (const tx of transactions) {
    if (breakdown[tx.source as XPSource] !== undefined) {
      breakdown[tx.source as XPSource] += tx.amount
    }
  }

  return breakdown
}
