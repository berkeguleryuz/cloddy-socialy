import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  // Check admin permissions
  const authError = await requireStaff(request)
  if (authError) return authError

  try {
    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch stats in parallel
    const [
      usersResult,
      newUsersResult,
      postsResult,
      newPostsResult,
      reportsResult,
      pendingReportsResult,
      activeSuspensionsResult,
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('id', { count: 'exact', head: true }),
      // New users this week
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString()),
      // Total posts
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      // New posts this week
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString()),
      // Total reports
      supabase.from('content_reports').select('id', { count: 'exact', head: true }),
      // Pending reports
      supabase
        .from('content_reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      // Active suspensions
      supabase
        .from('user_suspensions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ])

    // Calculate growth percentages (simplified)
    const totalUsers = usersResult.count || 0
    const newUsers = newUsersResult.count || 0
    const totalPosts = postsResult.count || 0
    const newPosts = newPostsResult.count || 0
    const totalReports = reportsResult.count || 0
    const pendingReports = pendingReportsResult.count || 0
    const activeSuspensions = activeSuspensionsResult.count || 0

    // Calculate growth rate (new this week / existing at start of week * 100)
    const userGrowth = totalUsers > newUsers
      ? Math.round((newUsers / (totalUsers - newUsers)) * 100)
      : 100
    const postGrowth = totalPosts > newPosts
      ? Math.round((newPosts / (totalPosts - newPosts)) * 100)
      : 100

    return NextResponse.json({
      users: {
        total: totalUsers,
        new: newUsers,
        growth: userGrowth,
      },
      posts: {
        total: totalPosts,
        new: newPosts,
        growth: postGrowth,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
      },
      suspensions: {
        active: activeSuspensions,
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
