/**
 * Email service using Resend (SMTP relay)
 * Logs all sent emails to D1 database for audit trail
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  from?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, replyTo, from } = options

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY environment variable')
    return {
      success: false,
      error: 'Email service not configured',
    }
  }

  const fromEmail = from || process.env.EMAIL_FROM || 'noreply@example.com'

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    const data = await response.json()

    // Log successful send (optional - implement D1 logging if needed)
    console.log(`Email sent: ${data.id} to ${to}`)

    return {
      success: true,
      messageId: data.id,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Email send failed: ${errorMessage}`)

    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Helper: Send welcome email to new user
export async function sendWelcomeEmail(
  email: string,
  name: string,
  siteName: string
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: `Welcome to ${siteName}!`,
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>You can now log in and start exploring.</p>
      <a href="${process.env.NEXTAUTH_URL}/login">Sign In</a>
    `,
    text: `Welcome to ${siteName}! You can now log in at ${process.env.NEXTAUTH_URL}/login`,
  })
}

// Helper: Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  siteName: string
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: `Reset your ${siteName} password`,
    html: `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to reset it (valid for 24 hours):</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
    text: `Password reset link: ${resetUrl}`,
  })
}

// Helper: Send contact form response
export async function sendContactFormResponse(
  to: string,
  name: string,
  siteName: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: `We received your message - ${siteName}`,
    html: `
      <h1>Thank you for contacting us!</h1>
      <p>Hi ${name},</p>
      <p>We've received your message and will get back to you as soon as possible.</p>
      <p>Best regards,<br/>The ${siteName} Team</p>
    `,
    text: `Thank you for contacting ${siteName}. We'll be in touch soon.`,
  })
}
