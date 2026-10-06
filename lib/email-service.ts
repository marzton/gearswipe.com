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

// Helper: Send auto-reply from worker
export async function sendAutoReply(
  to: string,
  subject: string,
  message: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: `Auto-reply: ${subject}`,
    html: `
      <p>${message}</p>
      <p>This is an automated response. We will review your message shortly.</p>
    `,
    text: message,
  })
}

// Helper: Notify a mail route's internal recipients about a form submission.
// `route` comes from lib/mail-routing.ts's resolveMailRoute() and carries the
// `to`/`cc`/`from` addresses for the workspace + form type being notified.
export async function sendMailRouteNotification(options: {
  route: { to: string[]; cc: string[]; from: string; subjectPrefix: string }
  subject: string
  name: string
  email: string
  company?: string
  message: string
  formType: 'contact' | 'quote' | 'auth' | 'support' | 'subscribe'
}): Promise<SendEmailResult> {
  const { route, subject, name, email, company, message, formType } = options

  const typeLabel = {
    contact: 'Contact Form',
    quote: 'Quote Request',
    auth: 'Access Request',
    support: 'Support Request',
    subscribe: 'Newsletter Signup',
  }[formType]

  const bodyLines = [
    name ? `Name: ${name}` : null,
    email ? `Email: ${email}` : null,
    company ? `Company: ${company}` : null,
    '',
    message,
  ].filter((line): line is string => line !== null)

  return sendEmail({
    to: route.to,
    from: route.from,
    replyTo: email || undefined,
    subject: `${route.subjectPrefix} ${typeLabel}: ${subject}`,
    html: `
      <h2>${typeLabel} Received</h2>
      ${bodyLines.map((line) => `<p>${line}</p>`).join('\n')}
      <p>Review this submission in the admin dashboard.</p>
    `,
    text: bodyLines.join('\n'),
  })
}

// Helper: Send a signup email-verification code to the person signing up.
export async function sendVerificationCodeEmail(
  to: string,
  code: string,
  siteName: string
): Promise<SendEmailResult> {
  // No email provider configured outside production: log instead of failing
  // closed, so the verify step stays testable locally without a real key.
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'production') {
    console.log(`[dev] Verification code for ${to}: ${code}`)
    return { success: true, messageId: 'dev-console-log' }
  }

  return sendEmail({
    to,
    subject: `Your ${siteName} verification code: ${code}`,
    html: `
      <h1>Verify your email</h1>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
    text: `Your ${siteName} verification code is ${code}. It expires in 10 minutes.`,
  })
}
