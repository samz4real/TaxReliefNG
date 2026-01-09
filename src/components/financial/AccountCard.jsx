import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MoreVertical, Power, Trash2, TrendingUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import moment from 'moment';

const accountTypeIcons = {
  checking: '💳',
  savings: '🏦',
  investment: '📈',
  credit_card: '💳',
  payroll: '💰',
  retirement: '🏛️',
  business: '🏢'
};

const statusColors = {
  connected: 'bg-green-100 text-green-800',
  manual: 'bg-blue-100 text-blue-800',
  disconnected: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800'
};

export default function AccountCard({ account, transactions, onToggleActive, onDelete }) {
  const transactionCount = transactions.length;
  const recentAmount = transactions.slice(0, 5).reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className={`${account.is_active ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{accountTypeIcons[account.account_type]}</div>
            <div>
              <CardTitle className="text-base">{account.account_name}</CardTitle>
              <p className="text-xs text-slate-500">{account.institution_name}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleActive(account)}>
                <Power className="w-4 h-4 mr-2" />
                {account.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-500 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-slate-900">₦{(account.balance || 0).toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{transactionCount} transactions</span>
            {account.account_number_last4 && (
              <span className="text-slate-400">****{account.account_number_last4}</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[account.connection_status]}>
              {account.connection_status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {account.account_type.replace('_', ' ')}
            </Badge>
          </div>

          {account.last_synced && (
            <p className="text-xs text-slate-500">
              Last synced: {moment(account.last_synced).fromNow()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}