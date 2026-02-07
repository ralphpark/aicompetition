'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PostContentProps {
  content: string
  className?: string
}

export function PostContent({ content, className }: PostContentProps) {
  const renderedContent = useMemo(() => {
    return content
      .split('\n')
      .map((line, index) => {
        // H1 heading
        if (line.startsWith('# ')) {
          return `<h1 key="${index}" class="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">${line.slice(2)}</h1>`
        }
        // H2 heading
        if (line.startsWith('## ')) {
          return `<h2 key="${index}" class="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">${line.slice(3)}</h2>`
        }
        // H3 heading
        if (line.startsWith('### ')) {
          return `<h3 key="${index}" class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">${line.slice(4)}</h3>`
        }
        // Unordered list item
        if (line.startsWith('- ')) {
          const text = line.slice(2)
          // Handle bold text within list items
          const processedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
          return `<li key="${index}" class="ml-6 mb-1 text-gray-700 dark:text-gray-300 list-disc">${processedText}</li>`
        }
        // Ordered list item
        if (line.match(/^\d+\.\s/)) {
          const text = line.replace(/^\d+\.\s/, '')
          const processedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
          return `<li key="${index}" class="ml-6 mb-1 text-gray-700 dark:text-gray-300 list-decimal">${processedText}</li>`
        }
        // Bold paragraph
        if (line.startsWith('**') && line.endsWith('**')) {
          return `<p key="${index}" class="font-semibold text-gray-900 dark:text-white mb-2">${line.replace(/\*\*/g, '')}</p>`
        }
        // Code block (simple)
        if (line.startsWith('```')) {
          return ''
        }
        // Inline code
        if (line.includes('`')) {
          const processedLine = line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
          return `<p key="${index}" class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${processedLine}</p>`
        }
        // Empty line = line break
        if (line.trim() === '') {
          return '<div key="${index}" class="h-4"></div>'
        }
        // Regular paragraph with bold text handling
        const processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
        return `<p key="${index}" class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${processedLine}</p>`
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
