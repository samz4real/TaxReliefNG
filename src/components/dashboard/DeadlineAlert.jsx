import React from 'react';
import { Bell, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const deadlines = [
  {
    title: "Annual Tax Return",
    date: new Date(2025, 2, 31),
    description: "File your 2024 annual tax return",
    priority: "high"
  },
  {
    title: "Q1 VAT Returns",
    date: new Date(2025, 0, 21),
    description: "Submit Q4 2024 VAT returns",
    priority: "high"
  },
  {
    title: "New Reliefs Active",
    date: new Date(2025, 0, 1),
    description: "New tax reliefs and exemptions now in effect",
    priority: "info"
  }
];

export default function DeadlineAlert() {
  const today = new Date();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-800">Upcoming Deadlines</h3>
        </div>
        <span className="text-xs text-slate-500">Tax Calendar</span>
      </div>

      <div className="divide-y divide-slate-100">
        {deadlines.map((deadline, index) => {
          const daysLeft = differenceInDays(deadline.date, today);
          const isUrgent = daysLeft <= 7 && daysLeft >= 0;
          const isPast = daysLeft < 0;

          return (
            <div 
              key={index}
              className={`p-4 hover:bg-slate-50 transition-colors ${
                isUrgent ? 'bg-red-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  deadline.priority === 'high' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {isUrgent ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Calendar className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 text-sm">{deadline.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{deadline.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className={`text-xs font-medium ${
                      isUrgent ? 'text-red-600' : isPast ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {isPast 
                        ? 'Deadline passed' 
                        : daysLeft === 0 
                          ? 'Due today!' 
                          : `${daysLeft} days left`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {format(deadline.date, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}