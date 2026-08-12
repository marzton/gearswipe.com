import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-sanity-webhook-signature')
    const secret = process.env.SANITY_WEBHOOK_SECRET

    // Verify webhook signature if secret is provided
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('base64')

      if (signature !== expectedSignature) {
        return new Response('Unauthorized', { status: 401 })
      }
    }

    // Revalidate all paths on publish/unpublish
    revalidatePath('/', 'layout')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Revalidated all paths',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Revalidation error:', error)
    return new Response('Revalidation failed', { status: 500 })
  }
}
