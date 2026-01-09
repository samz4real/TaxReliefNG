import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, TrendingUp, PiggyBank, FileText } from 'lucide-react';

export default function TaxRecommendations({ projections, calculations, transactions }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = async () => {
    setIsGenerating(true);

    const currentYear = new Date().getFullYear();
    const currentCalc = calculations.find(c => c.tax_year === currentYear.toString());
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const prompt = `As a Nigerian tax expert, analyze this user's financial situation and provide personalized tax optimization recommendations:

Current Year (${currentYear}):
- Total Income: ₦${income.toLocaleString()}
- Total Expenses: ₦${expenses.toLocaleString()}
- Transactions: ${transactions.length}
${currentCalc ? `- Current Tax: ₦${currentCalc.total_tax.toLocaleString()}` : ''}

Historical Calculations: ${calculations.length}
Future Projections: ${projections.length}

Provide a JSON response with:
1. immediate_actions: Array of 3-5 actions they can take right now
2. long_term_strategies: Array of 3-4 long-term tax strategies
3. deduction_opportunities: Array of specific deductions they might be missing
4. estimated_savings: Estimated potential savings in Naira

Focus on Nigerian tax law (PAYE, CRA, pension deductions, NHF, NHIS, etc.)`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            immediate_actions: { type: 'array', items: { type: 'string' } },
            long_term_strategies: { type: 'array', items: { type: 'string' } },
            deduction_opportunities: { type: 'array', items: { type: 'string' } },
            estimated_savings: { type: 'number' }
          }
        }
      });

      setRecommendations(response);
    } catch (error) {
      setRecommendations({
        immediate_actions: [
          'Maximize your pension contributions to 8% of income for full tax deduction',
          'Register for and contribute to National Housing Fund (2.5% of income)',
          'Ensure all business expenses are properly documented',
          'Review and claim all eligible Consolidated Relief Allowance'
        ],
        long_term_strategies: [
          'Set up a structured pension plan to maximize retirement savings and tax benefits',
          'Consider life insurance premiums for additional tax relief',
          'Plan major income and expenses timing across tax years strategically'
        ],
        deduction_opportunities: [
          'NHIS contributions for health insurance',
          'Rent relief up to ₦500,000 annually',
          'Professional membership fees and training costs'
        ],
        estimated_savings: 150000
      });
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {!recommendations ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Get Personalized Tax Recommendations
              </h3>
              <p className="text-slate-600 mb-6">
                AI will analyze your financial data and provide tailored tax optimization strategies
              </p>
              <Button
                onClick={generateRecommendations}
                disabled={isGenerating}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGenerating ? 'Analyzing...' : 'Generate Recommendations'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Estimated Savings */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Potential Annual Tax Savings</p>
                  <p className="text-4xl font-bold">₦{recommendations.estimated_savings?.toLocaleString()}</p>
                  <p className="text-sm opacity-75 mt-1">Based on implementing these recommendations</p>
                </div>
                <PiggyBank className="w-16 h-16 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Immediate Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Immediate Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.immediate_actions?.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <Badge className="mt-1 bg-emerald-600">{i + 1}</Badge>
                    <p className="text-slate-700 flex-1">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Long-term Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Long-term Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.long_term_strategies?.map((strategy, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Badge className="mt-1 bg-blue-600">{i + 1}</Badge>
                    <p className="text-slate-700 flex-1">{strategy}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deduction Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Deduction Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.deduction_opportunities?.map((opportunity, i) => (
                  <div key={i} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-slate-700">{opportunity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={generateRecommendations}
              disabled={isGenerating}
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate Recommendations
            </Button>
          </div>
        </>
      )}
    </div>
  );
}