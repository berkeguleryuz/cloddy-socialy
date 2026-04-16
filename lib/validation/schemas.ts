import { z } from 'zod'

// ============================================
// Common Schemas
// ============================================

export const WalletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format')
  .transform(val => val.toLowerCase())

export const UUIDSchema = z.string().uuid('Invalid UUID format')

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ============================================
// Auth Schemas
// ============================================

export const SIWEVerifySchema = z.object({
  message: z.string().min(1, 'Message is required'),
  signature: z.string()
    .regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format')
    .min(132, 'Signature too short'),
})

export const NonceResponseSchema = z.object({
  nonce: z.string().min(8),
})

// Email Auth Schemas
export const EmailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .transform(val => val.toLowerCase().trim())

export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')

export const UsernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .transform(val => val.toLowerCase())

export const EmailRegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema.optional(),
  displayName: z.string().min(1).max(50).optional(),
})

export const EmailLoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: PasswordSchema,
})

export const LinkWalletSchema = SIWEVerifySchema

export const LinkEmailSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})

// ============================================
// Post Schemas
// ============================================

export const CreatePostSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content too long (max 5000 characters)'),
  post_type: z.enum(['text', 'image', 'video', 'poll', 'gallery']).default('text'),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    thumbnail_url: z.string().url().optional(),
    title: z.string().optional(),
    duration: z.string().optional(),
  })).max(10).optional(),
  poll_options: z.array(z.object({
    text: z.string().min(1).max(200),
  })).min(2).max(10).optional(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  group_id: UUIDSchema.optional(),
})

export const UpdatePostSchema = CreatePostSchema.partial()

export const PostIdParamSchema = z.object({
  id: UUIDSchema,
})

// ============================================
// Comment Schemas
// ============================================

export const CreateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment is required')
    .max(2000, 'Comment too long (max 2000 characters)'),
  parent_id: UUIDSchema.optional(),
})

// ============================================
// User Schemas
// ============================================

export const UpdateUserSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
  tagline: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  birthday: z.string().datetime().optional(),
  occupation: z.string().max(100).optional(),
  website: z.string().url().optional(),
  twitter: z.string().max(50).optional(),
  discord: z.string().max(50).optional(),
})

export const UserSearchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

// ============================================
// Friend Schemas
// ============================================

export const FriendRequestSchema = z.object({
  to_user_id: UUIDSchema,
})

export const FriendActionSchema = z.object({
  friendship_id: UUIDSchema,
})

// ============================================
// Group Schemas
// ============================================

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  cover_url: z.string().url().optional(),
  privacy: z.enum(['public', 'private', 'secret']).default('public'),
  category: z.string().max(50).optional(),
})

export const UpdateGroupSchema = CreateGroupSchema.partial()

export const GroupIdParamSchema = z.object({
  id: UUIDSchema,
})

// ============================================
// Event Schemas
// ============================================

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  cover_url: z.string().url().optional(),
  event_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  location_url: z.string().url().optional(),
  max_participants: z.number().int().positive().optional(),
  is_online: z.boolean().default(false),
  group_id: UUIDSchema.optional(),
})

export const UpdateEventSchema = CreateEventSchema.partial()

export const EventIdParamSchema = z.object({
  id: UUIDSchema,
})

export const EventResponseSchema = z.object({
  status: z.enum(['attending', 'maybe', 'declined']),
})

// ============================================
// Message Schemas
// ============================================

export const SendMessageSchema = z.object({
  to_user_id: UUIDSchema,
  content: z.string().min(1).max(5000),
  reply_to_id: UUIDSchema.optional(),
})

export const ConversationIdParamSchema = z.object({
  conversation_id: UUIDSchema,
})

// ============================================
// Notification Schemas
// ============================================

export const MarkNotificationReadSchema = z.object({
  notification_id: UUIDSchema.optional(),
  all: z.boolean().default(false),
})

// ============================================
// XP Schemas
// ============================================

export const XPSyncSchema = z.object({
  action: z.enum([
    'post_created',
    'comment_created',
    'like_received',
    'friend_added',
    'badge_earned',
    'event_created',
    'group_created',
    'login',
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// ============================================
// Type Exports
// ============================================

export type SIWEVerifyInput = z.infer<typeof SIWEVerifySchema>
export type EmailRegisterInput = z.infer<typeof EmailRegisterSchema>
export type EmailLoginInput = z.infer<typeof EmailLoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
export type LinkEmailInput = z.infer<typeof LinkEmailSchema>
export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>
export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>
export type SendMessageInput = z.infer<typeof SendMessageSchema>
export type XPSyncInput = z.infer<typeof XPSyncSchema>

// ============================================
// Validation Helper
// ============================================

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
    return {
      success: false,
      error: errors.join(', '),
    }
  }

  return {
    success: true,
    data: result.data,
  }
}
