import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

export default function TransactionFilters({ filters, onFilterChange, accounts }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filters:</span>
          </div>

          <Select value={filters.category} onValueChange={(value) => onFilterChange({ ...filters, category: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="business_expense">Business Expense</SelectItem>
              <SelectItem value="investment_income">Investment Income</SelectItem>
              <SelectItem value="personal_expense">Personal Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.account} onValueChange={(value) => onFilterChange({ ...filters, account: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.year} onValueChange={(value) => onFilterChange({ ...filters, year: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tax Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}