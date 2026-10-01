import { useState, type ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Navbar onMenuClick={toggleSidebar} />

      {/* Main content */}
      <main className="pt-16 lg:pl-64 transition-all">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
