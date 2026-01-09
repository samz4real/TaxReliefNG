import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import ShareButtons from '../shared/ShareButtons';
import ExpertHelpSection from '../consultancy/ExpertHelpSection';
import AdPlaceholder from '../shared/AdPlaceholder';

export default function CGTReliefChecker() {
  const [formData, setFormData] = useState({
    asset_type: '',
    acquisition_cost: 0,
    sale_proceeds: 0,
    yearly_share_proceeds: 0,
    yearly_share_gains: 0,
    holding_months: 0,
    vehicles_sold_this_year: 0,
    is_primary_residence: false
  });
  const [result, setResult] = useState(null);

  const checkCGTRelief = () => {
    const { asset_type, acquisition_cost, sale_proceeds, yearly_share_proceeds, yearly_share_gains, holding_months, vehicles_sold_this_year, is_primary_residence } = formData;
    
    const capitalGain = sale_proceeds - acquisition_cost;
    let isExempt = false;
    let exemptionReason = '';
    let cgtEstimate = 0;

    // No gain or loss
    if (capitalGain <= 0) {
      isExempt = true;
      exemptionReason = 'No capital gain (loss or break-even)';
    }
    // Principal private residence
    else if (asset_type === 'primary_residence' || is_primary_residence) {
      isExempt = true;
      exemptionReason = 'Principal private residence exemption (one-time benefit)';
    }
    // Personal assets/chattels ≤ ₦5M
    else if (asset_type === 'personal_asset' && sale_proceeds <= 5000000) {
      isExempt = true;
      exemptionReason = 'Personal asset/chattel exemption (proceeds ≤ ₦5 million)';
    }
    // Private vehicles (up to 2/year)
    else if (asset_type === 'vehicle' && vehicles_sold_this_year <= 2) {
      isExempt = true;
      exemptionReason = 'Private vehicle exemption (up to 2 vehicles per year)';
    }
    // Shares exemption
    else if (asset_type === 'shares' && yearly_share_proceeds <= 150000000 && yearly_share_gains <= 10000000) {
      isExempt = true;
      exemptionReason = 'Share disposal exemption (proceeds ≤ ₦150M AND gains ≤ ₦10M per year)';
    }
    // Startup investment held >24 months
    else if (asset_type === 'startup' && holding_months > 24) {
      isExempt = true;
      exemptionReason = 'Angel/VC investor exemption (held >24 months)';
    }

    // Calculate CGT at PIT rates if not exempt
    if (!isExempt) {
      // Progressive PIT rates up to 25%
      let tax = 0;
      let remaining = capitalGain;
      
      const brackets = [
        { max: 800000, rate: 0 },
        { max: 2200000, rate: 15 },
        { max: 9000000, rate: 18 },
        { max: 13000000, rate: 21 },
        { max: 25000000, rate: 23 },
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

      cgtEstimate = tax;
    }

    setResult({
      isExempt,
      exemptionReason,
      capitalGain,
      cgtEstimate,
      effectiveRate: capitalGain > 0 ? (cgtEstimate / capitalGain) * 100 : 0
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Capital Gains Tax Relief Checker 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              <strong>2026 Update:</strong> CGT now follows PIT rates (up to 25%). Many exemptions available!
            </p>
            <p className="text-xs text-red-800 font-semibold">
              ⚠️ <strong>Crypto/Digital Assets:</strong> Now fully taxable – no exemptions apply.
            </p>
          </div>

          <div>
            <Label>Asset Type</Label>
            <Select value={formData.asset_type} onValueChange={(value) => setFormData({ ...formData, asset_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary_residence">🏠 Primary Residence (Exempt)</SelectItem>
                <SelectItem value="investment_property">🏢 Investment Property</SelectItem>
                <SelectItem value="personal_asset">📦 Personal Asset/Chattel</SelectItem>
                <SelectItem value="vehicle">🚗 Private Vehicle</SelectItem>
                <SelectItem value="shares">📈 Shares/Securities</SelectItem>
                <SelectItem value="startup">🚀 Startup Investment (Angel/VC)</SelectItem>
                <SelectItem value="crypto">💰 Crypto/Digital Assets (Taxable)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Acquisition Cost</Label>
              <Input
                type="number"
                step="100000"
                placeholder="0"
                value={formData.acquisition_cost}
                onChange={(e) => setFormData({ ...formData, acquisition_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Sale Proceeds</Label>
              <Input
                type="number"
                step="100000"
                placeholder="0"
                value={formData.sale_proceeds}
                onChange={(e) => setFormData({ ...formData, sale_proceeds: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Conditional fields */}
          {formData.asset_type === 'shares' && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div>
                <Label>Total Share Proceeds This Year</Label>
                <Input
                  type="number"
                  step="1000000"
                  placeholder="Total value of all share sales this year"
                  value={formData.yearly_share_proceeds}
                  onChange={(e) => setFormData({ ...formData, yearly_share_proceeds: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Total Share Gains This Year</Label>
                <Input
                  type="number"
                  step="1000000"
                  placeholder="Total gains from all share sales"
                  value={formData.yearly_share_gains}
                  onChange={(e) => setFormData({ ...formData, yearly_share_gains: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-slate-600">Exempt if proceeds ≤ ₦150M AND gains ≤ ₦10M</p>
            </div>
          )}

          {formData.asset_type === 'startup' && (
            <div>
              <Label>Holding Period (months)</Label>
              <Input
                type="number"
                placeholder="24"
                value={formData.holding_months}
                onChange={(e) => setFormData({ ...formData, holding_months: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-slate-600 mt-1">Angel/VC investments held &gt;24 months are exempt</p>
            </div>
          )}

          {formData.asset_type === 'vehicle' && (
            <div>
              <Label>Private Vehicles Sold This Year</Label>
              <Input
                type="number"
                placeholder="1"
                value={formData.vehicles_sold_this_year}
                onChange={(e) => setFormData({ ...formData, vehicles_sold_this_year: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-slate-600 mt-1">Exempt for up to 2 private vehicles per year</p>
            </div>
          )}

          <Button onClick={checkCGTRelief} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Check CGT Relief
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <ShareButtons savings={result.isExempt ? result.cgtEstimate : null} />
          
          <AdPlaceholder size="banner" />
          
          <Card className={result.isExempt ? 'border-2 border-green-500' : 'border-2 border-amber-400'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.isExempt ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-green-800">Exempt from CGT</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-amber-600" />
                    <span className="text-amber-800">CGT Payable</span>
                  </>
                )}
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
                  <p className={`text-2xl font-bold ${result.isExempt ? 'text-green-600' : 'text-amber-700'}`}>
                    ₦{result.cgtEstimate.toLocaleString()}
                  </p>
                </div>
              </div>

              {result.isExempt ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="font-semibold text-green-800 mb-1">✅ Exemption Applied</p>
                  <p className="text-sm text-green-700">{result.exemptionReason}</p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="font-semibold text-amber-900 mb-2">CGT Calculation</p>
                  <p className="text-sm text-amber-800 mb-1">
                    Effective Rate: <strong>{result.effectiveRate.toFixed(1)}%</strong>
                  </p>
                  <p className="text-xs text-amber-700">Based on progressive PIT rates (0% - 25%)</p>
                </div>
              )}

              {formData.asset_type === 'crypto' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900 mb-1">Crypto/Digital Assets Alert</p>
                    <p className="text-sm text-red-800">
                      Cryptocurrency and digital assets are now fully taxable under 2026 CGT rules. No exemptions apply.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>⚠️ DISCLAIMER:</strong> This is an estimate. Consult TaxRelief NG consultancy or NRS for official guidance.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Expert Help */}
          <ExpertHelpSection />
        </>
      )}

      {/* Quick Reference Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CGT Exemptions Quick Reference (2026)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🏠</span>
            <div>
              <p className="font-semibold text-slate-800">Principal Private Residence</p>
              <p className="text-slate-600">Sale of your primary home (one-time exemption)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">📦</span>
            <div>
              <p className="font-semibold text-slate-800">Personal Assets/Chattels</p>
              <p className="text-slate-600">Exempt if sale proceeds ≤ ₦5 million</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🚗</span>
            <div>
              <p className="font-semibold text-slate-800">Private Vehicles</p>
              <p className="text-slate-600">Up to 2 private vehicles per year</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">📈</span>
            <div>
              <p className="font-semibold text-slate-800">Shares/Securities</p>
              <p className="text-slate-600">Exempt if total proceeds ≤ ₦150M AND total gains ≤ ₦10M per year</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🚀</span>
            <div>
              <p className="font-semibold text-slate-800">Startup Investments</p>
              <p className="text-slate-600">Angel/VC investments held &gt;24 months are exempt</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 mt-4">
            <span className="text-xl flex-shrink-0">💰</span>
            <div>
              <p className="font-semibold text-red-900">Crypto/Digital Assets</p>
              <p className="text-red-800">Now fully taxable – no exemptions apply</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}