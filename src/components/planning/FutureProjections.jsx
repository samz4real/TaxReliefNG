import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function FutureProjections({ projections, calculations, transactions }) {
  const deleteProjection = async (id) => {
    if (confirm('Delete this projection?')) {
      await base44.entities.TaxProjection.delete(id);
      window.location.reload();
    }
  };

  if (projections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No projections yet</h3>
        <p className="text-slate-500 text-sm">Create your first projection to plan your tax strategy</p>
      </div>
    );
  }

  // Group by year
  const groupedByYear = projections.reduce((acc, proj) => {
    const year = proj.projection_year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(proj);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedByYear).map(([year, yearProjs]) => (
        <div key={year}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-800">{year}</h3>
            <Badge variant="outline">{yearProjs.length} scenario{yearProjs.length > 1 ? 's' : ''}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yearProjs.map((proj) => {
              const effectiveRate = proj.projected_income > 0 
                ? (proj.projected_tax / proj.projected_income) * 100 
                : 0;

              return (
                <Card key={proj.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{proj.projection_name}</CardTitle>
                        <p className="text-sm text-slate-500">
                          Created {moment(proj.created_date).fromNow()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProjection(proj.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Projected Income</p>
                        <p className="font-semibold text-slate-900">
                          ₦{proj.projected_income.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Projected Tax</p>
                        <p className="font-semibold text-emerald-600">
                          ₦{proj.projected_tax.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {proj.projected_expenses > 0 && (
                        <div>
                          <p className="text-xs text-slate-500">Expenses</p>
                          <p className="text-slate-700">₦{proj.projected_expenses.toLocaleString()}</p>
                        </div>
                      )}
                      {proj.projected_pension > 0 && (
                        <div>
                          <p className="text-xs text-slate-500">Pension</p>
                          <p className="text-slate-700">₦{proj.projected_pension.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-slate-600">Effective Rate</span>
                      <Badge className="bg-slate-100 text-slate-800">
                        {effectiveRate.toFixed(2)}%
                      </Badge>
                    </div>

                    {proj.savings_vs_current !== 0 && (
                      <div className={`p-3 rounded-lg ${proj.savings_vs_current > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <p className="text-sm font-medium">
                          {proj.savings_vs_current > 0 ? '💰 ' : '⚠️ '}
                          {proj.savings_vs_current > 0 
                            ? `Save ₦${proj.savings_vs_current.toLocaleString()} vs current year`
                            : `₦${Math.abs(proj.savings_vs_current).toLocaleString()} more than current year`
                          }
                        </p>
                      </div>
                    )}

                    {proj.recommendations && proj.recommendations.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold text-slate-700 mb-2">
                          Top Recommendations:
                        </p>
                        <ul className="space-y-1">
                          {proj.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="text-emerald-600 mt-0.5">•</span>
                              <span className="flex-1">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {proj.scenario_notes && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-slate-500">{proj.scenario_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}