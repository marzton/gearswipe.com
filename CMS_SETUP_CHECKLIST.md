# CMS Setup Checklist - GearSwipe & Goldshore

Complete checklist for deploying Sanity CMS + Auth + Email to both sites.

## Pre-Setup Requirements

- [ ] Cloudflare account with both domains registered
- [ ] Terminal/CLI access
- [ ] GitHub account (for code)
- [ ] Resend account (https://resend.com) for email
- [ ] Sanity account (https://sanity.io) - free tier available

## Phase 1: Sanity Project Creation

### Gearswipe CMS

- [ ] Go to https://sanity.io/dashboard
- [ ] Create new project: `gearswipe-cms`
- [ ] Save Project ID: `_________________`
- [ ] Create dataset: `production`
- [ ] Create API token (Content, Assets, Drafts write) - save as `SANITY_API_TOKEN`
- [ ] Deploy Sanity studio: `sanity deploy`
- [ ] Note initial studio URL (e.g., `https://abc123.sanity.studio`)

### Goldshore CMS

- [ ] Create new project: `goldshore-cms`
- [ ] Save Project ID: `_________________`
- [ ] Create dataset: `production`
- [ ] Create API token - save
- [ ] Deploy Sanity studio: `sanity deploy`

## Phase 2: Studio Subdomain Setup

### DNS Configuration

**Gearswipe:**
- [ ] Cloudflare Dashboard → DNS
- [ ] Add CNAME record:
  - Name: `studio`
  - Target: `gearswipe-cms.sanity.studio`
  - Proxy: Proxied (orange)
- [ ] Wait for DNS propagation (~5 min)
- [ ] Test: Visit https://studio.gearswipe.com (should load Sanity Studio)

**Goldshore:**
- [ ] Add CNAME record:
  - Name: `studio`
  - Target: `goldshore-cms.sanity.studio`
  - Proxy: Proxied
- [ ] Test: Visit https://studio.goldshore.ai

### Sanity CORS Configuration

**Gearswipe:**
- [ ] Sanity Dashboard → gearswipe-cms → Settings
- [ ] CORS Origins → Add:
  - `https://studio.gearswipe.com`
  - `https://gearswipe.com` (for frontend preview)
- [ ] Save

**Goldshore:**
- [ ] Sanity Dashboard → goldshore-cms → Settings
- [ ] CORS Origins → Add:
  - `https://studio.goldshore.ai`
  - `https://goldshore.ai`

## Phase 3: Sanity Schema Setup

- [ ] Copy schema files to `sanity/schemas/`:
  - [ ] `page.ts`
  - [ ] `blockContent.ts`
  - [ ] `settings.ts`
  - [ ] Create `post.ts` (if using blog)
  - [ ] Create `author.ts` (if using blog)

- [ ] Update `sanity.config.ts`:
  ```typescript
  import page from './schemas/page'
  import blockContent from './schemas/blockContent'
  import settings from './schemas/settings'
  
  export default defineConfig({
    name: 'gearswipe',
    title: 'GearSwipe CMS',
    projectId: process.env.SANITY_PROJECT_ID!,
    dataset: 'production',
    plugins: [deskTool(), imageUrlBuilder(urlBuilder())],
    schema: {
      types: schemaTypes.concat([page, blockContent, settings]),
    },
  })
  ```

- [ ] Deploy to Sanity: `sanity deploy`
- [ ] Create initial content:
  - [ ] Add "Home" page (slug: `home`)
  - [ ] Add site settings (title, logo, navigation)
  - [ ] Add "About" page (optional)

## Phase 4: Email Setup (Resend)

- [ ] Go to https://resend.com
- [ ] Sign up or log in
- [ ] Create new project: `gearswipe`
- [ ] Add verified domain: `gearswipe.com`
  - [ ] Go to Resend → Domains
  - [ ] Add domain, follow verification steps
  - [ ] Add DNS records in Cloudflare
  - [ ] Wait for verification (usually instant)
- [ ] Copy API key: `re_________________`
- [ ] Store as `RESEND_API_KEY` env var
- [ ] Repeat for `goldshore.ai`

## Phase 5: Database Setup (D1)

- [ ] In Cloudflare Dashboard → Workers & Pages → D1
- [ ] Create database: `gearswipe-cms`
- [ ] Copy database ID: `_________________`
- [ ] Create Drizzle migration:
  ```bash
  pnpm db:generate
  ```
- [ ] Deploy to D1:
  ```bash
  wrangler d1 migrations apply gearswipe-cms --remote
  ```
- [ ] Verify tables:
  ```bash
  wrangler d1 execute gearswipe-cms --remote "SELECT name FROM sqlite_master WHERE type='table'"
  ```

## Phase 6: Environment Variables

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in values:
  - [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - [ ] `SANITY_API_TOKEN`
  - [ ] `RESEND_API_KEY`
  - [ ] `EMAIL_FROM`
  - [ ] `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
  - [ ] `NEXTAUTH_URL`
  - [ ] `D1_DATABASE_ID`

- [ ] For Goldshore, create separate `.env.goldshore.local` with different values

## Phase 7: Authentication Setup

- [ ] Update `auth.ts` to use D1 adapter:
  ```typescript
  import { DrizzleAdapter } from '@auth/drizzle-adapter'
  import { db } from '@/db'
  
  export const { auth, handlers } = NextAuth({
    adapter: DrizzleAdapter(db),
    // ... rest of config
  })
  ```

- [ ] Add auth routes:
  ```typescript
  // app/auth/[...nextauth]/route.ts
  export const { GET, POST } = handlers
  ```

- [ ] Create login page: `app/login/page.tsx`
- [ ] Create signup page: `app/signup/page.tsx`
- [ ] Add logout button to header

## Phase 8: Next.js Integration

- [ ] Create page template `app/[slug]/page.tsx`:
  ```typescript
  import { getPage } from '@/lib/sanity-client'
  
  export default async function Page({ params }) {
    const page = await getPage(params.slug)
    // Render page with Portable Text
  }
  ```

- [ ] Create blog posts page (if using)
- [ ] Add Sanity preview mode (for draft viewing)
- [ ] Set up ISR (Incremental Static Regeneration)

## Phase 9: Webhook Setup (Auto-revalidation)

- [ ] In Sanity studio → Settings → API
- [ ] Add Webhook for publish events:
  - [ ] URL: `https://gearswipe.com/api/revalidate`
  - [ ] Events: `Publish`, `Unpublish`
  - [ ] Add secret token (use `process.env.SANITY_WEBHOOK_SECRET`)

- [ ] Create revalidation endpoint:
  ```typescript
  // app/api/revalidate/route.ts
  import { revalidatePath } from 'next/cache'
  
  export async function POST(req: Request) {
    const token = req.headers.get('x-sanity-webhook-signature')
    if (token !== process.env.SANITY_WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    revalidatePath('/')
    return new Response('Revalidated', { status: 200 })
  }
  ```

## Phase 10: Deployment

- [ ] Build locally:
  ```bash
  pnpm build
  ```
- [ ] Test locally:
  ```bash
  pnpm dev
  ```
- [ ] Verify Sanity queries work
- [ ] Test auth flow (signup/login)
- [ ] Test email sending

- [ ] Deploy to production:
  ```bash
  wrangler deploy
  ```

- [ ] Post-deployment checks:
  - [ ] Homepage loads from Sanity
  - [ ] Sanity Studio accessible at `studio.gearswipe.com`
  - [ ] Login works
  - [ ] Email sending works (check Resend dashboard)
  - [ ] Pages can be edited in Sanity and appear on site

## Phase 11: Content Management

- [ ] Train team on Sanity Studio:
  - [ ] How to create pages
  - [ ] How to use WYSIWYG editor (Portable Text)
  - [ ] How to upload images
  - [ ] How to publish changes

- [ ] Create initial content:
  - [ ] Homepage
  - [ ] About page
  - [ ] Contact page
  - [ ] Navigation menu (in Settings)
  - [ ] Footer links (in Settings)

## Phase 12: Security & Monitoring

- [ ] Enable CORS restrictions:
  - [ ] Sanity dashboard → Settings → CORS Origins
  - [ ] Only add necessary origins

- [ ] Set up API logging:
  - [ ] Log all email sends in D1
  - [ ] Log all auth events

- [ ] Set rate limits:
  - [ ] Cloudflare → Security → Rate Limiting
  - [ ] Limit login attempts
  - [ ] Limit API endpoints

- [ ] Enable HTTPS only:
  - [ ] Cloudflare → SSL/TLS
  - [ ] Encryption Mode: Full (Strict)
  - [ ] Always Use HTTPS: On

- [ ] Monitor email delivery:
  - [ ] Check Resend dashboard for bounces
  - [ ] Monitor D1 email_logs table

## Troubleshooting

### Studio not loading at studio.gearswipe.com
- [ ] Check CNAME DNS record
- [ ] Verify CORS origins in Sanity
- [ ] Clear browser cache

### Pages not appearing on site
- [ ] Check `NEXT_PUBLIC_SANITY_PROJECT_ID`
- [ ] Verify Sanity query in `lib/sanity-client.ts`
- [ ] Check Sanity studio for published pages
- [ ] Run: `pnpm build && pnpm dev`

### Emails not sending
- [ ] Check `RESEND_API_KEY` in environment
- [ ] Verify domain in Resend (check verification status)
- [ ] Check Resend dashboard for failed sends
- [ ] Verify email address is in "To" field

### Auth not working
- [ ] Check `NEXTAUTH_SECRET` is set
- [ ] Verify `NEXTAUTH_URL` matches domain
- [ ] Check D1 database has `users` table
- [ ] Review NextAuth logs: `wrangler tail`

## Monitoring & Maintenance

- [ ] Weekly:
  - [ ] Check email delivery in Resend
  - [ ] Review auth logs in D1
  - [ ] Check Cloudflare analytics for errors

- [ ] Monthly:
  - [ ] Review content audit log
  - [ ] Check for unused users
  - [ ] Update dependencies: `pnpm update`

- [ ] Quarterly:
  - [ ] Review security settings
  - [ ] Audit API token access
  - [ ] Performance review

---

**Estimated Setup Time:** 2-4 hours (first time)
**Ongoing Maintenance:** 30 min/month

**Questions?** Refer to:
- [SANITY_SETUP.md](./SANITY_SETUP.md) - Detailed technical guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Worker deployment guide
- [Sanity Docs](https://www.sanity.io/docs)
- [Resend Docs](https://resend.com/docs)
