// components/AdminDashboard.tsx - Complete admin dashboard component
import React, { useState, useEffect, useCallback } from 'react';
import { Users, Image as ImageIcon, Activity, Shield, Plus, Minus, Search, RefreshCw, Ban, Check, TrendingUp } from 'lucide-react';
import { getAllUsers, updateUserCredits } from '@/utils/userStorage'


interface UserData {
  userId: string;
  deviceId: string;
  credits: number;
  lastFreeTrialDate: string | null;
  firstVisitDate: string;
  lastVisitDate: string;
  totalGenerations: number;
  totalFreeTrialsUsed: number;
  isBlocked?: boolean;
}

interface GenerationEvent {
  userId: string;
  deviceId: string;
  pose: string;
  gender: string;
  success: boolean;
  error?: string;
  timestamp: string;
  ipAddress?: string;
}

interface UserEvent {
  userId: string;
  deviceId: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

interface AdminStats {
  totalUsers: number;
  activeUsers24h: number;
  totalGenerations: number;
  generationsToday: number;
  queueLength: number;
  totalCreditsIssued: number;
  totalFreeTrials: number;
}

interface QueueData {
  comfyuiStatus: string;
  queue: {
    running: Array<{
      promptId: string;
      position: number;
      userId: string;
      pose: string;
      gender: string;
      timestamp: string;
      progress: number;
      estimatedTime: number;
    }>;
    pending: Array<{
      promptId: string;
      position: number;
      userId: string;
      pose: string;
      gender: string;
      timestamp: string;
      estimatedTime: number;
    }>;
    recentCompleted: Array<{
      promptId: string;
      userId: string;
      status: string;
      timestamp: string;
      pose: string;
      gender: string;
    }>;
    totalInQueue: number;
  };
  timestamp: string;
}

const usersData = await getAllUsers()
console.log('Loaded users:', Object.keys(usersData).length) // Use the variable

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationEvent[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers24h: 0,
    totalGenerations: 0,
    generationsToday: 0,
    queueLength: 0,
    totalCreditsIssued: 0,
    totalFreeTrials: 0
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'generations' | 'queue'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAmount, setCreditAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get admin password for API calls
  const getAdminPassword = useCallback(() => {
    const storedPassword = sessionStorage.getItem('admin_password');
    if (storedPassword) {
      console.log('🔐 Using stored admin password from session');
      return storedPassword;
    }
    
    console.error('❌ No admin password found in session - please login again');
    alert('Session expired. Please login again.');
    window.location.reload();
    return '';
  }, []);

  // Fetch queue data
  const fetchQueueData = useCallback(async () => {
    console.log('🔄 Loading queue data...');
    setLoading(true);
    
    try {
      const adminPassword = getAdminPassword();
      
      const response = await fetch('/api/admin?type=queue', {
        headers: { 'Authorization': `Bearer ${adminPassword}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueueData(data);
        console.log('✅ Queue data loaded successfully');
      } else {
        console.error('❌ Failed to fetch queue data:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  }, [getAdminPassword]);

  // Load centralized data from server
  const loadCentralizedData = useCallback(async () => {
    console.log('🔄 Loading centralized admin data...');
    setLoading(true);
    
    try {
      const adminPassword = getAdminPassword();
      
      // Fetch stats
      const statsRes = await fetch('/api/admin?type=stats', {
        headers: { 'Authorization': `Bearer ${adminPassword}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Fetch users
      const usersRes = await fetch('/api/admin?type=users', {
        headers: { 'Authorization': `Bearer ${adminPassword}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Object.values(usersData));
      }
      
      // Fetch generations
      const genRes = await fetch('/api/admin?type=generations', {
        headers: { 'Authorization': `Bearer ${adminPassword}` }
      });
      if (genRes.ok) {
        const genData = await genRes.json();
        setGenerationHistory(genData);
      }
      
      // Fetch events
      const eventsRes = await fetch('/api/admin?type=userEvents', {
        headers: { 'Authorization': `Bearer ${adminPassword}` }
      });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setUserEvents(eventsData);
      }
      
      // Fetch queue data if on queue tab
      if (activeTab === 'queue') {
        await fetchQueueData();
      }
      
      console.log('✅ Centralized data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load centralized data:', error);
    } finally {
      setLoading(false);
    }
  }, [getAdminPassword, activeTab, fetchQueueData]);

  useEffect(() => {
    loadCentralizedData();
    
    // Auto-refresh every 30 seconds (or 5 seconds for queue)
    const interval = setInterval(() => {
      if (activeTab === 'queue') {
        fetchQueueData();
      } else {
        loadCentralizedData();
      }
    }, activeTab === 'queue' ? 5000 : 30000);
    
    return () => clearInterval(interval);
  }, [loadCentralizedData, fetchQueueData, activeTab]);

  // Admin functions
  const addCreditsToUser = async (userId: string, amount: number) => {
    setLoading(true);
    try {
      const adminPassword = getAdminPassword();
      
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({
          action: 'addCredits',
          userId,
          amount
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUsers(prev => prev.map(user => 
          user.userId === userId 
            ? { ...user, credits: user.credits + amount }
            : user
        ));
        
        alert(`Successfully added ${amount} credits to user`);
        loadCentralizedData();
      } else {
        alert(`Failed to add credits: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error adding credits:', error);
      alert('Error adding credits - check console for details');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId: string) => {
    setLoading(true);
    try {
      const user = users.find(u => u.userId === userId);
      const newBlockedState = !user?.isBlocked;
      const adminPassword = getAdminPassword();
      
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({
          action: 'blockUser',
          userId,
          blocked: newBlockedState
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUsers(prev => prev.map(user => 
          user.userId === userId 
            ? { ...user, isBlocked: newBlockedState }
            : user
        ));
        
        alert(`User ${newBlockedState ? 'blocked' : 'unblocked'} successfully`);
        loadCentralizedData();
      } else {
        alert(`Failed to update user status: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      alert('Error updating user status - check console for details');
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && !user.isBlocked) ||
                         (filterStatus === 'blocked' && user.isBlocked);
    
    return matchesSearch && matchesFilter;
  });

  const refreshData = () => {
    console.log('🔄 Manual refresh triggered');
    if (activeTab === 'queue') {
      fetchQueueData();
    } else {
      loadCentralizedData();
    }
  };

  // Queue Tab Content
  const renderQueueTab = () => (
    <div className="space-y-6">
      {/* ComfyUI Status */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-600">
        <h3 className="text-xl font-bold mb-4 text-blue-400">🖥️ ComfyUI Server Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="text-sm text-slate-400">Server Status</div>
            <div className={`text-lg font-bold ${queueData?.comfyuiStatus === 'idle' ? 'text-green-400' : 'text-yellow-400'}`}>
              {queueData?.comfyuiStatus === 'idle' ? '🟢 Idle' : '🟡 Busy'}
            </div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="text-sm text-slate-400">Total in Queue</div>
            <div className="text-lg font-bold text-white">
              {queueData?.queue?.totalInQueue || 0}
            </div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="text-sm text-slate-400">Last Updated</div>
            <div className="text-lg font-bold text-white">
              {queueData?.timestamp ? new Date(queueData.timestamp).toLocaleTimeString() : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Currently Running */}
      {queueData?.queue?.running && queueData.queue.running.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600">
          <h3 className="text-xl font-bold mb-4 text-green-400">🚀 Currently Generating</h3>
          <div className="space-y-3">
            {queueData.queue.running.map((item) => (
              <div key={item.promptId} className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-green-400">Position #{item.position}</div>
                    <div className="text-sm text-slate-400">Prompt ID: {item.promptId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Est. Time Remaining</div>
                    <div className="font-semibold text-white">{item.estimatedTime || 30}s</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">User:</span> {item.userId?.substring(0, 12)}...
                  </div>
                  <div>
                    <span className="text-slate-400">Pose:</span> {item.pose}
                  </div>
                  <div>
                    <span className="text-slate-400">Gender:</span> {item.gender}
                  </div>
                  <div>
                    <span className="text-slate-400">Started:</span> {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{item.progress || 50}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${item.progress || 50}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Pending */}
      {queueData?.queue?.pending && queueData.queue.pending.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600">
          <h3 className="text-xl font-bold mb-4 text-yellow-400">⏳ Queue ({queueData.queue.pending.length} waiting)</h3>
          <div className="space-y-3">
            {queueData.queue.pending.slice(0, 10).map((item) => (
              <div key={item.promptId} className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-yellow-400">Position #{item.position}</div>
                    <div className="text-sm text-slate-400">Prompt ID: {item.promptId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Est. Wait Time</div>
                    <div className="font-semibold text-white">{Math.floor((item.estimatedTime || 60) / 60)}m {(item.estimatedTime || 60) % 60}s</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">User:</span> {item.userId?.substring(0, 12)}...
                  </div>
                  <div>
                    <span className="text-slate-400">Pose:</span> {item.pose}
                  </div>
                  <div>
                    <span className="text-slate-400">Gender:</span> {item.gender}
                  </div>
                  <div>
                    <span className="text-slate-400">Queued:</span> {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {queueData.queue.pending.length > 10 && (
              <div className="text-center text-slate-400 py-2">
                ... and {queueData.queue.pending.length - 10} more in queue
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Completed */}
      {queueData?.queue?.recentCompleted && queueData.queue.recentCompleted.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600">
          <h3 className="text-xl font-bold mb-4 text-purple-400">✅ Recently Completed</h3>
          <div className="space-y-3">
            {queueData.queue.recentCompleted.slice(0, 5).map((item) => (
              <div key={item.promptId} className="bg-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">
                      {item.status === 'completed' ? '✅ Completed' : '❌ Failed'}
                    </div>
                    <div className="text-sm text-slate-400">Prompt ID: {item.promptId}</div>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-2">
                  <div>
                    <span className="text-slate-400">User:</span> {item.userId?.substring(0, 12)}...
                  </div>
                  <div>
                    <span className="text-slate-400">Pose:</span> {item.pose}
                  </div>
                  <div>
                    <span className="text-slate-400">Gender:</span> {item.gender}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!queueData?.queue || ((!queueData.queue.running || queueData.queue.running.length === 0) && (!queueData.queue.pending || queueData.queue.pending.length === 0))) && (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 text-center">
          <div className="text-6xl mb-4">😴</div>
          <h3 className="text-xl font-bold mb-2 text-slate-300">Queue is Empty</h3>
          <p className="text-slate-400">No generations currently running or pending.</p>
          <p className="text-sm text-slate-500 mt-2">
            ComfyUI Status: {queueData?.comfyuiStatus || 'Unknown'}
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchQueueData}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Queue'}
        </button>
        <p className="text-sm text-slate-400 mt-2">
          Auto-refreshes every 5 seconds when queue is active
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400">User Management & Analytics</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1 p-4">
          {(['overview', 'users', 'generations', 'queue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active (24h)</p>
                    <p className="text-2xl font-bold text-white">{stats.activeUsers24h}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Generations</p>
                    <p className="text-2xl font-bold text-white">{stats.totalGenerations}</p>
                  </div>
                  <ImageIcon className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Today</p>
                    <p className="text-2xl font-bold text-white">{stats.generationsToday}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Generations */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-purple-400" />
                  Recent Generations
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generationHistory
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((gen, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-slate-300">
                            {gen.userId}
                          </span>
                          {gen.success ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Ban className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {gen.pose} • {gen.gender} • {new Date(gen.timestamp).toLocaleString()}
                        </div>
                        {gen.error && (
                          <div className="text-xs text-red-400 mt-1">
                            Error: {gen.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {generationHistory.length === 0 && (
                    <p className="text-slate-400 text-center py-4">No generations yet</p>
                  )}
                </div>
              </div>

              {/* Recent User Events */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-400" />
                  Recent User Events
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userEvents
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((event, idx) => (
                    <div key={idx} className="p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-slate-300">
                          {event.userId}
                        </span>
                        <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                          {event.action}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {userEvents.length === 0 && (
                    <p className="text-slate-400 text-center py-4">No events yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {/* User Controls */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by User ID or Device ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'blocked')}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="blocked">Blocked Users</option>
              </select>
            </div>

            {/* Users List */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Generations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Free Trials</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Last Visit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.userId} className="hover:bg-slate-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-mono text-white break-all">
                              {user.userId}
                            </div>
                            <div className="text-xs text-slate-400 break-all">
                              Device: {user.deviceId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-white">{user.credits}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">{user.totalGenerations}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">{user.totalFreeTrialsUsed}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">
                            {new Date(user.lastVisitDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isBlocked ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => blockUser(user.userId)}
                              className={`text-sm ${
                                user.isBlocked ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'
                              }`}
                            >
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No users match your search criteria
                </div>
              )}
            </div>
          </>
        )}

        {/* Generations Tab */}
        {activeTab === 'generations' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Generation History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Pose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {generationHistory
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((gen, idx) => (
                    <tr key={idx} className="hover:bg-slate-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-white break-all">
                          {gen.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">{gen.pose}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">{gen.gender}</span>
                      </td>
                      <td className="px-6 py-4">
                        {gen.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                            <Ban className="w-3 h-3 mr-1" />
                            Failed
                          </span>
                        )}
                        {gen.error && (
                          <div className="text-xs text-red-400 mt-1">
                            {gen.error}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {new Date(gen.timestamp).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400 font-mono">
                          {gen.ipAddress || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {generationHistory.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No generation history available
              </div>
            )}
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && renderQueueTab()}
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">
              Manage User: {selectedUser.userId}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Current Credits</label>
                <p className="text-2xl font-bold text-white">{selectedUser.credits}</p>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-2">Add/Remove Credits</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCreditAmount(Math.max(1, creditAmount - 1))}
                    className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center"
                    min="1"
                  />
                  <button
                    onClick={() => setCreditAmount(creditAmount + 1)}
                    className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    addCreditsToUser(selectedUser.userId, creditAmount);
                    setSelectedUser(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg"
                >
                  Add Credits
                </button>
                <button
                  onClick={() => {
                    addCreditsToUser(selectedUser.userId, -creditAmount);
                    setSelectedUser(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg"
                >
                  Remove Credits
                </button>
              </div>
              
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;