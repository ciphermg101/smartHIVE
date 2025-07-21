import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@components/ui/ThemeToggle'
import smartHiveLogo from '@/assets/smartHIVE-logo.png'

const features = [
  {
    icon: '🏠',
    title: 'Property Management',
    desc: 'Manage multiple properties from a single dashboard with real-time insights and automated workflows.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: '👥',
    title: 'Tenant Portal',
    desc: 'Give tenants a modern portal to pay rent, submit maintenance requests, and communicate with you.',
    gradient: 'from-green-500 to-green-600',
  },
  {
    icon: '💰',
    title: 'Financial Tracking',
    desc: 'Track income, expenses, and generate detailed financial reports for better business decisions.',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: '🔧',
    title: 'Maintenance Tracking',
    desc: 'Streamline maintenance requests with automated workflows and vendor management.',
    gradient: 'from-red-500 to-red-600',
  },
  {
    icon: '📊',
    title: 'Analytics & Reports',
    desc: 'Get detailed insights into your property performance with advanced analytics and reporting.',
    gradient: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: '🤖',
    title: 'AI Automation',
    desc: 'Leverage AI to automate repetitive tasks and get predictive insights for better decision making.',
    gradient: 'from-indigo-500 to-indigo-600',
  },
]

const testimonials = [
  {
    initials: 'SJ',
    name: 'Sarah Johnson',
    role: 'Property Manager',
    color: 'from-blue-500 to-purple-500',
    quote: '"smartHIVE has revolutionized how I manage my 50+ units. The automation features alone save me 10+ hours per week!"',
  },
  {
    initials: 'MC',
    name: 'Mike Chen',
    role: 'Real Estate Investor',
    color: 'from-green-500 to-blue-500',
    quote: '"The financial reporting is incredibly detailed. I can see exactly where my money is going and make better investment decisions."',
  },
  {
    initials: 'ER',
    name: 'Emily Rodriguez',
    role: 'Apartment Owner',
    color: 'from-purple-500 to-pink-500',
    quote: '"My tenants love the portal! They can pay rent, submit requests, and communicate with me seamlessly. Highly recommended!"',
  },
]

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Landing() {
  // Animate cards on scroll
  useEffect(() => {
    const cards = document.querySelectorAll('.card-hover')
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            entry.target.classList.remove('opacity-0', 'translate-y-8')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    cards.forEach(card => {
      card.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700')
      observer.observe(card)
    })
    return () => observer.disconnect()
  }, [])

  // Parallax hero background
  useEffect(() => {
    const parallax = document.querySelector('.hero-pattern') as HTMLElement | null
    const onScroll = () => {
      if (parallax) {
        parallax.style.transform = `translateY(${window.scrollY * 0.5}px)`
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-slate-50 dark:bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-zinc-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={smartHiveLogo} alt="SmartHive Logo" className="w-10 h-10 object-contain rounded-xl" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">smartHIVE</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToId('features')} className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors font-medium">Features</button>
              <button onClick={() => scrollToId('pricing')} className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors font-medium">Pricing</button>
              <button onClick={() => scrollToId('about')} className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors font-medium">About</button>
              <Link to="/sign-up">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  Get Started
                </button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black pt-24">
        {/* Background Elements */}
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">The Future of</span>
                <span className="text-gradient block">Apartment</span>
                <span className="text-gray-900 dark:text-white">Management</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                Transform your property management with AI-powered insights, seamless tenant communication, and automated workflows that save you time and maximize revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-up">
                  <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-purple-500/25">
                    Start Free Trial
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </Link>
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
                  <button className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 dark:text-gray-200 hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900">
                    Watch Demo
                    <span className="ml-2">▶</span>
                  </button>
                </a>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Happy Landlords</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">250K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Units Managed</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '0.6s' }}>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Uptime</div>
                </div>
              </div>
            </div>
            {/* Right Content - Dashboard Preview */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
              <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-zinc-800">
                {/* Mock Dashboard Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Property Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-white/30 rounded-full" />
                      <div className="w-3 h-3 bg-white/30 rounded-full" />
                      <div className="w-3 h-3 bg-white/30 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                      <div className="text-2xl font-bold">$24,580</div>
                      <div className="text-sm opacity-90">Monthly Revenue</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                      <div className="text-2xl font-bold">28/32</div>
                      <div className="text-sm opacity-90">Units Occupied</div>
                    </div>
                  </div>
                </div>
                {/* Mock Dashboard Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce-slow" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Payment Received</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">Unit 204 - $1,200</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">New Tenant Added</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">Unit 301 - John Smith</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce-slow" style={{ animationDelay: '2s' }} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Maintenance Request</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">Unit 105 - Plumbing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-background relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to <span className="text-gradient">Manage Properties</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From tenant screening to maintenance tracking, smartHIVE provides all the tools you need to run a successful property management business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="group bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 card-hover">
                <div className={`w-16 h-16 bg-gradient-to-r ${f.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-2xl`}>
                  <span>{f.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by <span className="text-gradient">Property Managers</span> Worldwide
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg card-hover">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${t.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold">{t.initials}</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{t.quote}</p>
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-500">⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join thousands of property managers who are already saving time and increasing revenue with smartHIVE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl">
                  Start Your Free Trial
                </button>
              </Link>
              <a href="#" onClick={e => { e.preventDefault(); scrollToId('features') }}>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300">
                  Schedule a Demo
                </button>
              </a>
            </div>
            <p className="text-sm opacity-75 mt-4">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⚡</span>
                </div>
                <span className="text-2xl font-bold">smartHIVE</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The future of apartment management. Streamline your operations, delight your tenants, and grow your business with our AI-powered platform.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors" onClick={e => { e.preventDefault(); scrollToId('features') }}>Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors" onClick={e => { e.preventDefault(); scrollToId('pricing') }}>Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors" onClick={e => { e.preventDefault(); scrollToId('about') }}>About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} smartHIVE. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom styles for gradients, glass, text-gradient, hero-pattern, card-hover, etc. */}
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0);
          background-size: 50px 50px;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-10px) scale(1.02);
        }
        .blob {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: blob 7s ease-in-out infinite;
        }
        @keyframes blob {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
          50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
          75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
} 