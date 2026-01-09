import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Lightbulb, BarChart3, Plus } from 'lucide-react';
import ProjectionForm from '@/components/planning/ProjectionForm';
import ScenarioComparison from '@/components/planning/ScenarioComparison';
import TaxRecommendations from '@/components/planning/TaxRecommendations';
import FutureProjections from '@/components/planning/FutureProjections';
import CGTCalculator from '@/components/planning/CGTCalculator';

export default function TaxPlanning() {
  const [activeTab, setActiveTab] = useState('projections');
  const [showProjectionForm, setShowProjectionForm] = useState(false);

  const { data: projections = [], isLoading } = useQuery({
    queryKey: ['tax-projections'],
    queryFn: () => base44.entities.TaxProjection.list('-created_date'),
  });

  const { data: calculations = [] } = useQuery({
    queryKey: ['tax-calculations'],
    queryFn: () => base44.entities.TaxCalculation.list('-created_date', 10),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions-current-year'],
    queryFn: () => base44.entities.Transaction.filter({ 
      tax_year: new Date().getFullYear().toString() 
    }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">TaxRelief NG – Tax Planning & Optimization</h1>
          <p className="text-slate-600">Your Trusted 2026 Tax Relief Experts – Free Tools + Certified Consultancy 🇳🇬</p>
          <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <p className="text-sm font-semibold text-amber-900">
              <strong>⚠️ DISCLAIMER:</strong> All calculations are estimates based on Nigeria Tax Act 2025. Not official tax advice – consult NRS or TaxRelief NG professionals for personalized guidance.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Active Projections</p>
                  <p className="text-3xl font-bold">{projections.length}</p>
                </div>
                <BarChart3 className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Past Calculations</p>
                  <p className="text-3xl font-bold">{calculations.length}</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Current Year Transactions</p>
                  <p className="text-3xl font-bold">{transactions.length}</p>
                </div>
                <Lightbulb className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="projections">Future Projections</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="simulator">Tax Simulator</TabsTrigger>
            <TabsTrigger value="cgt">CGT & Reliefs</TabsTrigger>
          </TabsList>

          <TabsContent value="projections">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Future Tax Projections</CardTitle>
                    <CardDescription>Project your tax liability for upcoming years</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowProjectionForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Projection
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <FutureProjections 
                  projections={projections}
                  calculations={calculations}
                  transactions={transactions}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>Compare different tax scenarios side-by-side</CardDescription>
              </CardHeader>
              <CardContent>
                <ScenarioComparison 
                  projections={projections}
                  calculations={calculations}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <TaxRecommendations 
              projections={projections}
              calculations={calculations}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="simulator">
            <Card>
              <CardHeader>
                <CardTitle>Tax Impact Simulator</CardTitle>
                <CardDescription>Simulate how different financial decisions affect your taxes</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectionForm 
                  onClose={() => {}}
                  calculations={calculations}
                  embedded={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cgt">
            <CGTCalculator />
          </TabsContent>
        </Tabs>

        {/* Projection Form Dialog */}
        {showProjectionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <ProjectionForm 
                onClose={() => setShowProjectionForm(false)}
                calculations={calculations}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}