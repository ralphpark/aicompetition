'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Tag } from 'lucide-react'
import type { BlogCategory } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  slug: string
  title: string
  excerpt: string | null
  category: BlogCategory
  publishedAt: string | null
  coverImage?: string | null
}

const categoryConfig: Record<BlogCategory, { label: string; color: string }> = {
  update: { label: 'Update', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  analysis: { label: 'Analysis', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  tech: { label: 'Tech', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  crypto: { label: 'Crypto', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export function PostCard({ slug, title, excerpt, category, publishedAt, coverImage }: PostCardProps) {
  const config = categoryConfig[category]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/blog/${slug}`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border dark:border-gray-700 h-full flex flex-col">
          {/* Cover Image */}
          {coverImage ? (
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <span className="text-4xl opacity-50">
                {category === 'update' && '📢'}
                {category === 'analysis' && '📊'}
                {category === 'tech' && '🔧'}
                {category === 'crypto' && '₿'}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category & Date */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
                {config.label}
              </span>
              {publishedAt && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(publishedAt)}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
              {title}
            </h3>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                {excerpt}
              </p>
            )}

            {/* Read More */}
            <div className="mt-3 pt-3 border-t dark:border-gray-700">
              <span className="text-sm text-green-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Read more <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
