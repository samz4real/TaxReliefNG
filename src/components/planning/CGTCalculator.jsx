import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Home, Car, Briefcase, Coins } from 'lucide-react';
import ShareButtons from '../shared/ShareButtons';
import AdPlaceholder from '../shared/AdPlaceholder';
import ExpertHelpSection from '../consultancy/ExpertHelpSection';

export default function CGTCalculator() {
  const [assetType, setAssetType] = useState('shares');
  const [acquisitionCost, setAcquisitionCost] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [yearlyDisposals, setYearlyDisposals] = useState(0);
  const [holdingPeriod, setHoldingPeriod] = useState(12);
  const [result, setResult] = useState(null);

  const calculateCGT = () => {
    const capitalGain = salePrice - acquisitionCost;
    
    if (capitalGain <= 0) {
      setResult({
        capitalGain: 0,
        taxableGain: 0,
        cgtOwed: 0,
        isExempt: true,
        exemptionReason: 'No capital gain (loss or break-even)'
      });
      return;
    }

    // Check exemptions
    let isExempt = false;
    let exemptionReason = '';
    
    if (assetType === 'primary_residence') {
      isExempt = true;
      exemptionReason = 'Private residence exemption';
    } else if (assetType === 'vehicle' && yearlyDisposals <= 2) {
      isExempt = true;
      exemptionReason = 'Personal vehicle exemption (up to 2 per year)';
    } else if (assetType === 'low_value' && salePrice <= 500000) {
      isExempt = true;
      exemptionReason = 'Low-value asset exemption (≤₦500,000)';
    } else if (assetType === 'shares' && yearlyDisposals <= 150000000 && capitalGain <= 10000000) {
      isExempt = true;
      exemptionReason = 'Share disposal exemption (≤₦150M disposals & ≤₦10M gains)';
    } else if (assetType === 'startup' && holdingPeriod >= 24) {
      isExempt = true;
      exemptionReason = 'Angel investor exemption (held >24 months)';
    }

    if (isExempt) {
      setResult({
        capitalGain,
        taxableGain: 0,
        cgtOwed: 0,
        isExempt: true,
        exemptionReason
      });
      return;
    }

    // Apply PIT rates (up to 25% progressive)
    let tax = 0;
    let remaining = capitalGain;
    
    const brackets = [
      { max: 800000, rate: 0 },
      { max: 3000000 - 800000, rate: 15 },
      { max: 12000000 - 3000000, rate: 18 },
      { max: 25000000 - 12000000, rate: 21 },
      { max: 50000000 - 25000000, rate: 23 },
      { max: Infinity, rate: 25 }
    ];

    for (const bracket of brackets) {
      const taxable = Math.min(remaining, bracket.max);
      if (taxable > 0) {
        tax += taxable * (bracket.rate / 100);
        remaining -= taxable;
      }
      if (remaining <= 0) break;
    }

    setResult({
      capitalGain,
      taxableGain: capitalGain,
      cgtOwed: tax,
      isExempt: false,
      exemptionReason: ''
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Capital Gains Tax Calculator (2026)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              <strong>2026 Update:</strong> CGT now follows PIT rates (up to 25%). Many exemptions apply!
            </p>
            <p className="text-xs text-blue-800">
              ⚠️ <strong>New:</strong> Crypto/digital assets are now taxable under CGT rules.
            </p>
          </div>

          <div>
            <Label>Asset Type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shares">Shares/Securities</SelectItem>
                <SelectItem value="property">Investment Property</SelectItem>
                <SelectItem value="primary_residence">Primary Residence</SelectItem>
                <SelectItem value="vehicle">Personal Vehicle</SelectItem>
                <SelectItem value="startup">Startup Investment</SelectItem>
                <SelectItem value="digital_asset">💰 Digital Assets/Crypto (Taxable)</SelectItem>
                <SelectItem value="low_value">Low-Value Item (≤₦500k)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Acquisition Cost</Label>
              <Input
                type="number"
                step="1000"
                placeholder="0"
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>Sale Price</Label>
              <Input
                type="number"
                step="1000"
                placeholder="0"
                value={salePrice}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {assetType === 'shares' && (
            <div>
              <Label>Total Yearly Disposals</Label>
              <Input
                type="number"
                step="1000000"
                placeholder="Total value of all share sales this year"
                value={yearlyDisposals}
                onChange={(e) => setYearlyDisposals(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1">Exempt if ≤₦150M disposals & ≤₦10M gains</p>
            </div>
          )}

          {assetType === 'startup' && (
            <div>
              <Label>Holding Period (months)</Label>
              <Input
                type="number"
                placeholder="24"
                value={holdingPeriod}
                onChange={(e) => setHoldingPeriod(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1">Angel investors: Exempt if held >24 months</p>
            </div>
          )}

          {assetType === 'vehicle' && (
            <div>
              <Label>Vehicles Sold This Year</Label>
              <Input
                type="number"
                placeholder="1"
                value={yearlyDisposals}
                onChange={(e) => setYearlyDisposals(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1">Exempt for up to 2 personal vehicles per year</p>
            </div>
          )}

          <Button onClick={calculateCGT} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Calculate CGT
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
        <ShareButtons savings={result.isExempt ? result.cgtOwed : null} />

        <AdPlaceholder size="banner" />
        
        <Card className={result.isExempt ? 'border-2 border-green-500' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">
              {result.isExempt ? '✨ Tax Exempt!' : 'CGT Calculation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Capital Gain</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₦{result.capitalGain.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">CGT Owed</p>
                <p className={`text-2xl font-bold ${result.isExempt ? 'text-green-600' : 'text-emerald-700'}`}>
                  ₦{result.cgtOwed.toLocaleString()}
                </p>
              </div>
            </div>

            {result.isExempt && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="font-semibold text-green-800 mb-1">Exemption Applied</p>
                <p className="text-sm text-green-700">{result.exemptionReason}</p>
              </div>
            )}

            {!result.isExempt && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ DISCLAIMER:</strong> This is an estimate only. Confirm exact eligibility with TaxRelief NG consultancy or NRS.
                </p>
              </div>
            )}
            
            {assetType === 'digital_asset' && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-sm text-orange-900">
                  <strong>💰 2026 Alert:</strong> Crypto and digital assets are now subject to CGT. No exemptions apply for cryptocurrency disposals.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expert Help */}
        <ExpertHelpSection />
        </>
        )}

        {/* Exemptions Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CGT Exemptions (2026)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">Private Residence</p>
                <p className="text-sm text-slate-600">Sale of your primary home is exempt</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">Personal Vehicles</p>
                <p className="text-sm text-slate-600">Up to 2 vehicles per year</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">Shares</p>
                <p className="text-sm text-slate-600">Exempt if disposals ≤₦150M and gains ≤₦10M per year</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">Angel Investors</p>
                <p className="text-sm text-slate-600">Startup investments held >24 months are exempt</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5 flex-shrink-0">📦</span>
              <div>
                <p className="font-semibold text-sm text-slate-800">Low-Value Assets</p>
                <p className="text-sm text-slate-600">Assets valued at ≤₦500,000 are exempt</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
              <p className="text-sm font-semibold text-red-900 mb-1">❌ Not Exempt (2026)</p>
              <p className="text-sm text-red-800">Crypto/digital assets are now taxable under CGT rules</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}