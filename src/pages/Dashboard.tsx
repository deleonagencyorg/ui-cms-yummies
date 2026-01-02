import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground mb-6">
            This is your dashboard overview. Here you can see all your important metrics and data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 dark:bg-primary-950/20 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">1,234</p>
              <p className="text-sm text-primary-600/70 dark:text-primary-400/70 mt-2">+12% from last month</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Active Sessions</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">456</p>
              <p className="text-sm text-green-600/70 dark:text-green-400/70 mt-2">+8% from last month</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$12,345</p>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70 mt-2">+23% from last month</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <h3 className="text-xl font-bold text-card-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">User Activity {item}</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
