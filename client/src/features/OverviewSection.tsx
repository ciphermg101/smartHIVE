import React from 'react'
import { DollarSign, Building, AlertCircle, Users, ArrowUp, ArrowDown, Eye, Plus } from 'lucide-react'

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

const OverviewSection: React.FC = () => (
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
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
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
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{activity.message}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{activity.time}</p>
                </div>
                <button className="text-muted-foreground hover:text-gray-900 dark:text-gray-100">
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming</h3>
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
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{event.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all group">
          <Plus className="w-6 h-6 text-muted-foreground group-hover:text-blue-600 mb-2" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-700">Add Unit</span>
        </button>
        <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900 transition-all group">
          <Users className="w-6 h-6 text-muted-foreground group-hover:text-green-600 mb-2" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-green-700">Add Tenant</span>
        </button>
        <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900 transition-all group">
          <DollarSign className="w-6 h-6 text-muted-foreground group-hover:text-purple-600 mb-2" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-purple-700">Record Payment</span>
        </button>
        <button className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900 transition-all group">
          <AlertCircle className="w-6 h-6 text-muted-foreground group-hover:text-red-600 mb-2" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-red-700">Report Issue</span>
        </button>
      </div>
    </div>
  </div>
)

export default OverviewSection 