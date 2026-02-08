'use client'

import { useState } from 'react'
import { PostCard } from './PostCard'
import { BookOpen } from 'lucide-react'
import type { BlogCategory } from '@/types/database'

const categories: { value: BlogCategory | ''; label: string; icon: string }[] = [
  { value: '', label: 'All Posts', icon: '📚' },
  { value: 'update', label: 'Updates', icon: '📢' },
  { value: 'analysis', label: 'Analysis', icon: '📊' },
  { value: 'tech', label: 'Tech', icon: '🔧' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
]

interface Post {
  slug: string
  title: string
  excerpt: string | null
  category: BlogCategory
  published_at: string | null
  cover_image?: string | null
}

export function BlogContent({ posts }: { posts: Post[] }) {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | ''>('')

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts

  return (
    <>
      {/* Category Filter */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat.value
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-700'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              category={post.category}
              publishedAt={post.published_at}
              coverImage={post.cover_image}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No posts found in this category</p>
          <button
            onClick={() => setSelectedCategory('')}
            className="text-green-600 hover:underline text-sm mt-2 inline-block"
          >
            View all posts
          </button>
        </div>
      )}
    </>
  )
}
