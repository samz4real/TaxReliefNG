import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Filter, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import AddTransactionDialog from '@/components/financial/AddTransactionDialog';
import ImportTransactionsDialog from '@/components/financial/ImportTransactionsDialog';
import TransactionFilters from '@/components/financial/TransactionFilters';
import TransactionRow from '@/components/financial/TransactionRow';

export default function Transactions() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [filters, setFilters] = useState({ category: 'all', account: 'all', year: new Date().getFullYear().toString() });
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date', 1000),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['financial-accounts'],
    queryFn: () => base44.entities.FinancialAccount.list(),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Filter and search
  const filteredTransactions = transactions.filter(t => {
    const categoryMatch = filters.category === 'all' || t.category === filters.category;
    const accountMatch = filters.account === 'all' || t.account_id === filters.account;
    const yearMatch = filters.year === 'all' || t.tax_year === filters.year;
    const searchMatch = searchQuery === '' || 
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && accountMatch && yearMatch && searchMatch;
  });

  // Calculate summary
  const income = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const deductible = filteredTransactions.filter(t => t.tax_deductible).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Transactions</h1>
          <p className="text-slate-600">Track and categorize your financial transactions for tax purposes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-700">₦{income.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-700">₦{expenses.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Tax Deductible</p>
                  <p className="text-2xl font-bold text-blue-700">₦{deductible.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
                <Button onClick={() => setShowImportDialog(true)} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onFilterChange={setFilters}
          accounts={accounts}
        />

        {/* Transactions List */}
        <Card>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-600 mb-4">No transactions found</p>
                <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Transaction
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {filteredTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    account={accounts.find(a => a.id === transaction.account_id)}
                    onUpdate={(data) => updateTransactionMutation.mutate({ id: transaction.id, data })}
                    onDelete={() => deleteTransactionMutation.mutate(transaction.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddTransactionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        accounts={accounts}
      />

      <ImportTransactionsDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        accounts={accounts}
      />
    </div>
  );
}