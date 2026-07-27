import { useState } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { Search } from 'lucide-react';

const CompanyVerification = ({ onShowDetail }) => {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const companies = state.companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(search.toLowerCase()) ||
      company.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      company.email.toLowerCase().includes(search.toLowerCase()) ||
      (company.gstNumber && company.gstNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = filter === 'all' ? true : company.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Company Verification</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === item ? 'bg-[#00D6CC] text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                }`}
            >
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {companies.length ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Company</th>
                <th scope="col" className="px-6 py-4 font-bold">Contact Details</th>
                <th scope="col" className="px-6 py-4 font-bold">GST & Address</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <div className="font-bold text-slate-950">{company.companyName}</div>
                    <div className="text-xs text-slate-400 mt-1">Reg: {formatDate(company.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="font-semibold text-slate-800">{company.ownerName}</div>
                    <div className="text-xs text-slate-500 mt-1">{company.phone}</div>
                    <div className="text-xs text-slate-400">{company.email}</div>
                  </td>
                  <td className="px-6 py-4 align-middle max-w-xs">
                    <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 rounded-lg px-2 py-1 inline-block mb-2">
                      GST: {company.gstNumber || '—'}
                    </div>
                    <div className="text-xs text-slate-500 break-words leading-relaxed">
                      {company.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge status={company.status} />
                      {company.status === 'rejected' && company.rejectionReason && (
                        <div className="mt-2 text-xs font-medium text-rose-700 bg-rose-50 rounded-xl p-2 border border-rose-100 max-w-[200px] break-words">
                          <b>Reason:</b> {company.rejectionReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-right">
                    <button
                      onClick={() => onShowDetail?.(company.id)}
                      className="rounded-xl bg-[#00D6CC] text-white hover:opacity-90 px-4 py-2 text-xs font-bold transition shadow-sm"
                    >
                      Show Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No companies found" message="Selected filter ke liye koi company nahi mili." />
      )}
    </div>
  );
};

export default CompanyVerification;
