import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function AddAccountDialog({ open, onClose }) {
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'checking',
    institution_name: '',
    account_number_last4: '',
    balance: 0,
    connection_status: 'manual',
    notes: ''
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FinancialAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
      onClose();
      setFormData({
        account_name: '',
        account_type: 'checking',
        institution_name: '',
        account_number_last4: '',
        balance: 0,
        connection_status: 'manual',
        notes: ''
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      last_synced: new Date().toISOString()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Financial Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Account Name *</Label>
            <Input
              required
              placeholder="e.g., Main Checking Account"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            />
          </div>

          <div>
            <Label>Account Type *</Label>
            <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Institution Name *</Label>
            <Input
              required
              placeholder="e.g., First Bank of Nigeria"
              value={formData.institution_name}
              onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
            />
          </div>

          <div>
            <Label>Last 4 Digits (optional)</Label>
            <Input
              maxLength={4}
              placeholder="1234"
              value={formData.account_number_last4}
              onChange={(e) => setFormData({ ...formData, account_number_last4: e.target.value })}
            />
          </div>

          <div>
            <Label>Current Balance</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            />
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
              {createMutation.isLoading ? 'Adding...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}