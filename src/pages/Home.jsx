import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import QuickTipCard from '../components/dashboard/QuickTipCard';
import DeadlineAlert from '../components/dashboard/DeadlineAlert';
import QuickActions from '../components/dashboard/QuickActions';
import ExpertHelpSection from '../components/consultancy/ExpertHelpSection';
import { Award, TrendingUp, Calculator, Users, Sparkles } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: calculations = [] } = useQuery({
    queryKey: ['user-calculations', user?.email],
    queryFn: () => base44.entities.TaxCalculation.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges-home', user?.email],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-8 space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">TaxRelief NG</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            {greeting()}{user ? `, ${user.full_name?.split(' ')[0] || 'there'}` : ''}!
          </h1>
          <p className="text-slate-300 text-lg">
            Your Trusted 2026 Tax Relief Experts – Free Tools + Certified Consultancy 🇳🇬
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Calculator className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold">{calculations.length}</p>
              <p className="text-xs text-slate-400">Calculations</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Award className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-2xl font-bold">{badges.length}</p>
              <p className="text-xs text-slate-400">Badges Earned</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-2xl font-bold">₦0</p>
              <p className="text-xs text-slate-400">Total Saved</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expert Help Section */}
      <section>
        <ExpertHelpSection />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <QuickActions />
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tax Tips for You</h2>
          <QuickTipCard />
        </section>

        <section>
          <DeadlineAlert />
        </section>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-amber-800">Your Achievements</h2>
              <p className="text-xs text-amber-600">Keep using TaxRelief NG to earn more badges!</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm border border-amber-200"
              >
                <span className="text-xl">
                  {badge.badge_type === 'first_calculation' && '🎯'}
                  {badge.badge_type === 'tax_saver_pro' && '💰'}
                  {badge.badge_type === 'forum_contributor' && '💬'}
                  {badge.badge_type === 'exemption_expert' && '✅'}
                  {badge.badge_type === 'business_guru' && '📊'}
                  {badge.badge_type === 'early_bird' && '🌅'}
                </span>
                <span className="font-medium text-sm text-amber-800 capitalize">
                  {badge.badge_type.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Info Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Join the Community</h3>
            <p className="text-sm text-blue-700">
              Connect with other Nigerians navigating the tax system. Share tips, ask questions, and learn from experts in our community forum.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}