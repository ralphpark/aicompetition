'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X, Save, Loader2 } from 'lucide-react'
import { updateBlogPost, deleteBlogPost } from '@/app/actions/blog'
import type { BlogCategory } from '@/types/database'

interface BlogAdminControlsProps {
  slug: string
  title: string
  content: string
  excerpt: string | null
  category: BlogCategory
  isPublished: boolean
}

const categoryOptions: { value: BlogCategory; label: string }[] = [
  { value: 'update', label: 'Update' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'tech', label: 'Tech' },
  { value: 'crypto', label: 'Crypto' },
]

export function BlogAdminControls({ slug, title, content, excerpt, category, isPublished }: BlogAdminControlsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  const [editExcerpt, setEditExcerpt] = useState(excerpt || '')
  const [editCategory, setEditCategory] = useState<BlogCategory>(category)
  const [error, setError] = useState('')

  const handleSave = () => {
    setError('')
    startTransition(async () => {
      const result = await updateBlogPost(slug, {
        title: editTitle,
        content: editContent,
        excerpt: editExcerpt,
        category: editCategory,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
        router.refresh()
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBlogPost(slug)
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/blog')
      }
    })
  }

  if (isEditing) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Edit Post</h3>
          <button
            onClick={() => { setIsEditing(false); setError('') }}
            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as BlogCategory)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              value={editExcerpt}
              onChange={(e) => setEditExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-mono"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setIsEditing(false); setError('') }}
              className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded font-medium">
        ADMIN
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>

      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Delete Post?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm">
              Are you sure you want to delete this post?
            </p>
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
                onClick={handleDelete}
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
    </div>
  )
}
