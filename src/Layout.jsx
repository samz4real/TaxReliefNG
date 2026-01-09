import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  Home, Calculator, CheckCircle, BookOpen, Briefcase, 
  Newspaper, Users, Menu, X, Bell, Award
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Calculator', icon: Calculator, page: 'TaxCalculator' },
  { name: 'Exemptions', icon: CheckCircle, page: 'ExemptionChecker' },
  { name: 'Guides', icon: BookOpen, page: 'Guides' },
  { name: 'Business', icon: Briefcase, page: 'BusinessToolkit' },
  { name: 'News', icon: Newspaper, page: 'NewsFeed' },
  { name: 'Community', icon: Users, page: 'Forum' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <style>{`
        :root {
          --primary: #059669;
          --primary-dark: #047857;
          --accent: #10b981;
          --gold: #f59e0b;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .nav-item-active {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col glass-effect z-50">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">₦</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-800">TaxRelief NG</h1>
              <p className="text-xs text-slate-500">Trusted Tax Relief Experts 🇳🇬</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'nav-item-active' 
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {user && badges.length > 0 && (
          <div className="p-4 border-t border-slate-200/50">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-sm text-amber-700">Your Badges</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {badges.slice(0, 4).map((badge) => (
                  <span key={badge.id} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    {badge.badge_type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 glass-effect z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold">₦</span>
            </div>
            <span className="font-bold text-lg text-slate-800">TaxRelief NG</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="absolute top-full left-0 right-0 glass-effect border-t border-slate-200/50 p-4">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'nav-item-active' 
                        : 'text-slate-600 bg-white hover:bg-emerald-50'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-slate-200/50 z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Footer */}
      <footer className="lg:ml-72 mt-16 pb-20 lg:pb-8">
        <div className="px-4 lg:px-8 py-6 border-t border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow">
                <span className="text-white font-bold">₦</span>
              </div>
              <div>
                <p className="font-bold text-slate-800">TaxRelief NG Consultancy</p>
                <p className="text-xs text-slate-500">Registered Tax Advisors | contact@taxrelief.ng | Lagos, Nigeria</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">© 2026 TaxRelief NG. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
      );
      }