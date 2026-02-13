import { redirectIfAuthenticated } from '@/lib/auth-guard'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await redirectIfAuthenticated()
  return <>{children}</>
}
