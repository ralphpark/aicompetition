'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Trash2, Loader2 } from 'lucide-react'
import { deleteBlogPost } from '@/app/actions/blog'
import type { BlogCategory } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  slug: string
  title: string
  excerpt: string | null
  category: BlogCategory
  publishedAt: string | null
  coverImage?: string | null
  isAdmin?: boolean
}

const categoryConfig: Record<BlogCategory, { label: string; color: string }> = {
  update: { label: 'Update', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  analysis: { label: 'Analysis', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  tech: { label: 'Tech', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  crypto: { label: 'Crypto', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export function PostCard({ slug, title, excerpt, category, publishedAt, coverImage, isAdmin }: PostCardProps) {
  const config = categoryConfig[category]
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    startTransition(async () => {
      await deleteBlogPost(slug)
      setShowDeleteConfirm(false)
      router.refresh()
    })
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative"
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
                  {category === 'update' && '\uD83D\uDCE2'}
                  {category === 'analysis' && '\uD83D\uDCCA'}
                  {category === 'tech' && '\uD83D\uDD27'}
                  {category === 'crypto' && '\u20BF'}
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

        {/* Admin Delete Button */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors z-10"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </motion.article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Delete Post?</h3>
            <p className="text-sm font-medium mb-4 truncate">&ldquo;{title}&rdquo;</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
