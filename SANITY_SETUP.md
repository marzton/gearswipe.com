# Sanity CMS Setup for GearSwipe & Goldshore

Complete guide to set up Sanity as headless CMS for both sites with WYSIWYG page builder, auth, and email.

## Project Structure

```
Separate Sanity Projects (recommended):
├── gearswipe-cms (Sanity project)
│   └── Content for gearswipe.com
│       Studio: https://studio.gearswipe.com
│       API: https://api.sanity.io/v2025-01-01/data/query/gearswipe
│
└── goldshore-cms (Sanity project)
    └── Content for goldshore.ai
        Studio: https://studio.goldshore.ai
        API: https://api.sanity.io/v2025-01-01/data/query/goldshore
```

## Step 1: Create Sanity Projects

### 1.1 Create Gearswipe Sanity Project

```bash
# Install Sanity CLI
npm install -g sanity

# Create new project
sanity init

# Follow prompts:
# Project name: gearswipe-cms
# Dataset name: production
# Deployment: Y (auto-deploy to studio.sanity.build initially)
```

After creation, you'll have:
- **Project ID**: `abc123def456` (save this)
- **Dataset**: `production`
- **Studio URL**: `https://abc123def456.sanity.studio/`

### 1.2 Create Goldshore Sanity Project

```bash
sanity init
# Project name: goldshore-cms
# Dataset: production
```

### 1.3 Configure Studio Subdomains

In Cloudflare Dashboard for each domain:

**For gearswipe.com:**
- Go to DNS
- Add CNAME: `studio` → `gearswipe-cms.sanity.studio`
- Wait for DNS to propagate
- In Sanity dashboard → Project Settings → CORS origins
  - Add: `https://studio.gearswipe.com`

**For goldshore.ai:**
- Add CNAME: `studio` → `goldshore-cms.sanity.studio`
- In Sanity → CORS: `https://studio.goldshore.ai`

Studio URLs will now work:
- https://studio.gearswipe.com (studio.gearswipe.com → gearswipe-cms.sanity.studio)
- https://studio.goldshore.ai (studio.goldshore.ai → goldshore-cms.sanity.studio)

## Step 2: Set Up Sanity Schema

Create schema files in your Sanity projects. Save these as `schemas/` in each project:

### sanity/schemas/page.ts (both projects)

```typescript
export default {
  name: 'page',
  title: 'Pages',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'content',
      title: 'Page Content',
      type: 'blockContent',
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'SEO Title',
          type: 'string',
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
}
```

### sanity/schemas/blockContent.ts

```typescript
export default {
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Link', value: 'link' },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
    },
  ],
}
```

### sanity/schemas/settings.ts

```typescript
export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
    },
    {
      name: 'nav',
      title: 'Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string' },
            { name: 'href', type: 'string' },
          ],
        },
      ],
    },
  ],
}
```

## Step 3: Database Schema (D1)

Create auth/session database. Add to `drizzle/schema.ts` or new `db/cms-schema.ts`:

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Sessions table (NextAuth)
export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

// User preferences
export const userPreferences = sqliteTable('user_preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').default('light'),
  locale: text('locale').default('en'),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).default(true),
})

// Email logs
export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  status: text('status').notNull(), // 'sent' | 'failed' | 'pending'
  error: text('error'),
  sentAt: integer('sent_at', { mode: 'timestamp' }).notNull(),
})
```

Initialize D1 database:

```bash
# Generate migration
pnpm db:generate

# Deploy to D1
wrangler d1 migrations apply gearswipe --remote
```

## Step 4: Sanity Client Setup

Create `lib/sanity.ts`:

```typescript
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = '2025-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

// Query examples
export async function getPages() {
  return await client.fetch(`*[_type == "page"]`)
}

export async function getPage(slug: string) {
  return await client.fetch(
    `*[_type == "page" && slug.current == $slug][0]`,
    { slug }
  )
}

export async function getSettings() {
  return await client.fetch(`*[_type == "siteSettings"][0]`)
}
```

## Step 5: Email Setup (Resend)

Install and configure Resend:

```bash
npm install resend
```

Create `lib/email.ts`:

```typescript
import { Resend } from 'resend'
import { db } from './db'
import { emailLogs } from './db/schema'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const logId = crypto.randomUUID()

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@gearswipe.com',
      to,
      subject,
      html,
    })

    await db.insert(emailLogs).values({
      id: logId,
      to,
      subject,
      status: 'sent',
      sentAt: new Date(),
    })

    return { success: true, id: logId }
  } catch (error) {
    await db.insert(emailLogs).values({
      id: logId,
      to,
      subject,
      status: 'failed',
      error: String(error),
      sentAt: new Date(),
    })

    throw error
  }
}
```

## Step 6: NextAuth Integration

Update `auth.ts` to use D1 sessions:

```typescript
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import { db } from './lib/db'
import { users, sessions } from './db/schema'

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    // Add OAuth providers (Google, GitHub, etc)
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})
```

## Step 7: Environment Variables

Create `.env.local`:

```env
# Sanity (Gearswipe)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-gearswipe-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-gearswipe-token

# Email
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@gearswipe.com

# Database
D1_DATABASE_ID=your-database-id

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://gearswipe.com
```

## Step 8: Next.js Pages Integration

Create `app/[slug]/page.tsx`:

```typescript
import { getPage, getSettings } from '@/lib/sanity'
import { PortableText } from 'next-sanity'

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug)
  const settings = await getSettings()

  if (!page) return <div>Page not found</div>

  return (
    <main>
      <h1>{page.title}</h1>
      <PortableText value={page.content} />
    </main>
  )
}

export async function generateStaticParams() {
  const pages = await getPages()
  return pages.map((page) => ({ slug: page.slug.current }))
}
```

## Step 9: Cloudflare Worker Routes

**Dashboard Configuration** (Not in wrangler.toml):

For **gearswipe.com**:
- Route: `gearswipe.com/*` → gearswipe-com worker
- Route: `studio.gearswipe.com/*` → sanity (CNAME)
- Route: `api.gearswipe.com/*` → quote-api worker

For **goldshore.ai**:
- Route: `goldshore.ai/*` → gs-web-prod worker
- Route: `api.goldshore.ai/*` → gs-api-prod worker
- Route: `gateway.goldshore.ai/*` → gs-gateway-prod worker
- Route: `studio.goldshore.ai/*` → sanity (CNAME)

## Step 10: Deploy

```bash
# 1. Build
pnpm build

# 2. Deploy workers
wrangler deploy

# 3. Verify
curl https://studio.gearswipe.com  # Should redirect to Sanity studio
curl https://gearswipe.com/about   # Should load page from Sanity
```

## Sanity Studio Features

After setup, Sanity Studio (`studio.gearswipe.com`) includes:
- ✅ WYSIWYG editor (Portable Text)
- ✅ Image upload & optimization
- ✅ Real-time collaboration
- ✅ Content versioning
- ✅ Preview mode (see live changes)
- ✅ Webhooks (auto-rebuild on publish)

## Security Checklist

- [ ] Set CORS origins in Sanity dashboard
- [ ] Use Sanity API tokens (restrict scope)
- [ ] Enable webhook signing verification
- [ ] Store secrets in Cloudflare Workers environment
- [ ] Rate limit API endpoints
- [ ] Enable HTTPS only (Cloudflare Full Strict)

## References

- [Sanity Docs](https://www.sanity.io/docs)
- [next-sanity](https://github.com/sanity-io/next-sanity)
- [Portable Text](https://www.portabletext.org/)
- [Resend Email](https://resend.com/docs)
