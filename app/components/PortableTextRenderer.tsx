'use client'

import React from 'react'

interface PortableTextBlock {
  _type: string
  style?: string
  children?: Array<{
    _type: string
    text?: string
    marks?: string[]
  }>
  listItem?: string
  level?: number
  markDefs?: Array<{
    _key?: string
    _type?: string
    href?: string
  }>
  asset?: {
    url?: string
    metadata?: {
      dimensions?: {
        width: number
        height: number
      }
    }
  }
  alt?: string
  caption?: string
}

interface PortableTextProps {
  blocks: PortableTextBlock[]
}

export default function PortableTextRenderer({ blocks }: PortableTextProps) {
  if (!blocks) return null

  return (
    <div className="prose prose-invert max-w-none">
      {blocks.map((block, idx) => {
        if (block._type === 'block') {
          const Tag = block.style || 'p'
          return (
            <Tag key={idx} className={getBlockStyles(block.style)}>
              {block.children?.map((child, childIdx) => (
                <span key={childIdx} className={getMarkStyles(child.marks || [])}>
                  {child.text}
                </span>
              ))}
            </Tag>
          )
        }

        if (block._type === 'image' && block.asset?.url) {
          return (
            <figure key={idx} className="my-6">
              {/* Sanity image URLs can be remote and are not preconfigured for next/image here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.asset.url}
                alt={block.alt || 'Content image'}
                className="w-full rounded-lg"
              />
              {block.caption && (
                <figcaption className="mt-2 text-center text-sm text-gray-400">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )
        }

        return null
      })}
    </div>
  )
}

function getBlockStyles(style?: string): string {
  switch (style) {
    case 'h1':
      return 'text-4xl font-bold mt-6 mb-4'
    case 'h2':
      return 'text-3xl font-bold mt-5 mb-3'
    case 'h3':
      return 'text-2xl font-bold mt-4 mb-2'
    case 'blockquote':
      return 'border-l-4 border-purple-500 pl-4 italic my-4'
    default:
      return 'leading-relaxed mb-4'
  }
}

function getMarkStyles(marks: string[]): string {
  const styles: { [key: string]: string } = {
    strong: 'font-bold',
    em: 'italic',
    code: 'bg-gray-800 px-2 py-1 rounded font-mono text-sm',
  }
  return marks.map((mark) => styles[mark] || '').join(' ')
}
