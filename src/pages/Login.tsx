import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      // Wait a moment for the toast to be visible before navigating
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (err: any) {
      toast.error(err.message || t('auth.login.failed'))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="bg-card p-8 rounded-lg shadow-lg border border-border w-full max-w-md">
        <h1 className="text-3xl font-bold text-card-foreground mb-6 text-center">{t('auth.login.title')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">
              {t('auth.login.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
              required
              disabled={isLoading}
              placeholder={t('auth.login.emailPlaceholder')}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground">
                {t('auth.login.password')}
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
              required
              disabled={isLoading}
              placeholder={t('auth.login.passwordPlaceholder')}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed font-medium"
            disabled={isLoading}
          >
            {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
