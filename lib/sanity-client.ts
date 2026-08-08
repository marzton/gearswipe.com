import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2025-01-01'

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

// GROQ Queries

export async function getPage(slug: string) {
  return await sanityClient.fetch(
    `*[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      content,
      seo,
      publishedAt
    }`,
    { slug }
  )
}

export async function getPages() {
  return await sanityClient.fetch(
    `*[_type == "page"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      publishedAt
    }`
  )
}

export async function getSiteSettings() {
  return await sanityClient.fetch(`*[_type == "siteSettings"][0]`)
}

export async function getNavigation() {
  return await sanityClient.fetch(`*[_type == "siteSettings"][0].nav[]`)
}

export async function getPosts() {
  return await sanityClient.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      author->
    }`
  )
}

export async function getPost(slug: string) {
  return await sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      content,
      author->,
      publishedAt
    }`,
    { slug }
  )
}
