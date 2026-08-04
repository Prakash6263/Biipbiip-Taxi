export const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  active: 'bg-blue-50 text-blue-700 ring-blue-200',
  returned: 'bg-slate-50 text-slate-700 ring-slate-200',
  booked: 'bg-purple-50 text-purple-700 ring-purple-200',
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  expired: 'bg-rose-50 text-rose-700 ring-rose-200',
  inactive: 'bg-slate-50 text-slate-700 ring-slate-200',
};

export const labelize = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
