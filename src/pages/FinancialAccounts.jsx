import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, AlertCircle, RefreshCw, Eye, Building2, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AddAccountDialog from '@/components/financial/AddAccountDialog';
import AccountCard from '@/components/financial/AccountCard';

export default function FinancialAccounts() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['financial-accounts'],
    queryFn: () => base44.entities.FinancialAccount.list('-created_date'),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date', 1000),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FinancialAccount.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });

  const activeAccounts = accounts.filter(acc => acc.is_active);
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  
  const accountsByType = activeAccounts.reduce((acc, account) => {
    acc[account.account_type] = (acc[account.account_type] || 0) + 1;
    return acc;
  }, {});

  const handleToggleActive = (account) => {
    updateAccountMutation.mutate({
      id: account.id,
      data: { is_active: !account.is_active }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Accounts</h1>
          <p className="text-slate-600">Manage your connected accounts and track transactions for tax purposes</p>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Manual Entry Mode</p>
                <p>To connect real bank accounts automatically (via Plaid or similar), enable Backend Functions in your app settings. For now, you can add accounts manually and import transactions.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₦{totalBalance.toLocaleString()}</div>
              <p className="text-xs opacity-75 mt-1">Across {activeAccounts.length} active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{activeAccounts.length}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.entries(accountsByType).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{transactions.length}</div>
              <Link to={createPageUrl('Transactions')}>
                <Button variant="link" className="p-0 h-auto text-emerald-600 mt-1">
                  View all transactions →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
          <Link to={createPageUrl('Transactions')}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Transactions
            </Button>
          </Link>
        </div>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No accounts yet</h3>
                <p className="text-slate-600 mb-4">Add your first financial account to start tracking transactions</p>
                <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                transactions={transactions.filter(t => t.account_id === account.id)}
                onToggleActive={handleToggleActive}
                onDelete={() => deleteAccountMutation.mutate(account.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Account Dialog */}
      <AddAccountDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}