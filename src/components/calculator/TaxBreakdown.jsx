import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import ExpertHelpSection from '../consultancy/ExpertHelpSection';
import SavingsDisplay from '../shared/SavingsDisplay';
import ShareButtons from '../shared/ShareButtons';
import AdPlaceholder from '../shared/AdPlaceholder';

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

export default function TaxBreakdown({ calculation }) {
  if (!calculation) return null;

  const { 
    grossIncome, 
    taxableIncome, 
    taxOwed, 
    effectiveRate, 
    deductions,
    brackets,
    isMinimumWageExempt,
    savingsVsOldSystem
  } = calculation;

  const pieData = brackets?.map((bracket, index) => ({
    name: `${bracket.rate}% bracket`,
    value: bracket.tax
  })).filter(item => item.value > 0) || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const isExempt = isMinimumWageExempt || grossIncome <= 840000;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-emerald-100 text-sm mb-1">Tax Owed</p>
          <p className="text-3xl font-bold">{formatCurrency(taxOwed)}</p>
          <p className="text-emerald-200 text-xs mt-2">Annual PAYE</p>
        </div>
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-slate-300 text-sm mb-1">Effective Rate</p>
          <p className="text-3xl font-bold">{effectiveRate.toFixed(1)}%</p>
          <p className="text-slate-400 text-xs mt-2">Of gross income</p>
        </div>
      </div>

      {/* Exemption Notice */}
      {isExempt && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-800">✨ Minimum Wage Exemption!</h4>
            <p className="text-sm text-emerald-700 mt-1">
              Your income is at or below minimum wage (₦840,000/year). You're fully exempt from PAYE under 2026 tax reforms!
            </p>
          </div>
        </div>
      )}

      {/* Savings Display */}
      {savingsVsOldSystem !== undefined && savingsVsOldSystem > 0 && (
        <SavingsDisplay savings={savingsVsOldSystem} />
      )}

      {/* Share Buttons */}
      <ShareButtons savings={savingsVsOldSystem} />

      {/* Ad Placeholder */}
      <AdPlaceholder size="banner" />

      {/* Savings vs Old System - Gamified */}
      {!isExempt && savingsVsOldSystem !== undefined && (
        <div className={`${savingsVsOldSystem > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-5 shadow-lg`}>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${savingsVsOldSystem > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              <span className="text-3xl">{savingsVsOldSystem > 0 ? '🎉' : '📊'}</span>
            </div>
            <div className="flex-1">
              <h4 className={`text-xl font-bold mb-2 ${savingsVsOldSystem > 0 ? 'text-green-900' : 'text-red-900'}`}>
                {savingsVsOldSystem > 0 ? '🎯 Congratulations! You Save' : '2026 Tax Impact'}
              </h4>
              <p className={`text-3xl font-black mb-2 ${savingsVsOldSystem > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {savingsVsOldSystem > 0 ? '-' : '+'}₦{Math.abs(savingsVsOldSystem).toLocaleString()}
              </p>
              <p className={`text-sm ${savingsVsOldSystem > 0 ? 'text-green-800' : 'text-red-800'}`}>
                {savingsVsOldSystem > 0 
                  ? 'Under 2026 tax reforms compared to old 2024 system! That\'s money back in your pocket.' 
                  : 'Compared to old 2024 system. Consider tax planning strategies to optimize.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bold Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-amber-900 mb-1">⚠️ IMPORTANT DISCLAIMER</p>
            <p className="text-sm text-amber-800">
              <strong>This is an estimate only.</strong> Tax calculations are complex and individual circumstances vary. 
              Always consult the National Revenue Service (NRS) or a qualified tax professional for official advice and calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Deductions Summary */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            Deductions Applied
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {deductions?.map((ded, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{ded.name}</span>
              <span className="font-medium text-emerald-600">-{formatCurrency(ded.amount)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="font-medium text-slate-800">Total Savings</span>
            <span className="font-bold text-emerald-600">
              {formatCurrency(deductions?.reduce((sum, d) => sum + d.amount, 0) || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Brackets Breakdown Table */}
      {brackets && brackets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 className="font-semibold text-slate-800">2026 Progressive Tax Breakdown by Band</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Income Band</th>
                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Rate</th>
                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Taxable Amount</th>
                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Tax on Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brackets.map((bracket, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-3 text-sm text-slate-700">{bracket.label}</td>
                    <td className="p-3 text-sm text-right font-medium text-slate-800">{bracket.rate}%</td>
                    <td className="p-3 text-sm text-right text-slate-700">{formatCurrency(bracket.taxable)}</td>
                    <td className="p-3 text-sm text-right font-semibold text-emerald-700">{formatCurrency(bracket.tax)}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-bold">
                  <td colSpan="3" className="p-3 text-sm text-emerald-800">Total Tax Payable</td>
                  <td className="p-3 text-sm text-right text-emerald-800">{formatCurrency(taxOwed)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tax Brackets Chart */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Tax Distribution by Bracket</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expert Help CTA */}
      <ExpertHelpSection />

      {/* Ad Placeholder */}
      <AdPlaceholder size="banner" />

      {/* Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Income Breakdown</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-4 flex justify-between">
            <span className="text-slate-600">Gross Annual Income</span>
            <span className="font-medium">{formatCurrency(grossIncome)}</span>
          </div>
          <div className="p-4 flex justify-between">
            <span className="text-slate-600">Total Deductions</span>
            <span className="font-medium text-emerald-600">
              -{formatCurrency(grossIncome - taxableIncome)}
            </span>
          </div>
          <div className="p-4 flex justify-between bg-slate-50">
            <span className="font-medium text-slate-800">Taxable Income</span>
            <span className="font-bold">{formatCurrency(taxableIncome)}</span>
          </div>
          <div className="p-4 flex justify-between bg-emerald-50">
            <span className="font-medium text-emerald-800">Tax Payable</span>
            <span className="font-bold text-emerald-700">{formatCurrency(taxOwed)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}