import { Header } from '@/components/layout/Header'
import { PostContent } from '@/components/blog/PostContent'
import { TradingViewWidget } from '@/components/blog/TradingViewWidget'
import { ArrowLeft, Calendar, Share2, Twitter, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { BlogCategory } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { getBlogPost } from '@/app/actions/blog'

const categoryConfig: Record<BlogCategory, { label: string; color: string; icon: string }> = {
  update: { label: 'Update', color: 'bg-blue-100 text-blue-700', icon: '📢' },
  analysis: { label: 'Analysis', color: 'bg-green-100 text-green-700', icon: '📊' },
  tech: { label: 'Tech', color: 'bg-purple-100 text-purple-700', icon: '🔧' },
  crypto: { label: 'Crypto', color: 'bg-amber-100 text-amber-700', icon: '₿' },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { post } = await getBlogPost(slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: `${post.title} - PnL Grand Prix Blog`,
    description: post.excerpt || post.content.substring(0, 160),
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { post } = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const config = categoryConfig[post.category] || categoryConfig.update
  const showTradingView = post.category === 'analysis' || post.category === 'crypto'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Post Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1 ${config.color}`}>
              <span>{config.icon}</span>
              {config.label}
            </span>
            {post.published_at && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at, { showYear: true })}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                A
              </div>
              <div>
                <p className="font-medium text-sm">PnL Grand Prix</p>
                <p className="text-xs text-gray-500">Editorial Team</p>
              </div>
            </div>
          </div>
        </header>

        {/* TradingView Chart for analysis/crypto posts */}
        {showTradingView && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-green-500">📊</span> Live BTC Chart
            </h3>
            <TradingViewWidget
              symbol="BINANCE:BTCUSDT"
              interval="240"
              theme="dark"
              height={400}
            />
          </div>
        )}

        {/* Post Content */}
        <PostContent content={post.content} />


        {/* Share */}
        <div className="mt-8 pt-8 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">Share this post</p>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts CTA */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-2">Want more insights?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            New posts are published twice daily at 9AM and 9PM.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </main>
    </div>
  )
}
