// Email Service - Main entry point
import { sendEmail } from './resend'
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  welcomeEmailTemplate,
  notificationEmailTemplate,
  badgeEarnedEmailTemplate,
  levelUpEmailTemplate,
} from './templates'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Send verification email
export async function sendVerificationEmail(
  email: string,
  userName: string,
  token: string
) {
  const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${token}`
  const html = verificationEmailTemplate(userName, verificationUrl)

  return sendEmail({
    to: email,
    subject: 'Verify your email address',
    html,
  })
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  token: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`
  const html = passwordResetEmailTemplate(userName, resetUrl)

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html,
  })
}

// Send welcome email (after verification)
export async function sendWelcomeEmail(email: string, userName: string) {
  const html = welcomeEmailTemplate(userName)

  return sendEmail({
    to: email,
    subject: 'Welcome to Cloddy! 🎉',
    html,
  })
}

// Send notification email
export async function sendNotificationEmail(
  email: string,
  userName: string,
  notificationType: string,
  message: string,
  actionUrl?: string
) {
  const html = notificationEmailTemplate(userName, notificationType, message, actionUrl)

  const subjectMap: Record<string, string> = {
    friend_request: 'You have a new friend request',
    friend_accepted: 'Your friend request was accepted',
    like: 'Someone liked your post',
    comment: 'Someone commented on your post',
    mention: 'You were mentioned in a post',
    badge: 'You earned a new badge!',
    level_up: 'You leveled up!',
    group_invite: 'You were invited to a group',
    event_reminder: 'Event reminder',
    message: 'You have a new message',
  }

  return sendEmail({
    to: email,
    subject: subjectMap[notificationType] || 'New notification',
    html,
  })
}

// Send badge earned email
export async function sendBadgeEarnedEmail(
  email: string,
  userName: string,
  badgeName: string,
  badgeDescription: string,
  xpEarned: number
) {
  const html = badgeEarnedEmailTemplate(userName, badgeName, badgeDescription, xpEarned)

  return sendEmail({
    to: email,
    subject: `🏆 You earned the "${badgeName}" badge!`,
    html,
  })
}

// Send level up email
export async function sendLevelUpEmail(
  email: string,
  userName: string,
  newLevel: number,
  totalXP: number
) {
  const html = levelUpEmailTemplate(userName, newLevel, totalXP)

  return sendEmail({
    to: email,
    subject: `⬆️ You reached Level ${newLevel}!`,
    html,
  })
}

// Export all
export { sendEmail } from './resend'
