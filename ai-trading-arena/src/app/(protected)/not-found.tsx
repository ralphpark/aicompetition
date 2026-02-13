import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🏁</div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Looks like this racer took a wrong turn. The page you're looking for doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Back to Arena
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
