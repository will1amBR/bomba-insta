import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { AuthProvider } from '@/hooks/use-auth'

export default function Layout() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans">
        <Header />
        <main className="flex-1 pb-12">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  )
}
