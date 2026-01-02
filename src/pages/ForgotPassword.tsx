import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { ForgotPasswordRequest, SuccessResponse } from '@/types/auth.types'
import ThemeToggle from '@/components/ThemeToggle'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axiosInstance.post<SuccessResponse>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email } as ForgotPasswordRequest
      )

      toast.success(response.data.message || 'Password reset link has been sent to your email.')
      setEmail('')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to send reset link. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="bg-card p-8 rounded-lg shadow-lg border border-border w-full max-w-md">
        <h1 className="text-3xl font-bold text-card-foreground mb-2 text-center">Forgot Password</h1>
        <p className="text-muted-foreground text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
              required
              disabled={isLoading}
              placeholder="your@email.com"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
