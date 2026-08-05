import { useState, useEffect, useMemo } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { User, Car, Search, Eye, ChevronLeft, ChevronRight, FileText, Phone, Mail } from 'lucide-react';
import VerificationRequestDetail from './VerificationRequestDetail';

const VerificationRequests = ({ onShowDetail }) => {
  const { state } = useApp();
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredRequests = useMemo(() => {
    return (state.verificationRequests || []).filter((req) => {
      const matchesSearch =
        req.userName.toLowerCase().includes(search.toLowerCase()) ||
        req.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        req.carName.toLowerCase().includes(search.toLowerCase()) ||
        req.registrationNo.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === 'all' ? true : req.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [state.verificationRequests, search, filter]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

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
    <div className="space-y-6">
      {/* Top Header Section */}
      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Driver Verification</h2>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'verified', 'pending', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === item
                  ? 'bg-[#00D6CC] text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
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
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {/* Table Container */}
      {filteredRequests.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Driver</th>
                  <th scope="col" className="px-6 py-4 font-bold">Contact Info</th>
                  <th scope="col" className="px-6 py-4 font-bold">Car Details</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                  <th scope="col" className="px-6 py-4 font-bold">Submitted On</th>
                  <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRequests.map((reqItem) => {
                  const { date, time } = formatDateTimeSplit(reqItem.createdAt);
                  return (
                    <tr
                      key={reqItem.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Driver Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#00D6CC]/10 text-[#00D6CC] flex items-center justify-center font-bold text-sm uppercase">
                            {reqItem.userName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-950">{reqItem.userName}</div>
                            <div className="text-xs text-slate-400 mt-0.5">ID: {reqItem.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={13} className="text-slate-400" />
                            <span>{reqItem.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={13} className="text-slate-400" />
                            <span>{reqItem.userPhone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Car Details Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                            <Car size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{reqItem.carName}</p>
                            <p className="font-mono text-xs text-slate-400 mt-0.5">{reqItem.registrationNo}</p>
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onShowDetail(reqItem.id)}
                            className="rounded-xl bg-[#00D6CC]/10 text-[#00D6CC] hover:bg-[#00D6CC] hover:text-white px-3 py-2 text-xs font-bold transition shadow-sm"
                          >
                            Show Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {filteredRequests.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRequests.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} entries
              </span>
              <div className="flex items-center gap-1.5 self-end">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 disabled:hover:bg-white transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages || 1 }).map((_, index) => {
                  const pageNum = index + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                        isActive
                          ? 'bg-[#00D6CC] text-white shadow-sm shadow-[#00D6CC]/15'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                  disabled={currentPage === (totalPages || 1)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 disabled:hover:bg-white transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No verification requests found" message="No requests found matching this filter." />
      )}
    </div>
  );
};

export default VerificationRequests;
