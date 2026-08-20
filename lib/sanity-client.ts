import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2025-01-01'

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      token: process.env.SANITY_API_TOKEN,
    })
  : null

// GROQ Queries

export async function getPage(slug: string) {
  if (!sanityClient) return null
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
  if (!sanityClient) return []
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
  if (!sanityClient) return null
  return await sanityClient.fetch(`*[_type == "settings"][0]`)
}

export async function getNavigation() {
  if (!sanityClient) return []
  return await sanityClient.fetch(`*[_type == "settings"][0].navigation[]`)
}

export async function getPosts() {
  if (!sanityClient) return []
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
  if (!sanityClient) return null
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
