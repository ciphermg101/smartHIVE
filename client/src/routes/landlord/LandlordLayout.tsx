import { useState } from 'react';
import { Outlet, NavLink, Routes, Route } from 'react-router-dom';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import { LandlordDashboard, ApartmentsPage, LandlordIssuesPage, LandlordChatPage, LandlordPaymentsPage, UsersPage, UserProfile } from '@routes/landlord';
import { Menu } from 'lucide-react';

export default function LandlordLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />
      {/* Sidebar */}
      <aside className={`fixed z-50 md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-4 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:flex md:translate-x-0`}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-xl">smartHIVE</div>
          <button className="md:hidden p-2" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
        </div>
        <nav className="flex flex-col gap-2">
          <NavLink to="/landlord/dashboard" className={({ isActive }) => isActive ? 'font-semibold text-primary' : ''}>Dashboard</NavLink>
          <NavLink to="/landlord/apartments">Apartments</NavLink>
          <NavLink to="/landlord/tenants">Tenants</NavLink>
          <NavLink to="/landlord/rent">Rent</NavLink>
          <NavLink to="/landlord/issues">Issues</NavLink>
          <NavLink to="/landlord/chat">Messaging</NavLink>
          <NavLink to="/landlord/users">Users</NavLink>
          <NavLink to="/landlord/profile">Profile</NavLink>
        </nav>
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>
      {/* Hamburger button */}
      <button className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-900 border rounded p-2 shadow" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
        <Menu className="w-6 h-6" />
      </button>
      <main className="flex-1 p-2 md:p-6 md:ml-64 w-full">
        <Routes>
          <Route path="dashboard" element={<LandlordDashboard />} />
          <Route path="apartments" element={<ApartmentsPage />} />
          <Route path="tenants" element={<Outlet />} />
          <Route path="rent" element={<LandlordPaymentsPage />} />
          <Route path="issues" element={<LandlordIssuesPage />} />
          <Route path="chat" element={<LandlordChatPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<UserProfile />} />
          {/* Add more landlord module routes here */}
          <Route path="*" element={<Outlet />} />
        </Routes>
      </main>
    </div>
  );
} 