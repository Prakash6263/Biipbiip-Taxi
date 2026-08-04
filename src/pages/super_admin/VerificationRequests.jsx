import { useState, useEffect } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { User, Car, Search, Eye, SlidersHorizontal, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import VerificationRequestDetail from './VerificationRequestDetail';

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

  // Helper to format submission date and time separately
  const formatDateTimeSplit = (isoString) => {
    if (!isoString) return { date: '—', time: '' };
    const dateObj = new Date(isoString);
    const dateStr = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(dateObj);
    const timeStr = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
    return { date: dateStr, time: timeStr };
  };


  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-1">
      {/* Top Header Section */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Super Admin Panel</p>
        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Driver Verification</h2>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column - List Table */}
        <div className="transition-all duration-300 min-w-0 lg:col-span-12 space-y-5">
          
          {/* Table Header Filter Tabs & Actions */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-soft">
            {/* Filter Tabs */}
            <div className="flex items-center border-b border-slate-100 overflow-x-auto no-scrollbar min-w-0 pr-2">
              {['all', 'pending', 'verified', 'rejected'].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`pb-3.5 px-4 text-xs font-bold transition-all relative whitespace-nowrap -mb-px ${
                    filter === item
                      ? 'text-[#00D6CC] border-b-2 border-[#00D6CC]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {item === 'all' ? 'All Requests' : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            {/* Actions: Search and Filter Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-full max-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#00D6CC] transition font-medium placeholder-slate-400"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition font-sans">
                <SlidersHorizontal size={13} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          {requests.length ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4.5 font-bold">User</th>
                      <th className="px-6 py-4.5 font-bold">Status</th>
                      <th className="px-6 py-4.5 font-bold">Submitted On</th>
                      <th className="px-6 py-4.5 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((reqItem) => {
                      const { date, time } = formatDateTimeSplit(reqItem.createdAt);
                      return (
                        <tr
                          key={reqItem.id}
                          className="transition-colors hover:bg-slate-50/40"
                        >
                          {/* User Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-[#00D6CC]/10 text-[#00D6CC] flex items-center justify-center font-bold text-sm uppercase">
                                {reqItem.userName.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate text-xs">{reqItem.userName}</p>
                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{reqItem.userEmail}</p>
                              </div>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4">
                            <Badge status={reqItem.status} />
                          </td>

                          {/* Submitted On Column */}
                          <td className="px-6 py-4">
                            <div className="text-xs">
                              <p className="font-bold text-slate-700">{date}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{time}</p>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => onShowDetail(reqItem.id)}
                              className="p-2 rounded-xl border bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50 transition"
                              title="Show details"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Mock Pagination Footer */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 p-4.5 bg-slate-50/20 text-xs font-medium text-slate-500">
                <span>Showing 1 to {requests.length} of {requests.length} entries</span>
                <div className="flex items-center gap-1.5 self-end">
                  <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition" disabled>
                    <ChevronLeft size={14} />
                  </button>
                  <button className="h-7 w-7 rounded-lg bg-[#00D6CC] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#00D6CC]/15">
                    1
                  </button>
                  <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs transition">
                    2
                  </button>
                  <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs transition">
                    3
                  </button>
                  <span className="px-1 text-slate-300">...</span>
                  <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs transition">
                    125
                  </button>
                  <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="No verification requests found" message="No requests found matching this filter." />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationRequests;
