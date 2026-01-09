import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SavingsDisplay({ savings }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-emerald-700 font-medium mb-1">
              Your potential tax savings in 2026:
            </p>
            <p className="text-3xl font-bold text-emerald-900">
              {formatCurrency(Math.abs(savings))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}