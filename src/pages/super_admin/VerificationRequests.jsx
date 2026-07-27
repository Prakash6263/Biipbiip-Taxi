import { useState } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { User, Car, Search } from 'lucide-react';

const VerificationRequests = ({ onShowDetail }) => {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const requests = (state.verificationRequests || []).filter((req) => {
    const matchesSearch =
      req.userName.toLowerCase().includes(search.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      req.carName.toLowerCase().includes(search.toLowerCase()) ||
      req.registrationNo.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' ? true : req.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Driver Verification</h2>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === item
                ? 'bg-[#00D6CC] text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                }`}
            >
              {item === 'all' ? 'All Requests' : item.charAt(0).toUpperCase() + item.slice(1)}
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

      {requests.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-6 py-4"> Driver</th>
                  <th className="px-6 py-4">Car Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-950">{req.userName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{req.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                          <Car size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{req.carName}</p>
                          <p className="font-mono text-xs text-slate-400 mt-0.5">{req.registrationNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onShowDetail?.(req.id)}
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
        </div>
      ) : (
        <EmptyState title="No verification requests found" message="Kuch bhi requests is filter ke liye available nahi hai." />
      )}
    </div>
  );
};

export default VerificationRequests;
