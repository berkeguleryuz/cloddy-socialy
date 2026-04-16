// Email templates for Cloddy

const APP_NAME = 'Cloddy'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Base email wrapper with styling
function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0e1321; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1d2333; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7750f8, #40d04f); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800; letter-spacing: 2px;">
                ${APP_NAME}
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="margin: 0; color: #9aa4bf; font-size: 12px;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #9aa4bf; font-size: 12px;">
                <a href="${APP_URL}" style="color: #7750f8; text-decoration: none;">Visit ${APP_NAME}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Button component
function emailButton(text: string, url: string, color: string = '#7750f8') {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 24px 0;">
          <a href="${url}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, ${color}, #40d04f); color: white; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `
}

// Email Verification Template
export function verificationEmailTemplate(userName: string, verificationUrl: string) {
  const content = `
    <h2 style="margin: 0 0 16px; color: white; font-size: 24px; font-weight: 700;">
      Verify Your Email
    </h2>
    <p style="margin: 0 0 8px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Hey ${userName || 'there'}! 👋
    </p>
    <p style="margin: 0 0 24px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Thanks for signing up for ${APP_NAME}! Please verify your email address by clicking the button below.
    </p>
    ${emailButton('Verify Email', verificationUrl)}
    <p style="margin: 24px 0 0; color: #9aa4bf; font-size: 14px; line-height: 1.6;">
      This link will expire in <strong style="color: white;">24 hours</strong>.
    </p>
    <p style="margin: 16px 0 0; color: #9aa4bf; font-size: 14px; line-height: 1.6;">
      If you didn't create an account, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;">
    <p style="margin: 0; color: #6b7280; font-size: 12px;">
      Can't click the button? Copy and paste this URL into your browser:<br>
      <a href="${verificationUrl}" style="color: #7750f8; word-break: break-all;">${verificationUrl}</a>
    </p>
  `
  return emailWrapper(content)
}

// Password Reset Template
export function passwordResetEmailTemplate(userName: string, resetUrl: string) {
  const content = `
    <h2 style="margin: 0 0 16px; color: white; font-size: 24px; font-weight: 700;">
      Reset Your Password
    </h2>
    <p style="margin: 0 0 8px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Hey ${userName || 'there'}! 👋
    </p>
    <p style="margin: 0 0 24px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    ${emailButton('Reset Password', resetUrl, '#f9515c')}
    <p style="margin: 24px 0 0; color: #9aa4bf; font-size: 14px; line-height: 1.6;">
      This link will expire in <strong style="color: white;">1 hour</strong>.
    </p>
    <p style="margin: 16px 0 0; color: #9aa4bf; font-size: 14px; line-height: 1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;">
    <p style="margin: 0; color: #6b7280; font-size: 12px;">
      Can't click the button? Copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: #7750f8; word-break: break-all;">${resetUrl}</a>
    </p>
  `
  return emailWrapper(content)
}

// Welcome Email Template
export function welcomeEmailTemplate(userName: string) {
  const content = `
    <h2 style="margin: 0 0 16px; color: white; font-size: 24px; font-weight: 700;">
      Welcome to ${APP_NAME}! 🎉
    </h2>
    <p style="margin: 0 0 8px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Hey ${userName || 'there'}! 👋
    </p>
    <p style="margin: 0 0 24px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Your email has been verified and your account is ready to go! Here's what you can do next:
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width: 40px; vertical-align: top;">
                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #7750f8, #40d04f); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🎮</span>
              </td>
              <td style="padding-left: 12px;">
                <p style="margin: 0; color: white; font-weight: 600;">Complete Quests</p>
                <p style="margin: 4px 0 0; color: #9aa4bf; font-size: 14px;">Earn XP and level up by completing daily quests</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width: 40px; vertical-align: top;">
                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #7750f8, #40d04f); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🏆</span>
              </td>
              <td style="padding-left: 12px;">
                <p style="margin: 0; color: white; font-weight: 600;">Collect Badges</p>
                <p style="margin: 4px 0 0; color: #9aa4bf; font-size: 14px;">Unlock special badges and show off your achievements</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width: 40px; vertical-align: top;">
                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #7750f8, #40d04f); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">👥</span>
              </td>
              <td style="padding-left: 12px;">
                <p style="margin: 0; color: white; font-weight: 600;">Join Communities</p>
                <p style="margin: 4px 0 0; color: #9aa4bf; font-size: 14px;">Connect with others and join groups</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${emailButton('Start Exploring', APP_URL)}
  `
  return emailWrapper(content)
}

