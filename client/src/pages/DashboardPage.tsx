import { useState, useRef, useEffect } from 'react'
import { useApartmentStore } from '@store/apartment'
import { useUserStore } from '@store/user'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { Menu, Home, Users, FileText, Settings, LogOut, DollarSign, AlertCircle, Plus, Search, Bell, User, ChevronDown, Building, MapPin, Eye, ArrowUp, ArrowDown } from 'lucide-react'
import { ThemeToggle } from '@components/ui/ThemeToggle'
import smartHiveLogo from '@/assets/smartHIVE-logo.png'
import { useCallback } from 'react'

const navItems = [
  { label: 'Overview', icon: Home, badge: null },
  { label: 'Units', icon: Building, badge: '12' },
  { label: 'Tenants', icon: Users, badge: '28' },
  { label: 'Issues', icon: AlertCircle, badge: '3' },
  { label: 'Payments', icon: DollarSign, badge: null },
  { label: 'Settings', icon: Settings, badge: null },
]

const quickStats = [
  { label: 'Total Revenue', value: '$24,580', change: '+12.5%', trend: 'up', icon: DollarSign },
  { label: 'Occupied Units', value: '28/32', change: '+2', trend: 'up', icon: Building },
  { label: 'Active Issues', value: '3', change: '-5', trend: 'down', icon: AlertCircle },
  { label: 'New Tenants', value: '4', change: '+4', trend: 'up', icon: Users },
]

const recentActivities = [
  { type: 'payment', message: 'Payment received from Unit 204', time: '2 hours ago', status: 'success' },
  { type: 'issue', message: 'Maintenance request for Unit 105', time: '5 hours ago', status: 'warning' },
  { type: 'tenant', message: 'New tenant registered for Unit 301', time: '1 day ago', status: 'info' },
  { type: 'payment', message: 'Payment overdue for Unit 108', time: '2 days ago', status: 'error' },
]

const upcomingEvents = [
  { title: 'Rent collection due', date: 'Tomorrow', type: 'payment' },
  { title: 'Unit 204 lease expiry', date: 'Jul 25', type: 'lease' },
  { title: 'Maintenance scheduled', date: 'Jul 28', type: 'maintenance' },
]

