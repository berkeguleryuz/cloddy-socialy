import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { awardXP } from '@/lib/xp'

// GET quests for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // daily, weekly, achievement

    const supabase = await createClient()

    if (!supabase) {
      // Return demo quests with indicator
      return NextResponse.json({
        quests: getDemoQuests(type),
        daily_reset: getNextDailyReset(),
        weekly_reset: getNextWeeklyReset(),
        is_demo: true,
        message: 'Database not available - showing demo quests',
      })
    }

    // Query user_quests table for user-specific quest progress
    const { data: userQuests, error: questsError } = await (supabase as any)
      .from('user_quests')
      .select(`
        *,
        quest:quests(*)
      `)
      .eq('user_id', session.userId)

    if (questsError || !userQuests || userQuests.length === 0) {
      // Return demo quests if no quests found
      return NextResponse.json({
        quests: getDemoQuests(type),
        daily_reset: getNextDailyReset(),
        weekly_reset: getNextWeeklyReset(),
        is_demo: true,
        message: 'No quests found - showing preview data',
      })
    }

    // Transform database quests to response format
    const transformedQuests = userQuests.map((uq: any) => ({
      id: uq.quest?.id || uq.id,
      type: uq.quest?.quest_type || 'daily',
      title: uq.quest?.title || 'Quest',
      description: uq.quest?.description || '',
      xp_reward: uq.quest?.experience_points || 0,
      progress: uq.progress || 0,
      target: uq.quest?.target || 1,
      completed: uq.completed || false,
      icon: uq.quest?.icon || 'star',
    }))

    // Filter by type if specified
    const filteredQuests = type
      ? transformedQuests.filter((q: any) => q.type === type)
      : transformedQuests

    return NextResponse.json({
      quests: filteredQuests.length > 0 ? filteredQuests : getDemoQuests(type),
      daily_reset: getNextDailyReset(),
      weekly_reset: getNextWeeklyReset(),
      is_demo: filteredQuests.length === 0,
    })
  } catch (error) {
    console.error('Error in GET /api/quests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST claim quest reward
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { questId, action } = body

    if (!questId) {
      return NextResponse.json(
        { error: 'Quest ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Handle different actions
    if (action === 'claim') {
      // Get user quest
      const { data: userQuest, error: fetchError } = await (supabase as any)
        .from('user_quests')
        .select(`
          *,
          quest:quests(*)
        `)
        .eq('user_id', session.userId)
        .eq('quest_id', questId)
        .single()

      if (fetchError || !userQuest) {
        return NextResponse.json(
          { error: 'Quest not found' },
          { status: 404 }
        )
      }

      // Check if already claimed
      if (userQuest.claimed) {
        return NextResponse.json(
          { error: 'Quest reward already claimed' },
          { status: 400 }
        )
      }

      // Check if completed
      if (!userQuest.completed) {
        return NextResponse.json(
          { error: 'Quest not completed yet' },
          { status: 400 }
        )
      }

      // Claim reward - award XP
      const xpReward = userQuest.quest?.experience_points || 0
      if (xpReward > 0) {
        await awardXP(session.userId, xpReward, 'quest_completion', { questId })
      }

      // Mark as claimed
      await (supabase as any)
        .from('user_quests')
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', userQuest.id)

      return NextResponse.json({
        success: true,
        xp_awarded: xpReward,
        message: `Claimed ${xpReward} XP!`,
      })
    }

    // Handle quest reset check
    if (action === 'check_reset') {
      await checkAndResetQuests(supabase, session.userId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in POST /api/quests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check and reset daily/weekly quests
async function checkAndResetQuests(supabase: any, userId: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayOfWeek = now.getDay()
  const monday = new Date(today)
  monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  // Get user quests with their last reset times
  const { data: userQuests } = await supabase
    .from('user_quests')
    .select(`
      *,
      quest:quests(quest_type)
    `)
    .eq('user_id', userId)

  if (!userQuests) return

  const updates = []

  for (const uq of userQuests) {
    const questType = uq.quest?.quest_type
    const lastReset = uq.last_reset ? new Date(uq.last_reset) : null

    // Daily quest reset
    if (questType === 'daily') {
      if (!lastReset || lastReset < today) {
        updates.push({
          id: uq.id,
          progress: 0,
          completed: false,
          claimed: false,
          last_reset: today.toISOString(),
        })
      }
    }

    // Weekly quest reset
    if (questType === 'weekly') {
      if (!lastReset || lastReset < monday) {
        updates.push({
          id: uq.id,
          progress: 0,
          completed: false,
          claimed: false,
          last_reset: monday.toISOString(),
        })
      }
    }
  }

  // Apply updates
  for (const update of updates) {
    await supabase
      .from('user_quests')
      .update({
        progress: update.progress,
        completed: update.completed,
        claimed: update.claimed,
        last_reset: update.last_reset,
      })
      .eq('id', update.id)
  }
}

// Helper functions
function getNextDailyReset(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}

function getNextWeeklyReset(): string {
  const now = new Date()
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7
  const nextMonday = new Date(now)
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  return nextMonday.toISOString()
}

function getDemoQuests(type: string | null) {
  const dailyQuests = [
    {
      id: 'daily-1',
      type: 'daily',
      title: 'Social Butterfly',
      description: 'Send a message to 3 friends',
      xp_reward: 50,
      progress: 2,
      target: 3,
      completed: false,
      icon: 'message',
    },
    {
      id: 'daily-2',
      type: 'daily',
      title: 'Content Creator',
      description: 'Create a new post',
      xp_reward: 30,
      progress: 1,
      target: 1,
      completed: true,
      icon: 'post',
    },
    {
      id: 'daily-3',
      type: 'daily',
      title: 'Engagement Master',
      description: 'Like 5 posts from friends',
      xp_reward: 25,
      progress: 3,
      target: 5,
      completed: false,
      icon: 'heart',
    },
    {
      id: 'daily-4',
      type: 'daily',
      title: 'Community Voice',
      description: 'Leave 2 comments',
      xp_reward: 40,
      progress: 0,
      target: 2,
      completed: false,
      icon: 'comment',
    },
  ]

  const weeklyQuests = [
    {
      id: 'weekly-1',
      type: 'weekly',
      title: 'Friend Finder',
      description: 'Add 3 new friends this week',
      xp_reward: 200,
      progress: 1,
      target: 3,
      completed: false,
      icon: 'users',
    },
    {
      id: 'weekly-2',
      type: 'weekly',
      title: 'Event Explorer',
      description: 'Attend 2 events',
      xp_reward: 150,
      progress: 0,
      target: 2,
      completed: false,
      icon: 'calendar',
    },
    {
      id: 'weekly-3',
      type: 'weekly',
      title: 'Group Enthusiast',
      description: 'Join a new group',
      xp_reward: 100,
      progress: 1,
      target: 1,
      completed: true,
      icon: 'group',
    },
    {
      id: 'weekly-4',
      type: 'weekly',
      title: 'Popular Post',
      description: 'Get 50 likes on your posts',
      xp_reward: 300,
      progress: 32,
      target: 50,
      completed: false,
      icon: 'trending',
    },
  ]

  const achievements = [
    {
      id: 'achievement-1',
      type: 'achievement',
      title: 'First Steps',
      description: 'Complete your profile',
      xp_reward: 100,
      progress: 1,
      target: 1,
      completed: true,
      icon: 'profile',
    },
    {
      id: 'achievement-2',
      type: 'achievement',
      title: 'Social Star',
      description: 'Reach 100 friends',
      xp_reward: 500,
      progress: 42,
      target: 100,
      completed: false,
      icon: 'star',
    },
    {
      id: 'achievement-3',
      type: 'achievement',
      title: 'Content King',
      description: 'Create 50 posts',
      xp_reward: 400,
      progress: 23,
      target: 50,
      completed: false,
      icon: 'crown',
    },
    {
      id: 'achievement-4',
      type: 'achievement',
      title: 'Verified Identity',
      description: 'Connect your wallet',
      xp_reward: 200,
      progress: 1,
      target: 1,
      completed: true,
      icon: 'verified',
    },
    {
      id: 'achievement-5',
      type: 'achievement',
      title: 'Level 10',
      description: 'Reach level 10',
      xp_reward: 1000,
      progress: 24,
      target: 10,
      completed: true,
      icon: 'level',
    },
    {
      id: 'achievement-6',
      type: 'achievement',
      title: 'Event Organizer',
      description: 'Create your first event',
      xp_reward: 250,
      progress: 0,
      target: 1,
      completed: false,
      icon: 'event',
    },
  ]

  if (type === 'daily') return dailyQuests
  if (type === 'weekly') return weeklyQuests
  if (type === 'achievement') return achievements

  return [...dailyQuests, ...weeklyQuests, ...achievements]
}
