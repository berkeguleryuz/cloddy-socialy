import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET all badges
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
    const earned = searchParams.get('earned') === 'true'

    const supabase = await createClient()

    if (!supabase) {
      // Return demo badges
      return NextResponse.json({
        badges: getDemoBadges(),
        user_badges: [],
      })
    }

    // Get all available badges
    const { data: badges, error: badgesError } = await (supabase as any)
      .from('badges')
      .select('*')
      .order('experience_points', { ascending: false })

    if (badgesError) {
      console.error('Error fetching badges:', badgesError)
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      )
    }

    // Get user's earned badges
    const { data: userBadges, error: userBadgesError } = await (supabase as any)
      .from('user_badges')
      .select(`
        id,
        earned_at,
        badge:badges(*)
      `)
      .eq('user_id', session.userId)
      .order('earned_at', { ascending: false })

    if (userBadgesError) {
      console.error('Error fetching user badges:', userBadgesError)
    }

    const earnedBadgeIds = new Set((userBadges || []).map((ub: any) => ub.badge?.id))

    if (earned) {
      return NextResponse.json({
        badges: (badges || []).filter((b: any) => earnedBadgeIds.has(b.id)),
        user_badges: userBadges || [],
      })
    }

    return NextResponse.json({
      badges: (badges || []).map((b: any) => ({
        ...b,
        earned: earnedBadgeIds.has(b.id),
      })),
      user_badges: userBadges || [],
    })
  } catch (error) {
    console.error('Error in GET /api/badges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Demo badges data
function getDemoBadges() {
  return [
    {
      id: '1',
      name: 'Welcome',
      description: 'Joined the community',
      icon_url: '/images/badges/badge_welcome.png',
      xp_reward: 50,
      earned: true,
    },
    {
      id: '2',
      name: 'First Post',
      description: 'Created your first post',
      icon_url: '/images/badges/badge_first_post.png',
      xp_reward: 100,
      earned: true,
    },
    {
      id: '3',
      name: 'Social Butterfly',
      description: 'Made 10 friends',
      icon_url: '/images/badges/badge_social.png',
      xp_reward: 250,
      earned: false,
    },
    {
      id: '4',
      name: 'Popular',
      description: 'Received 100 likes on posts',
      icon_url: '/images/badges/badge_popular.png',
      xp_reward: 500,
      earned: false,
    },
    {
      id: '5',
      name: 'Verified',
      description: 'Verified your wallet',
      icon_url: '/images/badges/badge_verified.png',
      xp_reward: 150,
      earned: true,
    },
    {
      id: '6',
      name: 'Collector',
      description: 'Collected 5 NFTs',
      icon_url: '/images/badges/badge_collector.png',
      xp_reward: 300,
      earned: false,
    },
    {
      id: '7',
      name: 'Event Organizer',
      description: 'Organized your first event',
      icon_url: '/images/badges/badge_organizer.png',
      xp_reward: 400,
      earned: false,
    },
    {
      id: '8',
      name: 'Group Leader',
      description: 'Created a group with 50+ members',
      icon_url: '/images/badges/badge_leader.png',
      xp_reward: 600,
      earned: false,
    },
  ]
}
