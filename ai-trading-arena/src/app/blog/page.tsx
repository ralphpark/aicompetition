import { Header } from '@/components/layout/Header'
import { BlogContent } from '@/components/blog/CategoryFilter'
import { BookOpen } from 'lucide-react'
import type { BlogCategory } from '@/types/database'
import { getBlogPosts } from '@/app/actions/blog'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog - PnL Grand Prix',
  description: 'Updates, market analysis, and insights from PnL Grand Prix'
}

// Fallback mock posts (used when database is empty)
const fallbackPosts = [
  {
    slug: 'welcome-to-ai-blog',
    title: 'Welcome to PnL Grand Prix Blog',
    excerpt: 'Welcome to PnL Grand Prix Blog. Get the latest market analysis, crypto news, and system updates.',
    category: 'update' as BlogCategory,
    published_at: new Date().toISOString(),
    cover_image: null,
  },
]

export default async function BlogPage() {
  // Fetch ALL posts once from Supabase
  const { posts: dbPosts } = await getBlogPosts()

  // Use database posts or fallback
  const posts = dbPosts.length > 0 ? dbPosts : fallbackPosts

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8 text-green-500" />
            Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Market analysis, crypto insights, and platform updates - published twice daily
          </p>
        </div>

        {/* Client-side filter + posts grid */}
        <BlogContent posts={posts} />

        {/* Blog Info */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center">
            <h2 className="text-xl font-bold mb-3">Stay Updated</h2>
            <p className="text-green-100">
              New posts are published twice daily at 9AM and 9PM,
              featuring market analysis, crypto news, tech updates, and system announcements.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
