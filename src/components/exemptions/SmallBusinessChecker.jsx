import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, AlertCircle, Leaf } from 'lucide-react';
import ShareButtons from '../shared/ShareButtons';
import AdPlaceholder from '../shared/AdPlaceholder';
import ExpertHelpSection from '../consultancy/ExpertHelpSection';

export default function SmallBusinessChecker() {
  const [formData, setFormData] = useState({
    annual_turnover: 0,
    fixed_assets: 0,
    business_sector: 'general',
    is_agricultural: false,
    business_age_months: 0
  });
  const [result, setResult] = useState(null);

  const checkEligibility = () => {
    const turnover = formData.annual_turnover;
    const assets = formData.fixed_assets;
    const isProfessional = ['law', 'consulting', 'accounting'].includes(formData.business_sector);
    const isAgric = formData.is_agricultural;
    const businessAgeMonths = formData.business_age_months;

    let exemptions = [];
    let warnings = [];
    let isEligible = false;

    // Professional services exclusion
    if (isProfessional) {
      setResult({
        isEligible: false,
        exemptions: [],
        warnings: ['Professional services (law, consulting, accounting) are excluded from small business exemptions'],
        message: 'Not Eligible - Professional Services Excluded'
      });
      return;
    }

    // Small business threshold check
    if (turnover <= 100000000 && assets <= 250000000) {
      isEligible = true;
      exemptions.push({
        name: 'Corporate Income Tax (CIT)',
        description: '0% CIT rate for qualifying small businesses',
        icon: '💼'
      });
      exemptions.push({
        name: 'Capital Gains Tax (CGT)',
        description: 'Exempt from CGT on asset disposals',
        icon: '📈'
      });
      exemptions.push({
        name: 'Development Levy',
        description: 'Exempt from the new 4% development levy (applies to larger firms)',
        icon: '🏢'
      });

      // Near threshold warning
      if (turnover > 80000000 || assets > 200000000) {
        warnings.push('⚠️ Near threshold limits - Confirm exact eligibility with TaxRelief NG consultancy or NRS if your figures are close to ₦100M turnover or ₦250M assets');
      }
    }

    // Agricultural business 5-year tax holiday
    if (isAgric && businessAgeMonths <= 60) {
      exemptions.push({
        name: 'Agricultural Tax Holiday',
        description: `5-year tax exemption for new agricultural businesses (${60 - businessAgeMonths} months remaining)`,
        icon: '🌾'
      });
      if (!isEligible) isEligible = true;
    }

    setResult({
      isEligible,
      exemptions,
      warnings,
      message: isEligible 
        ? `Eligible for ${exemptions.length} exemption${exemptions.length > 1 ? 's' : ''}`
        : 'Not Eligible - Exceeds threshold'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Small Business Tax Exemption Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              <strong>2026 Thresholds:</strong> Annual turnover ≤₦100M + Fixed assets ≤₦250M
            </p>
            <p className="text-xs text-blue-800">
              Excludes professional services (law, consulting, accounting)
            </p>
          </div>

          <div>
            <Label>Annual Turnover</Label>
            <Input
              type="number"
              step="1000000"
              placeholder="0"
              value={formData.annual_turnover}
              onChange={(e) => setFormData({ ...formData, annual_turnover: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-slate-500 mt-1">Total annual revenue/sales</p>
          </div>

          <div>
            <Label>Fixed Assets Value</Label>
            <Input
              type="number"
              step="1000000"
              placeholder="0"
              value={formData.fixed_assets}
              onChange={(e) => setFormData({ ...formData, fixed_assets: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-slate-500 mt-1">Property, equipment, vehicles, etc.</p>
          </div>

          <div>
            <Label>Business Sector</Label>
            <Select 
              value={formData.business_sector} 
              onValueChange={(value) => setFormData({ ...formData, business_sector: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Business</SelectItem>
                <SelectItem value="retail">Retail/Trade</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="technology">Technology/IT</SelectItem>
                <SelectItem value="hospitality">Hospitality/Tourism</SelectItem>
                <SelectItem value="services">Services (non-professional)</SelectItem>
                <SelectItem value="law">⚠️ Law Firm (Excluded)</SelectItem>
                <SelectItem value="consulting">⚠️ Consulting (Excluded)</SelectItem>
                <SelectItem value="accounting">⚠️ Accounting (Excluded)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {['law', 'consulting', 'accounting'].includes(formData.business_sector) 
                ? '❌ Professional services are excluded from small business exemptions'
                : 'Your sector determines eligibility for specific benefits'}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <Leaf className="w-5 h-5 text-green-600" />
              <Label>Agricultural Business</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_agricultural"
                  checked={formData.is_agricultural}
                  onChange={(e) => setFormData({ ...formData, is_agricultural: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <Label htmlFor="is_agricultural" className="font-normal cursor-pointer">
                  This is an agricultural business (crop/livestock/processing)
                </Label>
              </div>

              {formData.is_agricultural && (
                <div>
                  <Label>Business Age (months)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.business_age_months}
                    onChange={(e) => setFormData({ ...formData, business_age_months: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-slate-500 mt-1">5-year tax holiday applies to businesses ≤60 months old</p>
                </div>
              )}
            </div>
          </div>

          <Button onClick={checkEligibility} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Check Eligibility
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
        <ShareButtons />
        
        <AdPlaceholder size="banner" />
        
        <Card className={result.isEligible ? 'border-2 border-green-500' : 'border-2 border-red-300'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.isEligible ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-800">{result.message}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-800">{result.message}</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.exemptions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">Available Exemptions:</h4>
                {result.exemptions.map((exemption, i) => (
                  <div key={i} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{exemption.icon}</span>
                      <div>
                        <p className="font-semibold text-green-900">{exemption.name}</p>
                        <p className="text-sm text-green-800 mt-1">{exemption.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="space-y-2">
                {result.warnings.map((warning, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-900">{warning}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>📞 Need Help?</strong> Confirm exact eligibility with TaxRelief NG consultancy or the National Revenue Service (NRS).
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Expert Help */}
        <ExpertHelpSection />
        </>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Small Business Benefits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-slate-700">
            <p>✓ <strong>Full exemption</strong> from Corporate Income Tax (CIT)</p>
            <p>✓ <strong>Full exemption</strong> from Capital Gains Tax (CGT)</p>
            <p>✓ <strong>Full exemption</strong> from 4% Development Levy</p>
            <p>✓ Simplified compliance and reporting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-600" />
              Agricultural Tax Holiday
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-slate-700">
            <p>✓ 5-year complete tax exemption</p>
            <p>✓ Applies to crop farming, livestock, processing</p>
            <p>✓ Must be new business (≤5 years old)</p>
            <p>✓ No turnover limit for this benefit</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}