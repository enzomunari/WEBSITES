// app/admin/page.tsx - Admin dashboard page with login
"use client"

import { useState, useEffect } from 'react'
import { Shield, Lock } from 'lucide-react'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already authenticated on page load
  useEffect(() => {
    const storedPassword = sessionStorage.getItem('admin_password')
    if (storedPassword) {
      console.log('🔐 Found stored admin password, verifying...')
      verifyPassword(storedPassword, true)
    }
  }, [])

  const verifyPassword = async (passwordToVerify: string, isAutoLogin: boolean = false) => {
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting admin authentication...')
      
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${passwordToVerify}`
        },
        body: JSON.stringify({
          action: 'verify',
          password: passwordToVerify
        })
      })

      console.log('🔍 Admin API response status:', response.status)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Admin API not found. Please ensure /api/admin/route.ts exists.')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📊 Admin API result:', result)

      if (result.success) {
        sessionStorage.setItem('admin_password', passwordToVerify)
        setIsAuthenticated(true)
        setPassword('')
        console.log('✅ Admin authentication successful')
      } else {
        setError(result.message || 'Authentication failed')
        if (!isAutoLogin) {
          console.log('❌ Admin authentication failed:', result.message)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      console.error('❌ Admin authentication error:', err)
      
      // Clear stored password on error
      sessionStorage.removeItem('admin_password')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }
    verifyPassword(password)
  }

  if (isAuthenticated) {
    return <AdminDashboard />
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Admin Access</h1>
          </div>
          <p className="text-slate-400">Enter admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter admin password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Password is set via ADMIN_PASSWORD environment variable
          </p>
        </div>
      </div>
    </div>
  )
}