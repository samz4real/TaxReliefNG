import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calculator, CheckCircle, FileText, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
  {
    title: "Calculate Tax",
    description: "Get instant tax breakdown",
    icon: Calculator,
    page: "TaxCalculator",
    color: "bg-emerald-500",
    gradient: "from-emerald-50 to-teal-50"
  },
  {
    title: "Tax Planning",
    description: "Plan & optimize strategy",
    icon: TrendingUp,
    page: "TaxPlanning",
    color: "bg-blue-500",
    gradient: "from-blue-50 to-cyan-50"
  },
  {
    title: "Financial Accounts",
    description: "Connect & manage accounts",
    icon: Briefcase,
    page: "FinancialAccounts",
    color: "bg-indigo-500",
    gradient: "from-indigo-50 to-blue-50"
  },
  {
    title: "Check Exemptions",
    description: "Find eligible reliefs",
    icon: CheckCircle,
    page: "ExemptionChecker",
    color: "bg-purple-500",
    gradient: "from-purple-50 to-pink-50"
  }
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            to={createPageUrl(action.page)}
            className={`block p-4 rounded-2xl bg-gradient-to-br ${action.gradient} border border-white/50 hover:shadow-lg transition-all duration-300 group`}
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{action.title}</h3>
            <p className="text-xs text-slate-500 mb-2">{action.description}</p>
            <div className="flex items-center text-emerald-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}