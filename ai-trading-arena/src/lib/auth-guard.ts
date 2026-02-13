import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server-side auth guard for protected pages.
 * Call at the top of any server component page that requires auth.
 * Replaces the deprecated middleware.ts auth pattern for Next.js 16.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}

/**
 * Redirect authenticated users away from login page.
 * Call at the top of the login page server wrapper.
 */
export async function redirectIfAuthenticated() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }
}
