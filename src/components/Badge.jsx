import { labelize, statusStyles } from '../utils/status';

const Badge = ({ status }) => {
  const classes = statusStyles[status] || 'bg-slate-50 text-slate-700 ring-slate-200';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>{labelize(status)}</span>;
};

export default Badge;
