import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Default sender
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Cloddy <noreply@cloddy.app>'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Get the base URL for email links
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // In development without API key, log the email
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('='.repeat(50))
      console.log('📧 EMAIL (Development Mode - No API Key)')
      console.log('='.repeat(50))
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('='.repeat(50))
      return { success: true }
    }
    console.warn('Email not configured: RESEND_API_KEY missing')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    })

    if (result.error) {
      console.error('Email send error:', result.error)
      return { success: false, error: result.error.message }
    }

    console.log('📧 Email sent successfully to:', options.to)
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${token}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify Your Email - Cloddy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #161b28;
      color: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1d2333;
      border-radius: 16px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      background: linear-gradient(135deg, #7750f8, #40d04f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 32px;
      margin: 0;
    }
    h2 {
      color: #ffffff;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #8f91ac;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7750f8, #40d04f);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2f3749;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #6c6f82;
    }
    .link {
      word-break: break-all;
      color: #7750f8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>Cloddy</h1>
    </div>
    <h2>Verify Your Email</h2>
    <p>Hey${username ? ` ${username}` : ''}! Thanks for signing up for Cloddy. To complete your registration, please verify your email address.</p>
    <p>
      <a href="${verifyUrl}" class="button">Verify Email</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p class="link">${verifyUrl}</p>
    <p><strong>This link will expire in 24 hours.</strong></p>
    <div class="footer">
      <p>If you didn't create an account with Cloddy, you can safely ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} Cloddy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
Verify Your Email - Cloddy

Hey${username ? ` ${username}` : ''}! Thanks for signing up for Cloddy. To complete your registration, please verify your email address.

Click this link to verify: ${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account with Cloddy, you can safely ignore this email.
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Cloddy',
    html,
    text
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password - Cloddy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #161b28;
      color: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1d2333;
      border-radius: 16px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      background: linear-gradient(135deg, #7750f8, #40d04f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 32px;
      margin: 0;
    }
    h2 {
      color: #ffffff;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #8f91ac;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7750f8, #40d04f);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2f3749;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #6c6f82;
    }
    .warning {
      background-color: rgba(249, 81, 92, 0.1);
      border: 1px solid rgba(249, 81, 92, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .warning p {
      color: #f9515c;
      margin: 0;
    }
    .link {
      word-break: break-all;
      color: #7750f8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>Cloddy</h1>
    </div>
    <h2>Reset Your Password</h2>
    <p>Hey${username ? ` ${username}` : ''}! We received a request to reset your password. Click the button below to create a new password.</p>
    <p>
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p class="link">${resetUrl}</p>
    <div class="warning">
      <p><strong>This link will expire in 1 hour.</strong></p>
    </div>
    <div class="footer">
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
      <p>&copy; ${new Date().getFullYear()} Cloddy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
Reset Your Password - Cloddy

Hey${username ? ` ${username}` : ''}! We received a request to reset your password.

Click this link to reset your password: ${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Cloddy',
    html,
    text
  })
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
  email: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getBaseUrl()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Cloddy!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #161b28;
      color: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1d2333;
      border-radius: 16px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      background: linear-gradient(135deg, #7750f8, #40d04f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 32px;
      margin: 0;
    }
    h2 {
      color: #ffffff;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #8f91ac;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7750f8, #40d04f);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      margin: 20px 0;
    }
    .features {
      margin: 30px 0;
    }
    .feature {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .feature-icon {
      font-size: 24px;
      margin-right: 16px;
    }
    .feature-text h3 {
      color: #ffffff;
      margin: 0 0 4px 0;
      font-size: 16px;
    }
    .feature-text p {
      margin: 0;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2f3749;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #6c6f82;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>Cloddy</h1>
    </div>
    <h2>Welcome to Cloddy!</h2>
    <p>Hey${username ? ` ${username}` : ''}! Your email has been verified and your account is ready to go. Welcome to the community!</p>

    <div class="features">
      <div class="feature">
        <span class="feature-icon">🏆</span>
        <div class="feature-text">
          <h3>Earn Badges</h3>
          <p>Complete quests and unlock achievements</p>
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon">👥</span>
        <div class="feature-text">
          <h3>Connect</h3>
          <p>Join groups and make new friends</p>
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon">⭐</span>
        <div class="feature-text">
          <h3>Level Up</h3>
          <p>Gain XP and climb the leaderboard</p>
        </div>
      </div>
    </div>

    <p>
      <a href="${appUrl}" class="button">Start Exploring</a>
    </p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Cloddy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
Welcome to Cloddy!

Hey${username ? ` ${username}` : ''}! Your email has been verified and your account is ready to go. Welcome to the community!

What you can do:
- Earn Badges: Complete quests and unlock achievements
- Connect: Join groups and make new friends
- Level Up: Gain XP and climb the leaderboard

Start exploring: ${appUrl}
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to Cloddy!',
    html,
    text
  })
}
