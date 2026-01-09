import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X } from 'lucide-react';

const TAX_BRACKETS = [
  { min: 0, max: 300000, rate: 7 },
  { min: 300000, max: 600000, rate: 11 },
  { min: 600000, max: 1100000, rate: 15 },
  { min: 1100000, max: 1600000, rate: 19 },
  { min: 1600000, max: 3200000, rate: 21 },
  { min: 3200000, max: Infinity, rate: 24 }
];

export default function ProjectionForm({ onClose, calculations, embedded = false }) {
  const currentYear = new Date().getFullYear();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    projection_name: '',
    projection_year: (currentYear + 1).toString(),
    projected_income: 0,
    projected_expenses: 0,
    projected_investments: 0,
    projected_pension: 0,
    scenario_notes: ''
  });

  const [projectedTax, setProjectedTax] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TaxProjection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-projections'] });
      if (!embedded) onClose();
      alert('Projection saved successfully!');
    },
  });

  const calculateProjectedTax = () => {
    const netIncome = formData.projected_income - formData.projected_expenses;
    const cra = Math.max(netIncome * 0.2, 200000);
    const pensionDeduction = Math.min(formData.projected_pension, netIncome * 0.08);
    
    const taxableIncome = Math.max(0, netIncome - cra - pensionDeduction);
    
    let tax = 0;
    let remaining = taxableIncome;
    
    for (const bracket of TAX_BRACKETS) {
      const bracketSize = bracket.max - bracket.min;
      const incomeInBracket = Math.min(remaining, bracketSize);
      if (incomeInBracket > 0) {
        tax += incomeInBracket * (bracket.rate / 100);
        remaining -= incomeInBracket;
      }
      if (remaining <= 0) break;
    }
    
    const minimumTax = netIncome * 0.01;
    const finalTax = Math.max(tax, minimumTax);
    
    // Calculate savings vs current year
    const currentYearCalc = calculations.find(c => c.tax_year === currentYear.toString());
    const savingsVsCurrent = currentYearCalc ? currentYearCalc.total_tax - finalTax : 0;
    
    setProjectedTax({
      total: finalTax,
      monthly: finalTax / 12,
      taxableIncome,
      effectiveRate: netIncome > 0 ? (finalTax / netIncome) * 100 : 0,
      savingsVsCurrent
    });
  };

  const generateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    
    try {
      const prompt = `Based on these financial projections for ${formData.projection_year}:
- Projected Income: ₦${formData.projected_income.toLocaleString()}
- Business Expenses: ₦${formData.projected_expenses.toLocaleString()}
- Planned Investments: ₦${formData.projected_investments.toLocaleString()}
- Pension Contributions: ₦${formData.projected_pension.toLocaleString()}
- Projected Tax: ₦${projectedTax?.total.toLocaleString()}

Provide 3-5 specific, actionable tax optimization recommendations for Nigerian tax law. Be concise and practical. Return as JSON array of strings.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setRecommendations(response.recommendations || []);
    } catch (error) {
      setRecommendations([
        'Maximize pension contributions (up to 8% of income) for tax deductions',
        'Consider NHF contributions for additional deductions',
        'Track all business expenses properly for accurate deductions',
        'Review life insurance premiums for potential tax relief',
        'Plan major expenses for optimal tax year timing'
      ]);
    }
    
    setIsGeneratingRecommendations(false);
  };

  useEffect(() => {
    if (formData.projected_income > 0) {
      calculateProjectedTax();
    }
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      projected_tax: projectedTax?.total || 0,
      savings_vs_current: projectedTax?.savingsVsCurrent || 0,
      recommendations
    });
  };

  return (
    <div className="p-6">
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Tax Projection</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Projection Name *</Label>
            <Input
              required
              placeholder="e.g., Conservative 2027"
              value={formData.projection_name}
              onChange={(e) => setFormData({ ...formData, projection_name: e.target.value })}
            />
          </div>

          <div>
            <Label>Projection Year *</Label>
            <Input
              required
              type="number"
              min={currentYear}
              value={formData.projection_year}
              onChange={(e) => setFormData({ ...formData, projection_year: e.target.value })}
            />
          </div>

          <div>
            <Label>Projected Annual Income *</Label>
            <Input
              required
              type="number"
              step="1000"
              placeholder="0"
              value={formData.projected_income}
              onChange={(e) => setFormData({ ...formData, projected_income: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Business Expenses</Label>
            <Input
              type="number"
              step="1000"
              placeholder="0"
              value={formData.projected_expenses}
              onChange={(e) => setFormData({ ...formData, projected_expenses: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Planned Investments</Label>
            <Input
              type="number"
              step="1000"
              placeholder="0"
              value={formData.projected_investments}
              onChange={(e) => setFormData({ ...formData, projected_investments: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Pension Contributions</Label>
            <Input
              type="number"
              step="1000"
              placeholder="0"
              value={formData.projected_pension}
              onChange={(e) => setFormData({ ...formData, projected_pension: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label>Scenario Notes</Label>
          <Textarea
            placeholder="Describe this scenario..."
            value={formData.scenario_notes}
            onChange={(e) => setFormData({ ...formData, scenario_notes: e.target.value })}
          />
        </div>

        {/* Projected Tax Results */}
        {projectedTax && (
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-lg">Projected Tax Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Annual Tax</p>
                  <p className="text-2xl font-bold text-emerald-700">₦{projectedTax.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Monthly Tax</p>
                  <p className="text-lg font-semibold text-slate-900">₦{projectedTax.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Effective Rate</p>
                  <p className="text-lg font-semibold text-slate-900">{projectedTax.effectiveRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">vs Current Year</p>
                  <p className={`text-lg font-semibold ${projectedTax.savingsVsCurrent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {projectedTax.savingsVsCurrent > 0 ? '-' : '+'}₦{Math.abs(projectedTax.savingsVsCurrent).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations */}
        {projectedTax && (
          <div>
            <Button
              type="button"
              onClick={generateRecommendations}
              disabled={isGeneratingRecommendations}
              variant="outline"
              className="mb-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingRecommendations ? 'Generating...' : 'Generate AI Recommendations'}
            </Button>

            {recommendations.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Tax Optimization Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                        <Badge className="mt-0.5 bg-blue-600">{i + 1}</Badge>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {!embedded && (
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={createMutation.isLoading || !projectedTax}
          >
            {createMutation.isLoading ? 'Saving...' : 'Save Projection'}
          </Button>
        </div>
      </form>
    </div>
  );
}