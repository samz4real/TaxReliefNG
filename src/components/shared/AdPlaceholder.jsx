import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function AdPlaceholder({ size = 'banner', className = '' }) {
  const dimensions = {
    banner: { width: '100%', height: '90px' },
    square: { width: '300px', height: '250px' },
    skyscraper: { width: '160px', height: '600px' },
    mobile: { width: '100%', height: '50px' }
  };

  const dim = dimensions[size] || dimensions.banner;

  return (
    <Card className={`border border-slate-200 ${className}`} style={{ width: dim.width }}>
      <CardContent className="p-0">
        <div 
          className="flex items-center justify-center bg-slate-50 border-dashed border-2 border-slate-300"
          style={{ height: dim.height }}
        >
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium mb-1">Sponsored</p>
            <p className="text-xs text-slate-300">Advertisement Space</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}