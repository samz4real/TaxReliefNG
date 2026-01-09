import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ImportTransactionsDialog({ open, onClose, accounts }) {
  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const createBulkMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
      setFile(null);
      setAccountId('');
      setError(null);
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!file || !accountId) {
      setError('Please select both a file and an account');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Upload file first
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;

      // Extract data from CSV
      const extractResponse = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: 'object',
          properties: {
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  description: { type: 'string' },
                  amount: { type: 'number' },
                  category: { type: 'string' },
                  merchant: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (extractResponse.status === 'success' && extractResponse.output?.transactions) {
        const transactions = extractResponse.output.transactions.map(t => ({
          account_id: accountId,
          transaction_date: t.date || new Date().toISOString().split('T')[0],
          description: t.description || 'Imported transaction',
          amount: parseFloat(t.amount) || 0,
          category: t.category || 'income',
          merchant: t.merchant || '',
          tax_year: new Date(t.date || Date.now()).getFullYear().toString(),
          tax_deductible: false,
          is_reviewed: false
        }));

        await createBulkMutation.mutateAsync(transactions);
      } else {
        setError('Failed to process CSV file. Please check the format.');
      }
    } catch (err) {
      setError('An error occurred while importing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">CSV Format</p>
                  <p>Your CSV should have columns: date, description, amount, category, merchant</p>
                  <p className="mt-1 text-xs">Example: 2024-01-15, "Salary Payment", 50000, "salary", "ABC Corp"</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Select Account *</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an account" />
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
            <Label>Upload CSV File *</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-500" />
                  <p className="mb-2 text-sm text-slate-500">
                    {file ? file.name : 'Click to upload CSV'}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={!file || !accountId || isProcessing}
            >
              {isProcessing ? 'Importing...' : 'Import Transactions'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}