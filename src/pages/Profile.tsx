import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'

export default function Profile() {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          <div className="h-32 bg-linear-to-r from-primary-500 to-accent-500"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-card bg-linear-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-card-foreground mb-2">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <h3 className="text-xl font-bold text-card-foreground mb-6">Profile Information</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Full Name</label>
                <div className="px-4 py-3 bg-secondary rounded-lg text-foreground">
                  {user?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Email Address</label>
                <div className="px-4 py-3 bg-secondary rounded-lg text-foreground">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Account Type</label>
                <div className="px-4 py-3 bg-secondary rounded-lg text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Premium
                  </span>
                  Premium User
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Member Since</label>
                <div className="px-4 py-3 bg-secondary rounded-lg text-foreground">
                  January 2024
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg hover:shadow-xl">
              Edit Profile
            </button>
            <button className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-lg hover:bg-secondary/80 transition-colors font-medium">
              Change Password
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <h3 className="text-xl font-bold text-card-foreground mb-6">Account Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <button className="text-primary hover:underline font-medium">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
