'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Github, Mail, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleGithubSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for confirmation link!')
    }
    setIsLoading(false)
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
    } else {
      window.location.href = '/'
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center px-4">
      {/* Background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">🏁</span>
              <span className="text-xl font-bold text-white">AI Trading Arena</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to access your account</p>
          </div>

          {/* Benefits */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 mb-3">Sign in to:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                Submit prompt improvement suggestions
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                Vote on community suggestions
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                Earn points and climb the leaderboard
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                Get rewarded for successful contributions
              </li>
            </ul>
          </div>

          {/* Sign In Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGithubSignIn}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6 text-lg"
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 py-6 text-lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-900 px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            {!showEmailForm ? (
              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 py-6 text-lg"
              >
                <Mail className="w-5 h-5 mr-3" />
                Continue with Email
              </Button>
            ) : (
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                />
                {message && (
                  <p className={`text-sm ${message.includes('Check') ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleEmailSignIn}
                    disabled={isLoading || !email || !password}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                  </Button>
                  <Button
                    onClick={handleEmailSignUp}
                    disabled={isLoading || !email || !password}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
          </p>
        </div>

        {/* Guest CTA */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Just browsing?{' '}
            <Link href="/leaderboard" className="text-green-500 hover:text-green-400">
              View the Leaderboard
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
