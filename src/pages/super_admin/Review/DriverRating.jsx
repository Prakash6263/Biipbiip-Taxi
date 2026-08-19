import { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatDate } from '../../../utils/storage';
import EmptyState from '../../../components/EmptyState';

// ─── Star Rating Display ────────────────────────────────────────────────────
const StarRating = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={16}
        fill={star <= value ? '#f59e0b' : 'none'}
        color={star <= value ? '#f59e0b' : '#d1d5db'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const DriverRating = () => {
  const { state, deleteDriverRating } = useApp();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const itemsPerPage = 10;

  const ratings = state.driverRatings || [];

  useEffect(() => { setCurrentPage(1); }, [search]);

  const filtered = useMemo(() =>
    ratings.filter(r =>
      r.riderName.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(search.toLowerCase())
    ),
    [ratings, search]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id) => {
    deleteDriverRating(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <p className="breadcrumb-label">REVIEW</p>
        <h2>Driver Ratings</h2>
        <p>View and manage ratings submitted by riders for their drivers.</p>
      </div>

      {/* Table */}
      {ratings.length === 0 ? (
        <EmptyState title="No ratings yet" message="Driver ratings will appear here once riders submit feedback." />
      ) : (
        <div className="card card-table p-2">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Display Driver Rating List</h3>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by rider, driver or comment..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition"
                onFocus={e => e.target.style.borderColor = '#00D6CC'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">No.</th>
                  <th className="font-bold text-slate-400">Rider Name (From)</th>
                  <th className="font-bold text-slate-400">Driver Name (To)</th>
                  <th className="font-bold text-slate-400">Rating</th>
                  <th className="font-bold text-slate-400">Date &amp; Time</th>
                  <th className="font-bold text-slate-400">Comments</th>
                  <th className="font-bold text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? paginated.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="text-slate-400 font-semibold text-xs">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td>
                      <span className="font-semibold text-[#00D6CC] text-sm">{row.riderName}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800 text-sm">{row.driverName}</span>
                    </td>
                    <td>
                      <StarRating value={row.rating} />
                    </td>
                    <td className="text-slate-500 text-xs font-medium">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="text-slate-600 text-xs">
                      {row.comment || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="text-right">
                      {confirmDeleteId === row.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(row.id)}
                          className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"
                          title="Delete Rating"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-sm font-medium">
                      No ratings match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/20">
            <span className="text-xs font-medium text-slate-500">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs transition"
                    style={
                      currentPage === p
                        ? { backgroundColor: '#00D6CC', color: '#fff' }
                        : { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569' }
                    }
                  >
                    {p}
                  </button>
                );
              })}
              {totalPages > 7 && <span className="text-slate-400 text-xs">...</span>}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverRating;
