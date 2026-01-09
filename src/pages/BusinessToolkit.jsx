import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Calculator, Users, Receipt, FileText, 
  Download, Plus, Trash2, CheckCircle, Ship
} from 'lucide-react';
import CustomsDutyCalculator from '../components/business/CustomsDutyCalculator';
import CGTReliefChecker from '../components/business/CGTReliefChecker';

export default function BusinessToolkit() {
  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-2">TaxRelief NG – Business Toolkit</h1>
        <p className="text-slate-600">Your Trusted 2026 Tax Relief Experts – Free Tools + Certified Consultancy 🇳🇬</p>
        <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
          <p className="text-sm font-semibold text-amber-900">
            <strong>⚠️ DISCLAIMER:</strong> All calculations are estimates based on Nigeria Tax Act 2025. Not official tax advice – consult NRS or TaxRelief NG professionals for personalized guidance.
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="vat" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="vat" className="rounded-lg gap-2 data-[state=active]:bg-white">
            <Receipt className="w-4 h-4" /> VAT Calculator
          </TabsTrigger>
          <TabsTrigger value="payroll" className="rounded-lg gap-2 data-[state=active]:bg-white">
            <Users className="w-4 h-4" /> Payroll Calculator
          </TabsTrigger>
          <TabsTrigger value="customs" className="rounded-lg gap-2 data-[state=active]:bg-white">
            <Ship className="w-4 h-4" /> Customs Duty
          </TabsTrigger>
          <TabsTrigger value="cgt" className="rounded-lg gap-2 data-[state=active]:bg-white">
            <Calculator className="w-4 h-4" /> CGT Relief
          </TabsTrigger>
          <TabsTrigger value="invoice" className="rounded-lg gap-2 data-[state=active]:bg-white">
            <FileText className="w-4 h-4" /> Invoice Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vat">
          <VATCalculator />
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollCalculator />
        </TabsContent>

        <TabsContent value="customs">
          <CustomsDutyCalculator />
        </TabsContent>

        <TabsContent value="cgt">
          <CGTReliefChecker />
        </TabsContent>

        <TabsContent value="invoice">
          <InvoiceTemplate />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VATCalculator() {
  const [amount, setAmount] = useState('');
  const [vatType, setVatType] = useState('exclusive');
  const [result, setResult] = useState(null);

  const VAT_RATE = 7.5;

  const calculateVAT = () => {
    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    
    if (vatType === 'exclusive') {
      const vatAmount = numAmount * (VAT_RATE / 100);
      const total = numAmount + vatAmount;
      setResult({ baseAmount: numAmount, vatAmount, total });
    } else {
      const baseAmount = numAmount / (1 + VAT_RATE / 100);
      const vatAmount = numAmount - baseAmount;
      setResult({ baseAmount, vatAmount, total: numAmount });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">VAT Calculator</h2>
            <p className="text-xs text-slate-500">Nigerian VAT rate: 7.5%</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Amount (₦)</Label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="mt-1 h-12"
            />
          </div>

          <div>
            <Label>VAT Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setVatType('exclusive')}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  vatType === 'exclusive'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                VAT Exclusive
                <p className="text-xs font-normal text-slate-500 mt-1">Add VAT to amount</p>
              </button>
              <button
                onClick={() => setVatType('inclusive')}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  vatType === 'inclusive'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                VAT Inclusive
                <p className="text-xs font-normal text-slate-500 mt-1">Extract VAT from amount</p>
              </button>
            </div>
          </div>

          <Button 
            onClick={calculateVAT}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
          >
            Calculate VAT
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <h3 className="font-semibold text-slate-800 mb-4">VAT Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-white rounded-lg">
              <span className="text-slate-600">Base Amount</span>
              <span className="font-semibold">{formatCurrency(result.baseAmount)}</span>
            </div>
            <div className="flex justify-between p-3 bg-white rounded-lg">
              <span className="text-slate-600">VAT (7.5%)</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(result.vatAmount)}</span>
            </div>
            <div className="flex justify-between p-4 bg-emerald-600 text-white rounded-lg">
              <span className="font-medium">Total Amount</span>
              <span className="font-bold text-lg">{formatCurrency(result.total)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function PayrollCalculator() {
  const [employees, setEmployees] = useState([
    { name: '', basicSalary: '', isNewHire: false }
  ]);
  const [results, setResults] = useState(null);

  const addEmployee = () => {
    setEmployees([...employees, { name: '', basicSalary: '', isNewHire: false }]);
  };

  const removeEmployee = (index) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const updateEmployee = (index, field, value) => {
    const updated = [...employees];
    updated[index][field] = value;
    setEmployees(updated);
  };

  const calculatePayroll = () => {
    const calculated = employees.map(emp => {
      const basic = parseFloat(emp.basicSalary.replace(/,/g, '')) || 0;
      const annualBasic = basic * 12;
      
      // Employee contributions
      const pension = basic * 0.08;
      const nhf = basic * 0.025;
      
      // Calculate PAYE
      const grossAnnual = annualBasic;
      const cra = Math.max(grossAnnual * 0.2, 200000);
      const taxableIncome = Math.max(0, grossAnnual - cra - (pension * 12) - (nhf * 12));
      
      let tax = 0;
      let remaining = taxableIncome;
      const brackets = [
        { max: 300000, rate: 0.07 },
        { max: 300000, rate: 0.11 },
        { max: 500000, rate: 0.15 },
        { max: 500000, rate: 0.19 },
        { max: 1600000, rate: 0.21 },
        { max: Infinity, rate: 0.24 }
      ];

      for (const bracket of brackets) {
        const taxableInBracket = Math.min(remaining, bracket.max);
        tax += taxableInBracket * bracket.rate;
        remaining -= taxableInBracket;
        if (remaining <= 0) break;
      }

      const monthlyTax = tax / 12;
      const netSalary = basic - pension - nhf - monthlyTax;
      
      // New hire relief (50% of salary deductible for employer)
      const employerRelief = emp.isNewHire ? basic * 0.5 : 0;

      return {
        name: emp.name || 'Employee',
        grossSalary: basic,
        pension,
        nhf,
        paye: monthlyTax,
        netSalary,
        employerRelief,
        isNewHire: emp.isNewHire
      };
    });

    setResults(calculated);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Employee Salary Calculator</h2>
              <p className="text-xs text-slate-500">Calculate deductions and net pay</p>
            </div>
          </div>
          <Button onClick={addEmployee} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>

        <div className="space-y-4">
          {employees.map((emp, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Employee {index + 1}</span>
                {employees.length > 1 && (
                  <button onClick={() => removeEmployee(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <Input
                  placeholder="Employee name"
                  value={emp.name}
                  onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Monthly basic salary (₦)"
                  value={emp.basicSalary}
                  onChange={(e) => updateEmployee(index, 'basicSalary', e.target.value)}
                />
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={emp.isNewHire}
                    onChange={(e) => updateEmployee(index, 'isNewHire', e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span className="text-sm">New hire (50% relief)</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={calculatePayroll}
          className="w-full h-12 mt-6 bg-blue-600 hover:bg-blue-700"
        >
          Calculate Payroll
        </Button>
      </Card>

      {results && (
        <Card className="overflow-hidden">
          <div className="p-4 bg-slate-50 border-b">
            <h3 className="font-semibold text-slate-800">Payroll Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-right">Gross</th>
                  <th className="p-3 text-right">Pension</th>
                  <th className="p-3 text-right">NHF</th>
                  <th className="p-3 text-right">PAYE</th>
                  <th className="p-3 text-right">Net Pay</th>
                  <th className="p-3 text-right">Employer Relief</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((emp, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {emp.name}
                        {emp.isNewHire && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            New Hire
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(emp.grossSalary)}</td>
                    <td className="p-3 text-right text-slate-600">{formatCurrency(emp.pension)}</td>
                    <td className="p-3 text-right text-slate-600">{formatCurrency(emp.nhf)}</td>
                    <td className="p-3 text-right text-red-600">{formatCurrency(emp.paye)}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600">{formatCurrency(emp.netSalary)}</td>
                    <td className="p-3 text-right text-blue-600">
                      {emp.employerRelief > 0 ? formatCurrency(emp.employerRelief) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold">
                <tr>
                  <td className="p-3">Total</td>
                  <td className="p-3 text-right">{formatCurrency(results.reduce((sum, e) => sum + e.grossSalary, 0))}</td>
                  <td className="p-3 text-right">{formatCurrency(results.reduce((sum, e) => sum + e.pension, 0))}</td>
                  <td className="p-3 text-right">{formatCurrency(results.reduce((sum, e) => sum + e.nhf, 0))}</td>
                  <td className="p-3 text-right text-red-600">{formatCurrency(results.reduce((sum, e) => sum + e.paye, 0))}</td>
                  <td className="p-3 text-right text-emerald-600">{formatCurrency(results.reduce((sum, e) => sum + e.netSalary, 0))}</td>
                  <td className="p-3 text-right text-blue-600">{formatCurrency(results.reduce((sum, e) => sum + e.employerRelief, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function InvoiceTemplate() {
  const [invoice, setInvoice] = useState({
    businessName: '',
    businessAddress: '',
    clientName: '',
    clientAddress: '',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, rate: 0 }],
    includeVAT: true
  });

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, rate: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...invoice.items];
    items[index][field] = value;
    setInvoice({ ...invoice, items });
  };

  const removeItem = (index) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter((_, i) => i !== index)
    });
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const vat = invoice.includeVAT ? subtotal * 0.075 : 0;
  const total = subtotal + vat;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Invoice Generator</h2>
            <p className="text-xs text-slate-500">Create professional invoices</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Your Business Name</Label>
              <Input
                value={invoice.businessName}
                onChange={(e) => setInvoice({ ...invoice, businessName: e.target.value })}
                placeholder="Your company"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Invoice Number</Label>
              <Input
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Client Name</Label>
            <Input
              value={invoice.clientName}
              onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
              placeholder="Client company"
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Line Items</Label>
              <Button onClick={addItem} variant="outline" size="sm" className="gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                  {invoice.items.length > 1 && (
                    <button onClick={() => removeItem(index)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={invoice.includeVAT}
              onChange={(e) => setInvoice({ ...invoice, includeVAT: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600"
            />
            <span className="text-sm">Include VAT (7.5%)</span>
          </label>
        </div>
      </Card>

      {/* Invoice Preview */}
      <Card className="p-6 bg-white">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-slate-800">{invoice.businessName || 'Your Business'}</h2>
          <p className="text-slate-500 text-sm">{invoice.businessAddress || 'Business Address'}</p>
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <p className="text-xs text-slate-500 uppercase">Bill To</p>
            <p className="font-semibold">{invoice.clientName || 'Client Name'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">Invoice</p>
            <p className="font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-sm text-slate-500">{invoice.date}</p>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="border-b text-xs text-slate-500 uppercase">
              <th className="py-2 text-left">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{item.description || '-'}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-3 text-right">{formatCurrency(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 text-right">
          <div className="flex justify-end gap-8">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium w-32">{formatCurrency(subtotal)}</span>
          </div>
          {invoice.includeVAT && (
            <div className="flex justify-end gap-8">
              <span className="text-slate-500">VAT (7.5%)</span>
              <span className="font-medium w-32">{formatCurrency(vat)}</span>
            </div>
          )}
          <div className="flex justify-end gap-8 pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg w-32">{formatCurrency(total)}</span>
          </div>
        </div>

        <Button className="w-full mt-6 gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-4 h-4" /> Download PDF
        </Button>
      </Card>
    </div>
  );
}