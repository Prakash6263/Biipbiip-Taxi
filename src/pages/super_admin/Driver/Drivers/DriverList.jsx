import { useState, useMemo, useEffect } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate } from '../../../../utils/storage';
import { Search, User, Car, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

const DriverList = ({ onShowDetail, onShowRides }) => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="breadcrumb-label">Management</p>
        <h2>All Drivers</h2>
        <p>View and manage taxi drivers registered on the platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'verified', 'pending', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === item
                  ? 'text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
              style={filter === item ? { backgroundColor: '#00D6CC', boxShadow: '0 4px 12px rgba(0, 214, 204, 0.2)' } : {}}
            >
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] transition"
            onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {filteredRequests.length ? (
        <div className="card card-table p-2">
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">Driver</th>
                  <th className="font-bold text-slate-400">Phone</th>
                  <th className="font-bold text-slate-400">Email</th>
                  <th className="font-bold text-slate-400">Car Name</th>
                  <th className="font-bold text-slate-400">Reg No</th>
                  <th className="font-bold text-slate-400 text-center">Status</th>
                  <th className="font-bold text-slate-400">Registered</th>
                  <th className="font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Driver column */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm uppercase text-white"
                          style={{ backgroundColor: '#031E3C' }}
                        >
                          {req.userName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{req.userName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {req.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="text-slate-600 font-semibold text-xs">{req.userPhone}</td>

                    {/* Email */}
                    <td className="text-slate-600 text-xs">{req.userEmail}</td>

                    {/* Car Name */}
                    <td className="text-slate-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Car size={12} className="text-slate-400" />
                        {req.carName}
                      </div>
                    </td>

                    {/* Reg No */}
                    <td>
                      <span className="inline-block bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide border border-slate-200">
                        {req.registrationNo}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <span
                        className="inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-bold capitalize"
                        style={
                          req.status === 'verified'
                            ? { color: '#10b981', borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }
                            : req.status === 'pending'
                            ? { color: '#f59e0b', borderColor: '#fef3c7', backgroundColor: '#fffbeb' }
                            : { color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }
                        }
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Registered */}
                    <td className="text-slate-500 text-xs">
                      {formatDate(req.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <button
                        onClick={() => onShowDetail?.(req.id)}
                        className="inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
                        style={{ backgroundColor: '#00D6CC', boxShadow: '0 2px 6px rgba(0, 214, 204, 0.2)' }}
                      >
                        Show Details
                      </button>
                    </td>
                  </tr>
                ))}
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
                          ? 'text-white shadow-sm'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      style={isActive ? { backgroundColor: '#00D6CC', borderColor: '#00D6CC' } : {}}
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
        <EmptyState title="No users found" message="No users match the selected filters and search details." />
      )}
    </div>
  );
};

export default DriverList;
