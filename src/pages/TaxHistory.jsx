import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function TaxHistory() {
  const [expandedId, setExpandedId] = useState(null);

  const { data: calculations = [], isLoading } = useQuery({
    queryKey: ['tax-calculations'],
    queryFn: () => base44.entities.TaxCalculation.list('-created_date'),
  });

  const deleteCalculation = async (id) => {
    if (confirm('Delete this calculation?')) {
      await base44.entities.TaxCalculation.delete(id);
      window.location.reload();
    }
  };

  // Group by tax year
  const groupedByYear = calculations.reduce((acc, calc) => {
    const year = calc.tax_year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(calc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tax Calculation History</h1>
          <p className="text-slate-600">Review your past tax calculations and comparisons</p>
        </div>

        {calculations.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No calculations yet</h3>
                <p className="text-slate-600 mb-4">Start using the tax calculator to see your history here</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByYear).map(([year, yearCalcs]) => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-800">Tax Year {year}</h2>
                  <Badge variant="outline">{yearCalcs.length} calculation{yearCalcs.length > 1 ? 's' : ''}</Badge>
                </div>

                <div className="space-y-3">
                  {yearCalcs.map((calc, index) => (
                    <motion.div
                      key={calc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-lg">
                                  ₦{calc.gross_income?.toLocaleString()} Gross Income
                                </CardTitle>
                                <Badge className="bg-emerald-100 text-emerald-800">
                                  {calc.effective_rate?.toFixed(2)}% effective rate
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500">
                                Calculated {moment(calc.created_date).fromNow()} • 
                                {moment(calc.created_date).format(' MMM D, YYYY')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCalculation(calc.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Taxable Income</p>
                              <p className="font-semibold text-slate-900">₦{calc.taxable_income?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Total Tax</p>
                              <p className="font-semibold text-emerald-600">₦{calc.total_tax?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Monthly Tax</p>
                              <p className="font-semibold text-slate-900">₦{(calc.total_tax / 12)?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Total Deductions</p>
                              <p className="font-semibold text-blue-600">
                                ₦{((calc.personal_reliefs || 0) + (calc.pension_contributions || 0) + (calc.nhf_contributions || 0) + (calc.nhis_contributions || 0) + (calc.life_insurance_premium || 0) + (calc.other_deductions || 0)).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Expandable Breakdown */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedId(expandedId === calc.id ? null : calc.id)}
                            className="w-full"
                          >
                            {expandedId === calc.id ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                View Breakdown
                              </>
                            )}
                          </Button>

                          <AnimatePresence>
                            {expandedId === calc.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t space-y-3"
                              >
                                {/* Deductions */}
                                {calc.personal_reliefs > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Personal Relief (CRA)</span>
                                    <span className="font-medium">₦{calc.personal_reliefs.toLocaleString()}</span>
                                  </div>
                                )}
                                {calc.pension_contributions > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Pension Contributions</span>
                                    <span className="font-medium">₦{calc.pension_contributions.toLocaleString()}</span>
                                  </div>
                                )}
                                {calc.nhf_contributions > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">NHF Contributions</span>
                                    <span className="font-medium">₦{calc.nhf_contributions.toLocaleString()}</span>
                                  </div>
                                )}
                                {calc.nhis_contributions > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">NHIS Contributions</span>
                                    <span className="font-medium">₦{calc.nhis_contributions.toLocaleString()}</span>
                                  </div>
                                )}
                                {calc.life_insurance_premium > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Life Insurance</span>
                                    <span className="font-medium">₦{calc.life_insurance_premium.toLocaleString()}</span>
                                  </div>
                                )}

                                {/* Tax Brackets */}
                                {calc.tax_breakdown?.brackets && (
                                  <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm font-semibold text-slate-700 mb-2">Tax Bracket Breakdown</p>
                                    {calc.tax_breakdown.brackets.map((bracket, i) => (
                                      <div key={i} className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">{bracket.range} @ {bracket.rate}%</span>
                                        <span className="font-medium">₦{bracket.tax?.toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {calc.calculation_notes && (
                                  <div className="mt-3 p-3 bg-slate-50 rounded text-sm text-slate-600">
                                    {calc.calculation_notes}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}