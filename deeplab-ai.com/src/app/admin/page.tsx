'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the admin dashboard to avoid SSR issues
const DeeplabAdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  ssr: false,
  loading: () => <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    fontSize: '18px',
    color: '#6b7280'
  }}>Loading admin dashboard...</div>
})

// FIXED: Updated password verification function to use correct endpoint
const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    console.log('🔐 Verifying admin password...')
    
    const response = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`
      }
    })

    if (response.ok) {
      console.log('✅ Password verification successful')
      return true
    } else if (response.status === 401) {
      console.log('❌ Invalid password')
      return false
    } else {
      console.warn(`⚠️ Password verification failed with status: ${response.status}`)
      return false
    }
  } catch (error) {
    console.error('❌ Password verification error:', error)
    return false
  }
}

const AdminLoginPage = () => {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(true)

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedPassword = sessionStorage.getItem('deeplab_admin_password')
      if (storedPassword) {
        console.log('🔍 Checking stored admin session...')
        const isValid = await verifyPassword(storedPassword)
        if (isValid) {
          setIsAuthenticated(true)
        } else {
          sessionStorage.removeItem('deeplab_admin_password')
        }
      }
      setIsChecking(false)
    }
    
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const isValid = await verifyPassword(password)
      
      if (isValid) {
        sessionStorage.setItem('deeplab_admin_password', password)
        setIsAuthenticated(true)
        console.log('✅ Admin login successful')
      } else {
        setError('Invalid password. Please try again.')
        setPassword('')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show admin dashboard if authenticated
  if (isAuthenticated) {
    return <DeeplabAdminDashboard />
  }

  // Show login form
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '48px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', 
        width: '100%', 
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <Shield style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
            Admin Access
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            Deeplab-ai Administration Panel
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Administrator Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                backgroundColor: isLoading ? '#f9fafb' : 'white'
              }}
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 16px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '8px',
              color: '#dc2626'
            }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: isLoading 
                ? '#9ca3af' 
                : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isLoading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'
                ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255, 255, 255, 0.3)', 
                  borderTop: '2px solid white', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              'Access Admin Panel'
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            margin: 0, 
            textAlign: 'center' 
          }}>
            Authorized personnel only. All access attempts are logged.
          </p>
        </div>
      </div>

      {/* Add spinning animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AdminLoginPage