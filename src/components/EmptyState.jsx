import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data found', message = 'No records are available yet.' }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
      <Inbox size={26} />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{message}</p>
  </div>
);

export default EmptyState;
