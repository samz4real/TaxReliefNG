import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, Trash2, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import moment from 'moment';

const categoryColors = {
  income: 'bg-green-100 text-green-800',
  salary: 'bg-green-100 text-green-800',
  business_expense: 'bg-orange-100 text-orange-800',
  investment_income: 'bg-blue-100 text-blue-800',
  personal_expense: 'bg-gray-100 text-gray-800',
  tax_payment: 'bg-red-100 text-red-800',
};

export default function TransactionRow({ transaction, account, onUpdate, onDelete }) {
  const isIncome = transaction.amount > 0;

  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
            {isIncome ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-slate-900 truncate">{transaction.description}</h4>
              {transaction.tax_deductible && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                  Deductible
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
              <span>{moment(transaction.transaction_date).format('MMM D, YYYY')}</span>
              <span>•</span>
              <span className="truncate">{account?.account_name || 'Unknown Account'}</span>
              {transaction.merchant && (
                <>
                  <span>•</span>
                  <span className="truncate">{transaction.merchant}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {isIncome ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
            </div>
            <Badge className={`${categoryColors[transaction.category] || 'bg-slate-100 text-slate-800'} text-xs`}>
              {transaction.category.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={transaction.is_reviewed}
              onCheckedChange={(checked) => onUpdate({ is_reviewed: checked })}
              title="Mark as reviewed"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdate({ tax_deductible: !transaction.tax_deductible })}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {transaction.tax_deductible ? 'Remove' : 'Mark'} Deductible
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}