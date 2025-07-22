import { useState, useRef, useEffect } from "react";
import { useApartmentStore } from "@store/apartment";
import { useUserStore } from "@store/user";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import {
  Menu,
  Home,
  Users,
  FileText,
  Settings,
  LogOut,
  DollarSign,
  AlertCircle,
  Search,
  Bell,
  User,
  Building,
} from "lucide-react";
import { ThemeToggle } from "@components/ui/ThemeToggle";
import smartHiveLogo from "@/assets/smartHIVE-logo.png";
import { useCallback } from "react";
import { useMyApartments } from "@hooks/useApartments";
import OverviewSection from "@features/OverviewSection";
import ManageApartmentSection from "@features/ManageApartmentSection";
import TenantsSection from "@features/TenantsSection";
import UnitsSection from "@features/UnitsSection";
import PaymentsSection from "@features/PaymentsSection";
import IssuesSection from "@features/IssuesSection";

const navItems = [
  { label: "Overview", icon: Home, badge: null },
  { label: "Units", icon: Building, badge: "12" },
  { label: "Tenants", icon: Users, badge: "28" },
  { label: "Issues", icon: AlertCircle, badge: "3" },
  { label: "Payments", icon: DollarSign, badge: null },
  { label: "Settings", icon: Settings, badge: null },
];

export default function DashboardPage() {
  const setSelectedApartment = useApartmentStore((s) => s.setSelectedApartment);
  const setSelectedProfile = useApartmentStore((s) => s.setSelectedProfile);
  const setUser = useUserStore((s) => s.setUser);
  const setProfiles = useUserStore((s) => s.setProfiles);
  const setUserSelectedProfile = useUserStore((s) => s.setSelectedProfile);
  const user = useUserStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("Overview");
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const [showApartmentList, setShowApartmentList] = useState(false);
  const apartmentListRef = useRef<HTMLDivElement>(null);
  const { data: apartments = [], isLoading: apartmentsLoading } =
    useMyApartments();
  const selectedProfile = useApartmentStore((s) => s.selectedProfile);

  useEffect(() => {
    if (apartments && Array.isArray(apartments)) {
      setProfiles(apartments.map((a) => a.profile).filter(Boolean));
    }
  }, [apartments, setProfiles]);

  const handleSwitchApartment = useCallback(() => {
    setShowApartmentList((v) => !v);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        apartmentListRef.current &&
        !apartmentListRef.current.contains(e.target as Node)
      ) {
        setShowApartmentList(false);
      }
    }
    if (showApartmentList) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showApartmentList]);

  function handleSelectApartment(apartmentId: string) {
    setSelectedApartment(apartmentId);
    const apartment = apartments.find((a: any) => a._id === apartmentId);
    setSelectedProfile(apartment?.profile || null);
    setShowApartmentList(false);
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {}

    setUser(null);
    setProfiles([]);
    setUserSelectedProfile(null);
    setSelectedApartment(null);
    setSelectedProfile(null);
    navigate("/sign-in", { replace: true });
  };

  // Dynamically add 'Manage Apartment' for owners
  const sidebarNav = [...navItems];
  if (selectedProfile?.role === "owner") {
    sidebarNav.unshift({
      label: "Manage Apartment",
      icon: Settings,
      badge: null,
    });
  }

  return (
    <div className="min-h-screen flex bg-gray-200 dark:bg-background font-sans">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 bg-card dark:bg-zinc-900 shadow-xl border-r border-border h-screen sticky top-0 z-20 ${
          sidebarOpen ? "w-64" : "w-16"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div
            className={`flex items-center space-x-2 transition-all duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0 w-0"
            }`}
          >
            <img
              src={smartHiveLogo}
              alt="SmartHive Logo"
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className="font-bold text-xl text-gray-900 dark:text-white">smartHIVE</span>
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
          {sidebarNav.map((item) => (
            <button
              key={item.label}
              className={`flex items-center w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 relative ${
                activeNav === item.label
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 font-medium"
                  : "text-muted-foreground hover:text-blue-700 dark:hover:text-blue-300"
              }`}
              onClick={() => setActiveNav(item.label)}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span
                className={`transition-all duration-300 ${
                  sidebarOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
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
            <span
              className={`transition-all duration-300 text-sm ${
                sidebarOpen ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              Switch Apartment
            </span>
          </button>
          {showApartmentList && (
            <div
              ref={apartmentListRef}
              className="absolute left-0 right-0 bottom-14 z-50 bg-card dark:bg-zinc-900 border border-border rounded-lg shadow-lg py-2 max-h-60 overflow-y-auto animate-fade-in"
            >
              {apartmentsLoading ? (
                <div className="px-4 py-2 text-muted-foreground text-sm">
                  Loading apartments...
                </div>
              ) : apartments.length === 0 ? (
                <div className="px-4 py-2 text-muted-foreground text-sm">
                  No apartments found.
                </div>
              ) : (
                apartments.map((apartment: any) => (
                  <button
                    key={apartment._id}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 text-gray-900 dark:text-white text-sm transition-colors"
                    onClick={() => handleSelectApartment(apartment._id)}
                  >
                    {apartment.profile?.apartmentName ||
                      apartment.name ||
                      apartment._id}
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Good morning, {user?.firstName || "John"}! 👋
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Here's what's happening with your properties today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-gray-900 dark:text-white"
                />
              </div>
              <button className="relative p-2 text-muted-foreground hover:text-gray-900 dark:text-white hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              {/* User Info and Logout */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName || "John"} {user?.lastName || "Doe"}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Property Manager
                  </span>
                </div>
                <button
                  className="flex items-center px-2 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <section className="flex-1 p-6">
          {activeNav === "Overview" && <OverviewSection />}
          {activeNav === "Manage Apartment" &&
            selectedProfile?.role === "owner" && <ManageApartmentSection />}
          {activeNav === "Tenants" && <TenantsSection />}
          {activeNav === "Units" && <UnitsSection />}
          {activeNav === "Payments" && <PaymentsSection />}
          {activeNav === "Issues" && <IssuesSection />}
          {activeNav !== "Overview" &&
            activeNav !== "Manage Apartment" &&
            activeNav !== "Tenants" &&
            activeNav !== "Units" &&
            activeNav !== "Payments" &&
            activeNav !== "Issues" && (
              <div className="bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {activeNav}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Feature content for{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {activeNav}
                  </span>{" "}
                  will appear here.
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
                  Get Started
                </button>
              </div>
            )}
        </section>

        {/* Footer */}
        <footer className="bg-card dark:bg-zinc-900 border-t border-border py-4 px-6 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} smartHIVE. All rights reserved.
          </span>
        </footer>
      </main>
    </div>
  );
}
