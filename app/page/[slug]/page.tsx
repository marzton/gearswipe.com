import { getPage, getPages } from '@/lib/sanity-client'
import PortableTextRenderer from '@/app/components/PortableTextRenderer'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageParams {
  slug: string
}

type PageRecord = {
  title: string
  description?: string
  publishedAt?: string
  seo?: {
    title?: string
    keywords?: string[]
  }
}

type PageListing = {
  slug?: {
    current?: string
  }
}

export async function generateStaticParams() {
  const pages = (await getPages()) as PageListing[]
  return pages
    .filter((page) => Boolean(page.slug?.current))
    .map((page) => ({
      slug: page.slug!.current!,
    }))
}

export async function generateMetadata(
  { params }: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { slug } = await params
  const page = (await getPage(slug)) as PageRecord | null

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: page.seo?.title || page.title,
    description: page.description || page.seo?.keywords?.join(', '),
    keywords: page.seo?.keywords || [],
  }
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params
  const page = (await getPage(slug)) as (PageRecord & {
    content?: unknown[]
  }) | null

  if (!page) {
    notFound()
  }

  return (
    <article className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          {page.description && (
            <p className="text-xl text-gray-400">{page.description}</p>
          )}
          {page.publishedAt && (
            <time className="text-sm text-gray-500">
              {new Date(page.publishedAt).toLocaleDateString()}
            </time>
          )}
        </header>

        <div className="prose prose-invert max-w-none">
          {page.content && <PortableTextRenderer blocks={page.content} />}
        </div>
      </div>
    </article>
  )
}
