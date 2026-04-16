import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const QuerySchema = z.object({
  period: z.enum(['all', 'month', 'week', 'today']).default('all'),
  category: z.enum(['xp', 'badges', 'posts', 'friends']).default('xp'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// Demo leaderboard data
const demoLeaderboard = [
  {
    rank: 1,
    user: {
      id: '1',
      display_name: 'Destroy Dex',
      avatar_url: '/images/avatars/avatar_09.png',
      level: 32,
      wallet_address: '0x1234...5678',
    },
    xp: 125800,
    badges_count: 45,
    posts_count: 2340,
    friends_count: 156,
  },
  {
    rank: 2,
    user: {
      id: '2',
      display_name: 'Gaming Pro',
      avatar_url: '/images/avatars/avatar_01.png',
      level: 24,
      wallet_address: '0x2345...6789',
    },
    xp: 98500,
    badges_count: 38,
    posts_count: 1890,
    friends_count: 134,
  },
  {
    rank: 3,
    user: {
      id: '3',
      display_name: 'Crypto Queen',
      avatar_url: '/images/avatars/avatar_05.png',
      level: 27,
      wallet_address: '0x3456...7890',
    },
    xp: 87200,
    badges_count: 32,
    posts_count: 1650,
    friends_count: 98,
  },
  {
    rank: 4,
    user: {
      id: '4',
      display_name: 'Nick Grissom',
      avatar_url: '/images/avatars/avatar_02.png',
      level: 16,
      wallet_address: '0x4567...8901',
    },
    xp: 65400,
    badges_count: 28,
    posts_count: 1230,
    friends_count: 87,
  },
  {
    rank: 5,
    user: {
      id: '5',
      display_name: 'Neko Bebop',
      avatar_url: '/images/avatars/avatar_03.png',
      level: 12,
      wallet_address: '0x5678...9012',
    },
    xp: 52100,
    badges_count: 22,
    posts_count: 980,
    friends_count: 65,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate query params
    const { searchParams } = new URL(request.url)
    const queryResult = QuerySchema.safeParse({
      period: searchParams.get('period'),
      category: searchParams.get('category'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 }
      )
    }

    const { period, category, limit, offset } = queryResult.data

    const supabase = await createClient()

    if (!supabase) {
      // Return demo leaderboard
      return NextResponse.json({
        leaderboard: demoLeaderboard,
        total: demoLeaderboard.length,
        user_rank: null,
        is_demo: true,
      })
    }

    // Build the order by column based on category
    const orderColumn = category === 'xp' ? 'experience_points'
      : category === 'badges' ? 'badges_count'
      : category === 'posts' ? 'posts_count'
      : 'friends_count'

    // Build date filter for period
    let dateFilter = null
    const now = new Date()
    if (period === 'today') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    } else if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = weekAgo.toISOString()
    } else if (period === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter = monthAgo.toISOString()
    }

    // Query leaderboard
    let query = (supabase as any)
      .from('users')
      .select(`
        id,
        display_name,
        avatar_url,
        level,
        wallet_address,
        experience_points,
        created_at
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order(orderColumn, { ascending: false })
      .range(offset, offset + limit - 1)

    if (dateFilter) {
      query = query.gte('created_at', dateFilter)
    }

    const { data: users, error, count } = await query

    if (error) {
      console.error('Leaderboard query error:', error)
      return NextResponse.json({
        leaderboard: demoLeaderboard,
        total: demoLeaderboard.length,
        user_rank: null,
        is_demo: true,
      })
    }

    // Get counts for each user (could be optimized with a view)
    const leaderboard = await Promise.all(
      (users || []).map(async (user: any, index: number) => {
        // Get badges count
        const { count: badgesCount } = await (supabase as any)
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Get posts count
        const { count: postsCount } = await (supabase as any)
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id)
          .is('deleted_at', null)

        // Get friends count
        const { count: friendsCount } = await (supabase as any)
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted')

        return {
          rank: offset + index + 1,
          user: {
            id: user.id,
            display_name: user.display_name || 'Anonymous',
            avatar_url: user.avatar_url || '/images/avatars/avatar_01.png',
            level: user.level || 1,
            wallet_address: user.wallet_address,
          },
          xp: user.experience_points || 0,
          badges_count: badgesCount || 0,
          posts_count: postsCount || 0,
          friends_count: friendsCount || 0,
        }
      })
    )

    // Get current user's rank
    let userRank = null
    if (session.userId) {
      const { data: rankData } = await (supabase as any)
        .rpc('get_user_rank', {
          user_id_param: session.userId,
          order_column: orderColumn,
        })

      userRank = rankData || null
    }

    return NextResponse.json({
      leaderboard,
      total: count || 0,
      user_rank: userRank,
      period,
      category,
    })
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
