"use server"

import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Default sender
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Cloddy <noreply@cloddy.app>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!resend) {
    console.warn('Email not configured: RESEND_API_KEY missing')
    // In development, log the email instead
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email (dev mode):', { to, subject })
      return { success: true, id: 'dev-mock-id' }
    }
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    if (result.error) {
      console.error('Email send error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Batch send emails
export async function sendBatchEmails(emails: SendEmailParams[]) {
  if (!resend) {
    console.warn('Email not configured: RESEND_API_KEY missing')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const results = await Promise.all(
      emails.map(email => sendEmail(email))
    )
    return { success: true, results }
  } catch (error) {
    console.error('Batch email error:', error)
    return { success: false, error: 'Failed to send batch emails' }
  }
}
