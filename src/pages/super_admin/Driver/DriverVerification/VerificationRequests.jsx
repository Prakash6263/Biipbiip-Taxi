import { useState, useEffect, useMemo } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate } from '../../../../utils/storage';
import { User, Search, Eye, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';

const VerificationRequests = ({ onShowDetail }) => {
  const { state, currentUser, syncAllDrivers } = useApp();
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Run only once when verification requests mounts to prevent loops
  useEffect(() => {
    if (currentUser && currentUser.token) {
      syncAllDrivers(currentUser.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Page Header */}
      <div className="page-header">
        <p className="breadcrumb-label">VERIFICATIONS</p>
        <h2>Driver Verification Requests</h2>
        <p>Review and verify identity and vehicle documents submitted by drivers.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === item
                  ? 'text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
              style={filter === item ? { backgroundColor: '#00D6CC', boxShadow: '0 4px 12px rgba(0, 214, 204, 0.2)' } : {}}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card (Standard format) */}
      {paginatedRequests.length === 0 ? (
        <EmptyState
          icon={User}
          title="No Requests Found"
          description="There are no driver verification requests matching your current status filter."
        />
      ) : (
        <div className="card card-table p-2">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4">
            <div></div>
            
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search drivers, cars, registration..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs outline-none transition focus:border-[#00D6CC]"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0 text-left">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">Driver</th>
                  <th className="font-bold text-slate-400">Contact Info</th>
                  <th className="font-bold text-slate-400">Car Details</th>
                  <th className="font-bold text-slate-400">Submitted On</th>
                  <th className="font-bold text-slate-400 text-center">Status</th>
                  <th className="font-bold text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="align-middle font-bold text-slate-900">{req.userName}</td>
                    <td className="align-middle font-semibold text-slate-700">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Phone size={12} className="text-slate-400" />
                          <span>{req.userPhone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Mail size={12} className="text-slate-400" />
                          <span>{req.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle font-semibold text-slate-700">
                      <div>
                        <p className="font-bold text-slate-900">{req.carName}</p>
                        <p className="font-mono font-bold text-slate-500 uppercase mt-0.5 text-[10px] tracking-wider">{req.registrationNo}</p>
                      </div>
                    </td>
                    <td className="align-middle text-slate-500 font-medium">{formatDate(req.createdAt)}</td>
                    <td className="align-middle text-center">
                      <Badge status={req.status} />
                    </td>
                    <td className="align-middle text-center">
                      <button
                        onClick={() => onShowDetail(req.id)}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 mx-auto"
                      >
                        <Eye size={12} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/30">
              <span className="text-xs text-slate-400 font-semibold">
                Showing page <span className="text-slate-800 font-bold">{currentPage}</span> of <span className="text-slate-800 font-bold">{totalPages}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationRequests;
