'use server'

import { createClient } from '@/lib/supabase/server'
import type { BlogPost, BlogCategory } from '@/types/database'

export async function getBlogPosts(options?: {
  category?: BlogCategory
  limit?: number
  published?: boolean
}): Promise<{ posts: BlogPost[] }> {
  const supabase = await createClient()

  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(options?.limit || 20)

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.published !== false) {
    query = query.eq('is_published', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching blog posts:', error)
    return { posts: [] }
  }

  return { posts: data as BlogPost[] }
}

export async function getBlogPost(slug: string): Promise<{ post: BlogPost | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('Error fetching blog post:', error)
    return { post: null }
  }

  return { post: data as BlogPost }
}

export async function createBlogPost(input: {
  slug: string
  title: string
  content: string
  excerpt?: string
  category: BlogCategory
  coverImage?: string
  publish?: boolean
}): Promise<{ post?: BlogPost; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Must be logged in to create posts' }
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug: input.slug,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt || null,
      category: input.category,
      cover_image: input.coverImage || null,
      author_id: user.id,
      published_at: input.publish ? new Date().toISOString() : null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating blog post:', error)
    return { error: 'Failed to create blog post' }
  }

  return { post: data as BlogPost }
}

export async function updateBlogPost(
  slug: string,
  updates: Partial<{
    title: string
    content: string
    excerpt: string
    category: BlogCategory
    coverImage: string
    publish: boolean
  }>
): Promise<{ post?: BlogPost; error?: string }> {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}

  if (updates.title) updateData.title = updates.title
  if (updates.content) updateData.content = updates.content
  if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt
  if (updates.category) updateData.category = updates.category
  if (updates.coverImage !== undefined) updateData.cover_image = updates.coverImage
  if (updates.publish !== undefined) {
    updateData.published_at = updates.publish ? new Date().toISOString() : null
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    console.error('Error updating blog post:', error)
    return { error: 'Failed to update blog post' }
  }

  return { post: data as BlogPost }
}

export async function deleteBlogPost(slug: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('slug', slug)

  if (error) {
    console.error('Error deleting blog post:', error)
    return { success: false, error: 'Failed to delete blog post' }
  }

  return { success: true }
}

/**
 * Generate blog post content using Claude Opus via proxy
 */
export async function generateBlogContent(params: {
  topic: string
  category: BlogCategory
  additionalContext?: string
}): Promise<{ title: string; content: string; excerpt: string; ai_model: string } | { error: string }> {
  const CLAUDE_PROXY_URL = process.env.CLAUDE_PROXY_URL || 'http://172.30.1.99:3456/v1/messages'

  const systemPrompt = `You are an expert financial content writer for PnL Grand Prix, a platform where 9 AI models compete in BTC trading. Write engaging, informative blog posts.

Category Guidelines:
- update: System improvements, new features, changelog
- analysis: Market trends, AI performance analysis, trading insights
- tech: AI technology news, trading algorithms, technical deep-dives
- crypto: Cryptocurrency news, market updates, industry developments

Always write in a professional but accessible tone. Include relevant data and insights.`

  const userPrompt = `Write a blog post about: ${params.topic}

Category: ${params.category}
${params.additionalContext ? `Additional context: ${params.additionalContext}` : ''}

Format:
- Start with a compelling title (use # for heading)
- Include an engaging introduction
- Use ## for section headings
- Include bullet points or numbered lists where appropriate
- End with a summary or call to action

Keep the post between 500-1000 words.`

  try {
    const response = await fetch(CLAUDE_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ''

    // Extract title from content (first # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : params.topic

    // Generate excerpt (first paragraph after title)
    const lines = content.split('\n\n')
    const firstParagraph = lines.find((line: string, index: number) => index > 0 && line && !line.startsWith('#'))
    const excerpt = firstParagraph
      ? firstParagraph.substring(0, 200) + '...'
      : content.substring(0, 200) + '...'

    return {
      title,
      content,
      excerpt,
      ai_model: 'claude-opus-4',
    }
  } catch (error) {
    console.error('Error generating blog content:', error)
    return { error: (error as Error).message }
  }
}

/**
 * Generate cover image using Gemini Imagen
 */
export async function generateCoverImage(prompt: string): Promise<{ imageData: string; prompt: string } | { error: string }> {
  const IMAGEN_URL = process.env.IMAGEN_URL || 'http://localhost:3459'

  try {
    const response = await fetch(`${IMAGEN_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Professional blog cover image: ${prompt}. High quality, modern design, suitable for financial/crypto blog.`,
        aspectRatio: '16:9',
      }),
    })

    if (!response.ok) {
      throw new Error(`Imagen API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      imageData: data.dataUrl,
      prompt,
    }
  } catch (error) {
    console.error('Error generating cover image:', error)
    return { error: (error as Error).message }
  }
}
