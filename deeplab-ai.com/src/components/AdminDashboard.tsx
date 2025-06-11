'use client'

import { useState, useEffect } from 'react'
import { getAllUsers, updateUserCredits } from '@/utils/userStorage'
import { 
  Users, 
  Camera, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Download,
  Plus,
  Ban,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalGenerations: number
  totalSuccessfulGenerations: number
  totalFailedGenerations: number
  totalCreditsUsed: number
  lastUpdated: string
}

interface UserData {
  userId: string
  deviceId: string
  credits: number
  lastFreeTrialDate: string | null
  firstVisitDate: string
  lastVisitDate: string
  totalGenerations: number
  totalFreeTrialsUsed: number
  isBlocked: boolean
  site: string
}

interface GenerationRecord {
  id: string
  userId: string
  deviceId: string
  site: string
  timestamp: string
  success: boolean
  metadata: Record<string, unknown>
}

interface UserEvent {
  id: string
  userId: string
  deviceId: string
  site: string
  eventType: string
  timestamp: string
  metadata: Record<string, unknown>
}

const usersData = await getAllUsers()
console.log('Loaded users:', Object.keys(usersData).length) // Use the variable

const DeeplabAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<Record<string, UserData>>({})
  const [generations, setGenerations] = useState<GenerationRecord[]>([])
  const [events, setEvents] = useState<UserEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [creditsToAdd, setCreditsToAdd] = useState(10)

  const adminPassword = typeof window !== 'undefined' ? sessionStorage.getItem('deeplab_admin_password') : null

  const fetchData = async (endpoint: string) => {
    if (!adminPassword) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`/api/admin?type=${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${adminPassword}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
    }

    return response.json()
  }

  const performAction = async (action: string, data: Record<string, unknown> = {}) => {
    if (!adminPassword) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminPassword}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, ...data })
    })

    if (!response.ok) {
      throw new Error(`Action ${action} failed: ${response.status}`)
    }

    return response.json()
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsData, usersData, generationsData, eventsData] = await Promise.all([
        fetchData('stats'),
        fetchData('users'),
        fetchData('generations'),
        fetchData('userEvents')
      ])

      setStats(statsData)
      setUsers(usersData)
      // FIXED: Sort by most recent first
      setGenerations(generationsData.sort((a: GenerationRecord, b: GenerationRecord) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
      setEvents(eventsData.sort((a: UserEvent, b: UserEvent) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    } catch (err) {
      console.error('Failed to load admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchDataInternal = async (endpoint: string) => {
      if (!adminPassword) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/admin?type=${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${adminPassword}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
      }

      return response.json()
    }

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [statsData, usersData, generationsData, eventsData] = await Promise.all([
          fetchDataInternal('stats'),
          fetchDataInternal('users'),
          fetchDataInternal('generations'),
          fetchDataInternal('userEvents')
        ])

        setStats(statsData)
        setUsers(usersData)
        // FIXED: Sort by most recent first
        setGenerations(generationsData.sort((a: GenerationRecord, b: GenerationRecord) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
        setEvents(eventsData.sort((a: UserEvent, b: UserEvent) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
      } catch (err) {
        console.error('Failed to load admin data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [adminPassword])

  const addCreditsToUser = async (userId: string, amount: number) => {
    try {
      await performAction('addCredits', { userId, amount })
      await loadAllData() // Refresh data
      alert(`Successfully added ${amount} credits to user`)
    } catch (err) {
      console.error('Failed to add credits:', err)
      alert('Failed to add credits')
    }
  }

  const toggleUserBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await performAction('blockUser', { userId, blocked: !isBlocked })
      await loadAllData() // Refresh data
      alert(`User ${!isBlocked ? 'blocked' : 'unblocked'} successfully`)
    } catch (err) {
      console.error('Failed to toggle user block:', err)
      alert('Failed to update user status')
    }
  }

  const cleanOldData = async () => {
    try {
      const result = await performAction('cleanOldData')
      await loadAllData() // Refresh data
      alert(`Cleaned old data: ${result.result.eventsRemoved} events, ${result.result.generationsRemoved} generations`)
    } catch (err) {
      console.error('Failed to clean old data:', err)
      alert('Failed to clean old data')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      return `${diffDays}d ago`
    } catch {
      return 'Unknown'
    }
  }

  if (loading) {
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
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '16px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '32px', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <AlertCircle style={{ width: '48px', height: '48px', color: '#dc2626', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            Error Loading Dashboard
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={loadAllData}
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '16px 0' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Shield style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Deeplab-ai Admin
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Administration Dashboard
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={loadAllData}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: '#3b82f6', 
                  color: 'white', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                Refresh
              </button>
              
              <button
                onClick={() => {
                  sessionStorage.removeItem('deeplab_admin_password')
                  window.location.reload()
                }}
                style={{ 
                  background: '#dc2626', 
                  color: 'white', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Navigation Tabs */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            background: 'white', 
            padding: '8px', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp style={{ width: '16px', height: '16px' }} /> },
              { id: 'users', label: 'Users', icon: <Users style={{ width: '16px', height: '16px' }} /> },
              { id: 'generations', label: 'Generations', icon: <Camera style={{ width: '16px', height: '16px' }} /> },
              { id: 'events', label: 'Events', icon: <Activity style={{ width: '16px', height: '16px' }} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { 
                  title: 'Total Users', 
                  value: stats.totalUsers.toLocaleString(), 
                  icon: <Users style={{ width: '24px', height: '24px' }} />,
                  color: '#3b82f6'
                },
                { 
                  title: 'Total Generations', 
                  value: stats.totalGenerations.toLocaleString(), 
                  icon: <Camera style={{ width: '24px', height: '24px' }} />,
                  color: '#8b5cf6'
                },
                { 
                  title: 'Success Rate', 
                  value: `${Math.round((stats.totalSuccessfulGenerations / Math.max(stats.totalGenerations, 1)) * 100)}%`, 
                  icon: <CheckCircle style={{ width: '24px', height: '24px' }} />,
                  color: '#10b981'
                },
                { 
                  title: 'Credits Used', 
                  value: stats.totalCreditsUsed.toLocaleString(), 
                  icon: <Zap style={{ width: '24px', height: '24px' }} />,
                  color: '#f59e0b'
                }
              ].map((stat, index) => (
                <div 
                  key={index}
                  style={{ 
                    background: 'white', 
                    padding: '24px', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {stat.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Actions */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb' 
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>
                Admin Actions
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={cleanOldData}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: '#f59e0b', 
                    color: 'white', 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Clean Old Data
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb' 
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>
                Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.slice(0, 5).map((event, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {event.eventType.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        User: {event.userId}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatRelativeTime(event.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                Users ({Object.keys(users).length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.values(users)
                .sort((a, b) => new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime())
                .map((user, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    background: user.isBlocked ? '#fef2f2' : '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {user.userId}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Credits: {user.credits} | Generations: {user.totalGenerations} | 
                      Last Visit: {formatRelativeTime(user.lastVisitDate)}
                      {user.isBlocked && <span style={{ color: '#dc2626', fontWeight: '600' }}> (BLOCKED)</span>}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={creditsToAdd}
                      onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 1)}
                      min="1"
                      max="100"
                      style={{
                        width: '60px',
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                    <button
                      onClick={() => addCreditsToUser(user.userId, creditsToAdd)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        background: '#10b981', 
                        color: 'white', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <Plus style={{ width: '12px', height: '12px' }} />
                      Add
                    </button>
                    <button
                      onClick={() => toggleUserBlock(user.userId, user.isBlocked)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        background: user.isBlocked ? '#10b981' : '#dc2626', 
                        color: 'white', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <Ban style={{ width: '12px', height: '12px' }} />
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generations Tab */}
        {activeTab === 'generations' && (
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
              Recent Generations ({generations.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {generations.slice(0, 50).map((generation, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: generation.success ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {generation.userId}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(generation.timestamp)} | 
                      Environment: {(generation.metadata as Record<string, unknown>)?.environment as string || 'Unknown'} | 
                      Style: {(generation.metadata as Record<string, unknown>)?.style as string || 'Unknown'}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {generation.success ? (
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                    ) : (
                      <XCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                    )}
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: generation.success ? '#10b981' : '#dc2626'
                    }}>
                      {generation.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
              Recent Events ({events.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.slice(0, 100).map((event, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      {event.eventType.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      User: {event.userId} | {formatDate(event.timestamp)}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatRelativeTime(event.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default DeeplabAdminDashboard