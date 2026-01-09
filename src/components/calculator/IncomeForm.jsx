import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, HelpCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function IncomeForm({ formData, setFormData, onCalculate, isCalculating }) {
  const formatNumber = (value) => {
    return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '';
  };

  const parseNumber = (value) => {
    return parseInt(value?.replace(/,/g, '') || '0', 10);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseNumber(value)
    }));
  };

  const inputFields = [
    {
      id: 'annual_income',
      label: 'Annual Gross Income',
      tooltip: 'Your total salary before any deductions',
      required: true
    },
    {
      id: 'pension_contribution',
      label: 'Pension Contribution',
      tooltip: 'Employee pension contribution - Fully deductible (no cap)'
    },
    {
      id: 'nhf_contribution',
      label: 'NHF Contribution',
      tooltip: 'National Housing Fund contribution (2.5% of basic salary) - Fully deductible'
    },
    {
      id: 'nhis_contribution',
      label: 'NHIS Contribution',
      tooltip: 'National Health Insurance Scheme contribution - Fully deductible'
    },
    {
      id: 'life_insurance',
      label: 'Life Insurance Premium',
      tooltip: 'Annual life insurance premium payments - Fully deductible'
    },
    {
      id: 'annual_rent_paid',
      label: 'Annual Rent Paid',
      tooltip: '20% of rent paid is deductible, capped at ₦500,000 relief (2026 rules)'
    },
    {
      id: 'mortgage_interest',
      label: 'Mortgage Interest',
      tooltip: 'Annual mortgage interest payments - Fully deductible'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Income Details</h2>
            <p className="text-xs text-slate-500">Enter your income and deductions</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <TooltipProvider>
          {inputFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
                <Input
                  id={field.id}
                  type="text"
                  value={formatNumber(formData[field.id])}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="pl-8 h-12 text-lg border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </TooltipProvider>

        {/* Quick Income Presets */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-3">Quick presets:</p>
          <div className="flex flex-wrap gap-2">
            {[1000000, 2000000, 5000000, 10000000, 20000000].map((amount) => (
              <button
                key={amount}
                onClick={() => handleInputChange('annual_income', amount.toString())}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition-colors"
              >
                ₦{formatNumber(amount)}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onCalculate}
          disabled={!formData.annual_income || isCalculating}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/30"
        >
          {isCalculating ? 'Calculating...' : 'Calculate My Tax'}
        </Button>

        <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
          <Info className="w-3 h-3" />
          Based on 2026 progressive PIT rates (0% to 25%)
        </p>
      </div>
    </div>
  );
}