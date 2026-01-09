import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import IncomeForm from '../components/calculator/IncomeForm';
import TaxBreakdown from '../components/calculator/TaxBreakdown';
import { Save, RotateCcw, Download, Share2, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Nigerian PAYE Tax Brackets 2026 - Official Progressive PIT Rates
const TAX_BRACKETS = [
  { min: 0, max: 800000, rate: 0, label: 'First ₦800,000' },
  { min: 800000, max: 3000000, rate: 15, label: '₦800,001 – ₦3,000,000' },
  { min: 3000000, max: 12000000, rate: 18, label: '₦3,000,001 – ₦12,000,000' },
  { min: 12000000, max: 25000000, rate: 21, label: '₦12,000,001 – ₦25,000,000' },
  { min: 25000000, max: 50000000, rate: 23, label: '₦25,000,001 – ₦50,000,000' },
  { min: 50000000, max: Infinity, rate: 25, label: 'Above ₦50,000,000' }
];

const MINIMUM_WAGE_ANNUAL = 840000; // ₦70,000 x 12 months

export default function TaxCalculator() {
  const currentYear = new Date().getFullYear();
  const [user, setUser] = useState(null);
  const [taxYear, setTaxYear] = useState(currentYear.toString());
  const [autoFillFromTransactions, setAutoFillFromTransactions] = useState(false);
  const [formData, setFormData] = useState({
    annual_income: 0,
    pension_contribution: 0,
    nhf_contribution: 0,
    nhis_contribution: 0,
    life_insurance: 0,
    annual_rent_paid: 0,
    mortgage_interest: 0,
    other_deductions: 0
  });
  const [calculation, setCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch transactions to auto-fill data
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', taxYear],
    queryFn: () => base44.entities.Transaction.filter({ tax_year: taxYear }),
    enabled: autoFillFromTransactions,
  });

  // Auto-calculate from transactions
  useEffect(() => {
    if (autoFillFromTransactions && transactions.length > 0) {
      const income = transactions
        .filter(t => t.amount > 0 && ['income', 'salary', 'investment_income', 'dividend', 'interest', 'rental_income', 'freelance'].includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const businessExpenses = transactions
        .filter(t => t.amount < 0 && t.category === 'business_expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const pensionContributions = transactions
        .filter(t => t.category === 'retirement_contribution')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setFormData(prev => ({
        ...prev,
        annual_income: income - businessExpenses,
        pension_contribution: pensionContributions,
      }));
    }
  }, [transactions, autoFillFromTransactions]);

  const calculateTax = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const grossIncome = formData.annual_income;
      
      // Check minimum wage exemption
      if (grossIncome <= MINIMUM_WAGE_ANNUAL) {
        const result = {
          grossIncome,
          taxableIncome: 0,
          taxOwed: 0,
          effectiveRate: 0,
          monthlyTax: 0,
          deductions: [],
          brackets: [],
          savings: 0,
          isMinimumWageExempt: true
        };
        setCalculation(result);
        setIsCalculating(false);
        return;
      }

      // Deductions (2026 rules - Full deductions, no caps except rent relief)
      const pension = formData.pension_contribution; // Full pension contribution deductible
      const nhf = formData.nhf_contribution; // Full NHF deductible
      const nhis = formData.nhis_contribution; // Full NHIS deductible
      const lifeInsurance = formData.life_insurance; // Full life insurance premium deductible
      const mortgageInterest = formData.mortgage_interest; // Full mortgage interest deductible
      
      // Rent Relief: 20% of annual rent paid, capped at ₦500,000 (2026 rules)
      const rentRelief = Math.min(formData.annual_rent_paid * 0.2, 500000);
      
      const totalDeductions = pension + nhf + nhis + lifeInsurance + mortgageInterest + rentRelief;
      const taxableIncome = Math.max(0, grossIncome - totalDeductions);
      
      // Calculate tax using 2026 progressive brackets
      let taxOwed = 0;
      let remainingIncome = taxableIncome;
      const brackets = [];

      for (const bracket of TAX_BRACKETS) {
        const bracketSize = bracket.max - bracket.min;
        const incomeInBracket = Math.min(remainingIncome, bracketSize);
        
        if (incomeInBracket > 0) {
          const bracketTax = incomeInBracket * (bracket.rate / 100);
          taxOwed += bracketTax;
          brackets.push({
            label: bracket.label,
            range: `₦${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : '₦' + bracket.max.toLocaleString()}`,
            rate: bracket.rate,
            taxable: incomeInBracket,
            tax: bracketTax
          });
          remainingIncome -= incomeInBracket;
        }
        
        if (remainingIncome <= 0) break;
      }

      const finalTax = taxOwed; // No minimum tax with new rules

      const effectiveRate = grossIncome > 0 ? (finalTax / grossIncome) * 100 : 0;
      
      // Calculate savings vs old 2024 rules
      const oldSystemTax = calculateOldSystemTax(grossIncome);
      const savings = oldSystemTax - finalTax;

      const result = {
        grossIncome,
        taxableIncome,
        taxOwed: finalTax,
        effectiveRate,
        monthlyTax: finalTax / 12,
        deductions: [
          { name: 'Pension Contribution', amount: pension },
          { name: 'National Housing Fund', amount: nhf },
          { name: 'Health Insurance (NHIS)', amount: nhis },
          { name: 'Life Insurance Premium', amount: lifeInsurance },
          { name: 'Mortgage Interest', amount: mortgageInterest },
          { name: 'Rent Relief (20% of rent)', amount: rentRelief }
        ].filter(d => d.amount > 0),
        brackets,
        savings,
        savingsVsOldSystem: savings,
        isMinimumWageExempt: false
      };

      setCalculation(result);
      setIsCalculating(false);
    }, 500);
  };

  const calculateOldSystemTax = (grossIncome) => {
    // Old 2024 brackets for comparison
    const oldBrackets = [
      { min: 0, max: 300000, rate: 7 },
      { min: 300000, max: 600000, rate: 11 },
      { min: 600000, max: 1100000, rate: 15 },
      { min: 1100000, max: 1600000, rate: 19 },
      { min: 1600000, max: 3200000, rate: 21 },
      { min: 3200000, max: Infinity, rate: 24 }
    ];
    
    const cra = Math.max(grossIncome * 0.2, 200000);
    const taxableIncome = Math.max(0, grossIncome - cra);
    let tax = 0;
    let remaining = taxableIncome;

    for (const bracket of oldBrackets) {
      const bracketSize = bracket.max - bracket.min;
      const incomeInBracket = Math.min(remaining, bracketSize);
      if (incomeInBracket > 0) {
        tax += incomeInBracket * (bracket.rate / 100);
        remaining -= incomeInBracket;
      }
      if (remaining <= 0) break;
    }

    return Math.max(tax, grossIncome * 0.01);
  };

  const saveCalculation = async () => {
    if (!calculation) return;

    setIsSaving(true);
    try {
      const totalDeductions = calculation.deductions.reduce((sum, d) => sum + d.amount, 0);
      
      await base44.entities.TaxCalculation.create({
        tax_year: taxYear,
        gross_income: calculation.grossIncome,
        business_expenses: 0,
        personal_reliefs: calculation.deductions.find(d => d.name === 'Consolidated Relief Allowance')?.amount || 0,
        pension_contributions: calculation.deductions.find(d => d.name === 'Pension Contribution')?.amount || 0,
        nhf_contributions: calculation.deductions.find(d => d.name === 'National Housing Fund')?.amount || 0,
        nhis_contributions: calculation.deductions.find(d => d.name === 'Health Insurance')?.amount || 0,
        life_insurance_premium: calculation.deductions.find(d => d.name === 'Life Insurance')?.amount || 0,
        other_deductions: calculation.deductions.find(d => d.name === 'Rent Relief')?.amount || 0,
        taxable_income: calculation.taxableIncome,
        total_tax: calculation.taxOwed,
        tax_breakdown: { brackets: calculation.brackets },
        effective_rate: calculation.effectiveRate,
        calculation_notes: `Calculated for tax year ${taxYear}`
      });

      alert('Calculation saved successfully!');
    } catch (error) {
      alert('Failed to save calculation');
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setFormData({
      annual_income: 0,
      pension_contribution: 0,
      nhf_contribution: 0,
      nhis_contribution: 0,
      life_insurance: 0,
      annual_rent_paid: 0,
      mortgage_interest: 0,
      other_deductions: 0
    });
    setCalculation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2">TaxRelief NG – Personal Income Tax Calculator 2026</h1>
          <p className="text-slate-600">Your Trusted 2026 Tax Relief Experts – Free Tools + Certified Consultancy 🇳🇬</p>
          <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <p className="text-sm font-semibold text-amber-900">
              <strong>⚠️ DISCLAIMER:</strong> All calculations are estimates based on Nigeria Tax Act 2025. Not official tax advice – consult NRS or TaxRelief NG professionals for personalized guidance.
            </p>
          </div>
        </motion.div>

        {/* Tax Year & Auto-fill Options */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Tax Year</label>
                <Select value={taxYear} onValueChange={setTaxYear}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (currentYear - i).toString()).map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Auto-fill from transactions?</p>
                  <p className="text-xs text-blue-700">Import income data from your linked accounts</p>
                </div>
                <Button
                  size="sm"
                  variant={autoFillFromTransactions ? "default" : "outline"}
                  onClick={() => setAutoFillFromTransactions(!autoFillFromTransactions)}
                  className={autoFillFromTransactions ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {autoFillFromTransactions ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <IncomeForm 
            formData={formData}
            setFormData={setFormData}
            onCalculate={calculateTax}
            isCalculating={isCalculating}
          />
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {calculation ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCalculation}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
              <TaxBreakdown calculation={calculation} />
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Enter Your Income</h3>
              <p className="text-slate-500 text-sm">
                Fill in your income details and click "Calculate My Tax" to see your tax breakdown
              </p>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  );
}