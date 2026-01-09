import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ScenarioComparison({ projections, calculations }) {
  if (projections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">No projections to compare yet</p>
        <p className="text-sm text-slate-500">Create multiple projections to compare scenarios</p>
      </div>
    );
  }

  const sortedProjections = [...projections].sort((a, b) => a.projected_tax - b.projected_tax);

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left p-3 font-semibold text-slate-700">Scenario</th>
              <th className="text-right p-3 font-semibold text-slate-700">Year</th>
              <th className="text-right p-3 font-semibold text-slate-700">Income</th>
              <th className="text-right p-3 font-semibold text-slate-700">Projected Tax</th>
              <th className="text-right p-3 font-semibold text-slate-700">Effective Rate</th>
              <th className="text-right p-3 font-semibold text-slate-700">Ranking</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjections.map((proj, index) => {
              const effectiveRate = proj.projected_income > 0 
                ? (proj.projected_tax / proj.projected_income) * 100 
                : 0;
              
              return (
                <tr key={proj.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-medium">{proj.projection_name}</td>
                  <td className="p-3 text-right text-slate-600">{proj.projection_year}</td>
                  <td className="p-3 text-right">₦{proj.projected_income.toLocaleString()}</td>
                  <td className="p-3 text-right font-semibold text-emerald-700">
                    ₦{proj.projected_tax.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">{effectiveRate.toFixed(2)}%</td>
                  <td className="p-3 text-right">
                    {index === 0 && <Badge className="bg-green-600">Best</Badge>}
                    {index === sortedProjections.length - 1 && sortedProjections.length > 1 && (
                      <Badge variant="outline" className="text-red-600 border-red-600">Highest Tax</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Side-by-side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projections.slice(0, 6).map((proj) => {
          const effectiveRate = proj.projected_income > 0 
            ? (proj.projected_tax / proj.projected_income) * 100 
            : 0;
          
          const isBest = proj.projected_tax === Math.min(...projections.map(p => p.projected_tax));
          
          return (
            <Card key={proj.id} className={isBest ? 'border-2 border-green-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{proj.projection_name}</CardTitle>
                  {isBest && <Badge className="bg-green-600">Best</Badge>}
                </div>
                <p className="text-sm text-slate-500">Year: {proj.projection_year}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Projected Income</p>
                    <p className="text-lg font-semibold">₦{proj.projected_income.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Projected Tax</p>
                    <p className="text-2xl font-bold text-emerald-700">₦{proj.projected_tax.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-slate-500">Effective Rate</span>
                    <span className="font-semibold">{effectiveRate.toFixed(2)}%</span>
                  </div>

                  {proj.savings_vs_current !== undefined && (
                    <div className="flex items-center gap-2">
                      {proj.savings_vs_current > 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            ₦{proj.savings_vs_current.toLocaleString()} saved vs current
                          </span>
                        </>
                      ) : proj.savings_vs_current < 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600 font-medium">
                            ₦{Math.abs(proj.savings_vs_current).toLocaleString()} more vs current
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-500">Same as current</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}