import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, TrendingDown, AlertCircle, Info } from 'lucide-react';
import ShareButtons from '../shared/ShareButtons';
import ExpertHelpSection from '../consultancy/ExpertHelpSection';
import AdPlaceholder from '../shared/AdPlaceholder';

const commonProducts = [
  { name: 'Select a product...', hsCode: '', dutyRate: 0 },
  { name: 'Essential Medicines', hsCode: '3004', dutyRate: 0 },
  { name: 'Agricultural Seeds', hsCode: '1209', dutyRate: 0 },
  { name: 'Industrial Machinery', hsCode: '8479', dutyRate: 5 },
  { name: 'Raw Materials (Steel)', hsCode: '7208', dutyRate: 5 },
  { name: 'Computer Equipment', hsCode: '8471', dutyRate: 10 },
  { name: 'Mobile Phones', hsCode: '8517', dutyRate: 20 },
  { name: 'Passenger Vehicles', hsCode: '8703', dutyRate: 35 },
  { name: 'Used Vehicles (>5 yrs)', hsCode: '8703', dutyRate: 35 },
  { name: 'Alcoholic Beverages', hsCode: '2208', dutyRate: 20 },
  { name: 'Textiles/Clothing', hsCode: '6204', dutyRate: 20 },
  { name: 'Electronics (TVs)', hsCode: '8528', dutyRate: 20 },
  { name: 'Cosmetics', hsCode: '3304', dutyRate: 20 }
];

