import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useChangePassword } from '@/mutations/auth'
import { useAuth } from '@/contexts/AuthContext'

const DEFAULT_PASSWORD = 'my-company2026'

export default function ChangePassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const changePasswordMutation = useChangePassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords
    if (newPassword.length < 6) {
      setError(t('changePassword.errors.passwordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('changePassword.errors.passwordsDoNotMatch'))
      return
    }

    if (DEFAULT_PASSWORD === newPassword) {
      setError(t('changePassword.errors.samePassword'))
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: DEFAULT_PASSWORD,
        newPassword,
      })

      // Refresh user data to clear mustChangePassword flag
      await refreshUser()

      // Show success toast
      toast.success(t('changePassword.success'))

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || t('changePassword.errors.failed')
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-xl border border-border p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <LockIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            {t('changePassword.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('changePassword.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('changePassword.fields.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('changePassword.hints.newPassword')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('changePassword.fields.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePasswordMutation.isPending ? t('changePassword.buttons.changing') : t('changePassword.buttons.change')}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2 border border-border rounded-lg hover:bg-secondary text-card-foreground"
            >
              {t('changePassword.buttons.logout')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}