export default function DashboardPage() {
  const selectedApartment = useApartmentStore(s => s.selectedApartment)
  const setSelectedApartment = useApartmentStore(s => s.setSelectedApartment)
  const setSelectedProfile = useApartmentStore(s => s.setSelectedProfile)
  const setUser = useUserStore(s => s.setUser)
  const setProfiles = useUserStore(s => s.setProfiles)
  const setUserSelectedProfile = useUserStore(s => s.setSelectedProfile)
  const userProfiles = useUserStore(s => s.profiles)
  const user = useUserStore(s => s.user)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('Overview')
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const [showApartmentList, setShowApartmentList] = useState(false)
  const apartmentListRef = useRef<HTMLDivElement>(null)

  const handleSwitchApartment = useCallback(() => {
    setShowApartmentList((v) => !v)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (apartmentListRef.current && !apartmentListRef.current.contains(e.target as Node)) {
        setShowApartmentList(false)
      }
    }
    if (showApartmentList) {
      document.addEventListener('mousedown', handleClick)
    } else {
      document.removeEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showApartmentList])

  function handleSelectApartment(apartmentId: string) {
    setSelectedApartment(apartmentId)
    const profile = userProfiles.find((p: any) => p.apartmentId === apartmentId) || null
    setSelectedProfile(profile)
    setShowApartmentList(false)
  }

  // Clerk logout handler
  const handleLogout = async () => {
    try {
      await signOut()
    } catch (e) {
      // ignore Clerk errors
    }
    setUser(null)
    setProfiles([])
    setUserSelectedProfile(null)
    setSelectedApartment(null)
    setSelectedProfile(null)
    navigate('/sign-in', { replace: true })
  }

  const renderOverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' : 
                  stat.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 
                  'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-300' : 
                stat.trend === 'down' ? 'text-red-600 dark:text-red-300' : 
                'text-muted-foreground'
              }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium">View all</button>
          </div>
          <div className="divide-y divide-border">
            {recentActivities.map((activity, index) => (
              <div key={index} className="px-6 py-4 hover:bg-muted transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-emerald-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Upcoming</h3>
          </div>
          <div className="p-6 space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'payment' ? 'bg-green-500' :
                  event.type === 'lease' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all group">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-blue-600 mb-2" />
            <span className="text-sm font-medium text-foreground group-hover:text-blue-700">Add Unit</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900 transition-all group">
            <Users className="w-6 h-6 text-muted-foreground group-hover:text-green-600 mb-2" />
            <span className="text-sm font-medium text-foreground group-hover:text-green-700">Add Tenant</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900 transition-all group">
            <DollarSign className="w-6 h-6 text-muted-foreground group-hover:text-purple-600 mb-2" />
            <span className="text-sm font-medium text-foreground group-hover:text-purple-700">Record Payment</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900 transition-all group">
            <AlertCircle className="w-6 h-6 text-muted-foreground group-hover:text-red-600 mb-2" />
            <span className="text-sm font-medium text-foreground group-hover:text-red-700">Report Issue</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderDefaultContent = () => (
    <div className="bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{activeNav}</h2>
      <p className="text-muted-foreground">Feature content for <span className="font-semibold text-blue-600 dark:text-blue-400">{activeNav}</span> will appear here.</p>
      <button className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
        Get Started
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 bg-card dark:bg-zinc-900 shadow-xl border-r border-border h-screen sticky top-0 z-20 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className={`flex items-center space-x-2 transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            <img src={smartHiveLogo} alt="SmartHive Logo" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-bold text-xl text-foreground">smartHIVE</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button
              key={item.label}
              className={`flex items-center w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 relative ${
                activeNav === item.label 
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 font-medium' 
                  : 'text-muted-foreground hover:text-blue-700 dark:hover:text-blue-300'
              }`}
              onClick={() => setActiveNav(item.label)}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className={`transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {item.label}
              </span>
              {item.badge && sidebarOpen && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Switch Apartment Button */}
        <div className="p-4 border-t border-border mt-auto relative">
          <button
            className="flex items-center w-full px-2 py-2 text-left bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors text-blue-700 dark:text-blue-300 font-medium"
            onClick={handleSwitchApartment}
          >
            <Building className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className={`transition-all duration-300 text-sm ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Switch Apartment</span>
          </button>
          {showApartmentList && (
            <div ref={apartmentListRef} className="absolute left-0 right-0 bottom-14 z-50 bg-card dark:bg-zinc-900 border border-border rounded-lg shadow-lg py-2 max-h-60 overflow-y-auto animate-fade-in">
              {userProfiles.length === 0 ? (
                <div className="px-4 py-2 text-muted-foreground text-sm">No apartments found.</div>
              ) : (
                userProfiles.map((profile: any) => (
                  <button
                    key={profile.apartmentId}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 text-foreground text-sm transition-colors"
                    onClick={() => handleSelectApartment(profile.apartmentId)}
                  >
                    {profile.apartmentName || profile.apartmentId}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card dark:bg-zinc-900 shadow-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Good morning, {user?.firstName || 'John'}! 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your properties today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
                />
              </div>
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              {/* User Info and Logout */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">{user?.firstName || 'John'} {user?.lastName || 'Doe'}</span>
                  <span className="text-xs text-muted-foreground">Property Manager</span>
                </div>
                <button className="flex items-center px-2 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-muted-foreground hover:text-red-600 dark:hover:text-red-400" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Property Selector */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <MapPin className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Current Property</p>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Sunset Apartments</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <p className="text-sm text-white/90">Property ID</p>
              <p className="text-white font-mono text-sm">{selectedApartment}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <section className="flex-1 p-6">
          {activeNav === 'Overview' ? renderOverviewContent() : renderDefaultContent()}
        </section>

        {/* Footer */}
        <footer className="bg-card dark:bg-zinc-900 border-t border-border py-4 px-6 text-center">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} smartHIVE. All rights reserved.
          </span>
        </footer>
      </main>
    </div>
  )
}