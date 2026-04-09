import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
