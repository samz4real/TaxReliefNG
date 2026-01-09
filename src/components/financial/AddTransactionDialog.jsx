import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function AddTransactionDialog({ open, onClose, accounts }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    account_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'income',
    tax_deductible: false,
    tax_year: currentYear.toString(),
    merchant: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
      setFormData({
        account_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: 'income',
        tax_deductible: false,
        tax_year: currentYear.toString(),
        merchant: '',
        notes: ''
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Account *</Label>
            <Select value={formData.account_id} onValueChange={(value) => setFormData({ ...formData, account_id: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(a => a.is_active).map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name} - {account.institution_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date *</Label>
            <Input
              type="date"
              required
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
            />
          </div>

          <div>
            <Label>Description *</Label>
            <Input
              required
              placeholder="e.g., Salary payment"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Amount * (use - for expenses)</Label>
            <Input
              type="number"
              step="0.01"
              required
              placeholder="100.00 or -50.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <Label>Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="business_expense">Business Expense</SelectItem>
                <SelectItem value="investment_income">Investment Income</SelectItem>
                <SelectItem value="dividend">Dividend</SelectItem>
                <SelectItem value="interest">Interest</SelectItem>
                <SelectItem value="capital_gain">Capital Gain</SelectItem>
                <SelectItem value="rental_income">Rental Income</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
                <SelectItem value="other_income">Other Income</SelectItem>
                <SelectItem value="personal_expense">Personal Expense</SelectItem>
                <SelectItem value="business_purchase">Business Purchase</SelectItem>
                <SelectItem value="tax_payment">Tax Payment</SelectItem>
                <SelectItem value="retirement_contribution">Retirement Contribution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Merchant/Payer</Label>
            <Input
              placeholder="e.g., ABC Company"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            />
          </div>

          <div>
            <Label>Tax Year</Label>
            <Input
              placeholder={currentYear.toString()}
              value={formData.tax_year}
              onChange={(e) => setFormData({ ...formData, tax_year: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="tax_deductible"
              checked={formData.tax_deductible}
              onCheckedChange={(checked) => setFormData({ ...formData, tax_deductible: checked })}
            />
            <Label htmlFor="tax_deductible" className="cursor-pointer">
              Tax Deductible
            </Label>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}