// Notification Email Template
export function notificationEmailTemplate(
  userName: string,
  notificationType: string,
  message: string,
  actionUrl?: string
) {
  const typeIcons: Record<string, string> = {
    friend_request: '👋',
    friend_accepted: '🤝',
    like: '❤️',
    comment: '💬',
    mention: '@',
    badge: '🏆',
    level_up: '⬆️',
    group_invite: '👥',
    event_reminder: '📅',
    message: '✉️',
    default: '🔔',
  }

  const icon = typeIcons[notificationType] || typeIcons.default

  const content = `
    <h2 style="margin: 0 0 16px; color: white; font-size: 24px; font-weight: 700;">
      ${icon} New Notification
    </h2>
    <p style="margin: 0 0 8px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Hey ${userName || 'there'}!
    </p>
    <div style="margin: 24px 0; padding: 20px; background: rgba(119, 80, 248, 0.1); border-radius: 12px; border-left: 4px solid #7750f8;">
      <p style="margin: 0; color: white; font-size: 16px; line-height: 1.6;">
        ${message}
      </p>
    </div>
    ${actionUrl ? emailButton('View Details', actionUrl) : ''}
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 12px;">
      You can manage your email preferences in your <a href="${APP_URL}/settings/notifications" style="color: #7750f8;">notification settings</a>.
    </p>
  `
  return emailWrapper(content)
}

// Badge Earned Email Template
export function badgeEarnedEmailTemplate(userName: string, badgeName: string, badgeDescription: string, xpEarned: number) {
  const content = `
    <h2 style="margin: 0 0 16px; color: white; font-size: 24px; font-weight: 700;">
      🏆 Badge Unlocked!
    </h2>
    <p style="margin: 0 0 8px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Congratulations ${userName || 'there'}! 🎉
    </p>
    <p style="margin: 0 0 24px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      You've earned a new badge for your collection!
    </p>
    <div style="margin: 24px 0; padding: 24px; background: rgba(119, 80, 248, 0.1); border-radius: 16px; text-align: center;">
      <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: linear-gradient(135deg, #7750f8, #40d04f); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">🏆</span>
      </div>
      <h3 style="margin: 0 0 8px; color: white; font-size: 20px; font-weight: 700;">
        ${badgeName}
      </h3>
      <p style="margin: 0 0 16px; color: #9aa4bf; font-size: 14px;">
        ${badgeDescription}
      </p>
      <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #40d04f, #23d2e2); border-radius: 8px;">
        <span style="color: white; font-weight: 700; font-size: 14px;">+${xpEarned} XP</span>
      </div>
    </div>
    ${emailButton('View Your Badges', `${APP_URL}/badges`)}
  `
  return emailWrapper(content)
}

// Level Up Email Template
export function levelUpEmailTemplate(userName: string, newLevel: number, totalXP: number) {
  const content = `
    <h2 style="margin: 0 0 16px; color: white; font-size: 24px; font-weight: 700;">
      ⬆️ Level Up!
    </h2>
    <p style="margin: 0 0 8px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      Amazing work ${userName || 'there'}! 🎉
    </p>
    <p style="margin: 0 0 24px; color: #9aa4bf; font-size: 16px; line-height: 1.6;">
      You've reached a new level!
    </p>
    <div style="margin: 24px 0; padding: 32px; background: linear-gradient(135deg, rgba(119, 80, 248, 0.2), rgba(64, 208, 79, 0.2)); border-radius: 16px; text-align: center;">
      <div style="width: 100px; height: 100px; margin: 0 auto 16px; background: linear-gradient(135deg, #7750f8, #40d04f); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.2);">
        <span style="color: white; font-size: 48px; font-weight: 800;">${newLevel}</span>
      </div>
      <h3 style="margin: 0 0 8px; color: white; font-size: 24px; font-weight: 700;">
        Level ${newLevel}
      </h3>
      <p style="margin: 0; color: #9aa4bf; font-size: 14px;">
        Total XP: <strong style="color: #40d04f;">${totalXP.toLocaleString()}</strong>
      </p>
    </div>
    <p style="margin: 24px 0 0; color: #9aa4bf; font-size: 16px; line-height: 1.6; text-align: center;">
      Keep up the great work! Complete more quests and earn badges to level up even faster.
    </p>
    ${emailButton('Continue Your Journey', APP_URL)}
  `
  return emailWrapper(content)
}
