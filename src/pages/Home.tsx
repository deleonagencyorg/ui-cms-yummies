import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'

export default function Home() {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-gradient-to-br from-primary-500 via-accent-500 to-primary-700 dark:from-primary-600 dark:via-accent-600 dark:to-primary-800 rounded-2xl p-12 shadow-2xl">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xl text-white/90 mb-8">
              You are successfully logged in
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-white dark:bg-card text-primary dark:text-card-foreground px-6 py-3 rounded-lg font-semibold hover:bg-white/90 dark:hover:bg-card/80 transition-all shadow-lg hover:shadow-xl"
              >
                View Dashboard
              </Link>
              <Link
                to="/profile"
                className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all shadow-lg hover:shadow-xl"
              >
                My Profile
              </Link>
            </div>
          </div>

          {/* Quick stats or features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <div className="text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Dashboard</h3>
              <p className="text-muted-foreground text-sm">View your analytics and insights</p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <div className="text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Profile</h3>
              <p className="text-muted-foreground text-sm">Manage your account settings</p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <div className="text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Settings</h3>
              <p className="text-muted-foreground text-sm">Customize your experience</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
