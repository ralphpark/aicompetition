'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PostContentProps {
  content: string
  className?: string
}

function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function processInlineMarkdown(text: string): string {
  const sanitized = sanitizeText(text)
  return sanitized
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
}

export function PostContent({ content, className }: PostContentProps) {
  const renderedContent = useMemo(() => {
    return content
      .split('\n')
      .map((line, index) => {
        // H1 heading
        if (line.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">${sanitizeText(line.slice(2))}</h1>`
        }
        // H2 heading
        if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">${sanitizeText(line.slice(3))}</h2>`
        }
        // H3 heading
        if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">${sanitizeText(line.slice(4))}</h3>`
        }
        // Unordered list item
        if (line.startsWith('- ')) {
          return `<li class="ml-6 mb-1 text-gray-700 dark:text-gray-300 list-disc">${processInlineMarkdown(line.slice(2))}</li>`
        }
        // Ordered list item
        if (line.match(/^\d+\.\s/)) {
          return `<li class="ml-6 mb-1 text-gray-700 dark:text-gray-300 list-decimal">${processInlineMarkdown(line.replace(/^\d+\.\s/, ''))}</li>`
        }
        // Bold paragraph
        if (line.startsWith('**') && line.endsWith('**')) {
          return `<p class="font-semibold text-gray-900 dark:text-white mb-2">${sanitizeText(line.replace(/\*\*/g, ''))}</p>`
        }
        // Code block (simple)
        if (line.startsWith('```')) {
          return ''
        }
        // Inline code handled by processInlineMarkdown
        if (line.includes('`')) {
          return `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${processInlineMarkdown(line)}</p>`
        }
        // Empty line = line break
        if (line.trim() === '') {
          return '<div class="h-4"></div>'
        }
        // Regular paragraph with bold text handling
        return `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${processInlineMarkdown(line)}</p>`
      })
      .join('')
  }, [content])

  return (
    <article
      className={cn(
        'prose prose-lg dark:prose-invert max-w-none',
        'bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm',
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  )
}
