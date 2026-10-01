import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { ResetPasswordRequest, SuccessResponse } from '@/types/auth.types'
import ThemeToggle from '@/components/ThemeToggle'

export default function ResetPassword() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error(t("Invalid or missing reset token."))
      return
    }

    if (password !== confirmPassword) {
      toast.error(t("Passwords do not match."))
      return
    }

    if (password.length < 6) {
      toast.error(t("Password must be at least 6 characters long."))
      return
    }

    setIsLoading(true)

    try {
      const response = await axiosInstance.post<SuccessResponse>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password } as ResetPasswordRequest
      )

      toast.success(response.data.message || t("Password reset successful! Redirecting to login..."))
      setPassword('')
      setConfirmPassword('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to reset password. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="bg-card p-8 rounded-lg shadow-lg border border-border w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-card-foreground mb-4">{t("Invalid Reset Link")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("The password reset link is invalid or has expired.")}
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              {t("Request New Link")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="bg-card p-8 rounded-lg shadow-lg border border-border w-full max-w-md">
        <h1 className="text-3xl font-bold text-card-foreground mb-2 text-center">{t("Reset Password")}</h1>
        <p className="text-muted-foreground text-center mb-6">
          {t("Enter your new password below.")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">
              {t("New Password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
              required
              minLength={6}
              disabled={isLoading}
              placeholder={t("Enter new password")}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-1">
              {t("Confirm Password")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
              required
              minLength={6}
              disabled={isLoading}
              placeholder={t("Confirm new password")}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed font-medium"
            disabled={isLoading}
          >
            {isLoading ? t("Resetting...") : t("Reset Password")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            {t("Back to Login")}
          </Link>
        </div>
      </div>
    </div>
  )
}