export default function CustomsDutyCalculator() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [fobValue, setFobValue] = useState(0);
  const [freightCost, setFreightCost] = useState(0);
  const [insuranceRate, setInsuranceRate] = useState(0.5);
  const [originCountry, setOriginCountry] = useState('china');
  const [dutyRate, setDutyRate] = useState(20);
  const [result, setResult] = useState(null);

  const handleProductSelect = (productName) => {
    const product = commonProducts.find(p => p.name === productName);
    if (product) {
      setSelectedProduct(productName);
      setHsCode(product.hsCode);
      setDutyRate(product.dutyRate);
    }
  };

  const calculateDuty = () => {
    const insurance = fobValue * (insuranceRate / 100);
    const cif = fobValue + freightCost + insurance;

    const importDuty = cif * (dutyRate / 100);
    const surcharge = importDuty * 0.07; // 7% surcharge on duty
    const etls = cif * 0.005; // 0.5% ETLS on CIF
    const ciss = fobValue * 0.01; // 1% CISS on FOB
    
    const dutyBase = cif + importDuty + surcharge + etls + ciss;
    const vat = dutyBase * 0.075; // 7.5% VAT

    const totalDuty = importDuty + surcharge + etls + ciss + vat;

    setResult({
      fobValue,
      freightCost,
      insurance,
      cif,
      importDuty,
      surcharge,
      etls,
      ciss,
      vat,
      totalDuty,
      grandTotal: fobValue + freightCost + insurance + totalDuty,
      dutyRate
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-blue-600" />
            Customs Import Duty Calculator 2026 🇳🇬
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Calculate your total import costs</strong> including duty, surcharge, levies, and VAT under Nigeria's ECOWAS CET.
            </p>
          </div>

          {/* Product Selection */}
          <div>
            <Label>Product/Category (Quick Select)</Label>
            <Select value={selectedProduct} onValueChange={handleProductSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a common product..." />
              </SelectTrigger>
              <SelectContent>
                {commonProducts.map((product) => (
                  <SelectItem key={product.name} value={product.name}>
                    {product.name}
                    {product.hsCode && ` (HS: ${product.hsCode}, ${product.dutyRate}%)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manual Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>HS Code</Label>
              <Input
                type="text"
                placeholder="e.g. 8703"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
              />
            </div>

            <div>
              <Label>Duty Rate (%)</Label>
              <Input
                type="number"
                step="1"
                placeholder="20"
                value={dutyRate}
                onChange={(e) => setDutyRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Goods Value (FOB) in ₦</Label>
              <Input
                type="number"
                step="1000"
                placeholder="0"
                value={fobValue}
                onChange={(e) => setFobValue(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>Freight Cost in ₦</Label>
              <Input
                type="number"
                step="1000"
                placeholder="0"
                value={freightCost}
                onChange={(e) => setFreightCost(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Insurance Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.5"
                value={insuranceRate}
                onChange={(e) => setInsuranceRate(parseFloat(e.target.value) || 0.5)}
              />
              <p className="text-xs text-slate-500 mt-1">Auto-calc: 0.5-1% of FOB</p>
            </div>

            <div>
              <Label>Origin Country</Label>
              <Select value={originCountry} onValueChange={setOriginCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="china">China</SelectItem>
                  <SelectItem value="usa">USA</SelectItem>
                  <SelectItem value="uk">UK</SelectItem>
                  <SelectItem value="germany">Germany</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="ecowas">ECOWAS Member</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={calculateDuty} 
            disabled={!fobValue}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Calculate Import Duty
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <ShareButtons savings={result.totalDuty} />
          
          <AdPlaceholder size="banner" />

          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Customs Duty Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CIF Calculation */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-slate-800 mb-2">CIF Value Calculation</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">FOB Value</span>
                  <span className="font-medium">{formatCurrency(result.fobValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Freight Cost</span>
                  <span className="font-medium">{formatCurrency(result.freightCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Insurance ({insuranceRate}%)</span>
                  <span className="font-medium">{formatCurrency(result.insurance)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">CIF Value</span>
                  <span className="font-bold text-blue-700">{formatCurrency(result.cif)}</span>
                </div>
              </div>

              {/* Duty & Charges */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">Customs Charges</h4>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-slate-600">Import Duty</span>
                    <p className="text-xs text-slate-500">{result.dutyRate}% of CIF</p>
                  </div>
                  <span className="font-medium text-slate-900">{formatCurrency(result.importDuty)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-slate-600">Surcharge</span>
                    <p className="text-xs text-slate-500">7% on Import Duty</p>
                  </div>
                  <span className="font-medium text-slate-900">{formatCurrency(result.surcharge)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-slate-600">ETLS</span>
                    <p className="text-xs text-slate-500">0.5% of CIF</p>
                  </div>
                  <span className="font-medium text-slate-900">{formatCurrency(result.etls)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-slate-600">CISS</span>
                    <p className="text-xs text-slate-500">1% of FOB</p>
                  </div>
                  <span className="font-medium text-slate-900">{formatCurrency(result.ciss)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-slate-600">VAT</span>
                    <p className="text-xs text-slate-500">7.5% on (CIF + Duty + Charges)</p>
                  </div>
                  <span className="font-medium text-slate-900">{formatCurrency(result.vat)}</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700">Total Customs Charges</span>
                  <span className="font-bold text-blue-700">{formatCurrency(result.totalDuty)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="font-semibold text-slate-800">Grand Total (Goods + Duty)</span>
                  <span className="text-2xl font-bold text-blue-900">{formatCurrency(result.grandTotal)}</span>
                </div>
              </div>

              {/* Savings Tips */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">💡 Ways to Reduce Import Costs</h4>
                    <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                      <li>Check if your goods qualify for <strong>duty exemptions</strong> (e.g., essential goods, raw materials)</li>
                      <li>Explore <strong>ECOWAS Trade Liberalisation Scheme</strong> for intra-regional imports</li>
                      <li>Use <strong>Temporary Import Permit</strong> for re-export goods</li>
                      <li>Leverage <strong>Pioneer Status</strong> or <strong>Export Processing Zone</strong> incentives</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* NCS Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">⚠️ IMPORTANT DISCLAIMER</p>
                    <p className="text-sm text-amber-800">
                      <strong>Estimates based on current ECOWAS CET rates.</strong> Actual duty may vary based on product classification, 
                      origin, trade agreements, and NCS valuation. Always confirm with the <strong>Nigeria Customs Service (NCS)</strong> 
                      for official rates and clearance requirements.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Help CTA */}
          <ExpertHelpSection />
          
          <AdPlaceholder size="banner" />
        </>
      )}

      {/* Rate Reference Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nigeria/ECOWAS CET Rate Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-slate-700">Common Duty Rates</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Essential goods (food, medicine)</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Raw materials, capital goods</span>
                  <span className="font-medium">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Intermediate goods</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Consumer/finished goods</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Specific products (vehicles, alcohol)</span>
                  <span className="font-medium">35%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-slate-700">Additional Charges</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Surcharge on duty</span>
                  <span className="font-medium">7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ETLS (on CIF)</span>
                  <span className="font-medium">0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CISS (on FOB)</span>
                  <span className="font-medium">1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">VAT (on total)</span>
                  <span className="font-medium">7.5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}