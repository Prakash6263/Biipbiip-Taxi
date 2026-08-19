import { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';

const DisplayCancelReasons = ({ onEdit }) => {
  const { state, toggleCancelReasonStatus, deleteCancelReason } = useApp();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const itemsPerPage = 10;

  const reasons = state.cancelReasons || [];

  const filtered = useMemo(() => {
    return reasons.filter(r =>
      (r.reasonText || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.reasonTextPt || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [reasons, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id) => {
    deleteCancelReason(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="page-header">
        <p className="breadcrumb-label">CANCEL REASONS</p>
        <h2>Display Cancel Reasons</h2>
        <p>Manage ride cancellation reasons and translations available across the system.</p>
      </div>

      {/* Table Card (Standard clean white table layout) */}
      <div className="card card-table p-2">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-[#00D6CC]" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cancel Reasons List</h3>
          </div>
          
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search cancel reasons..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs outline-none transition focus:border-[#00D6CC]"
            />
          </div>
        </div>

        {/* Card Body and Table wrapper */}
        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped mb-0 text-left">
            <thead>
              <tr>
                <th className="font-bold text-slate-400 w-16 text-center">No.</th>
                <th className="font-bold text-slate-400">Reason Text</th>
                <th className="font-bold text-slate-400">Reason Text (Portugal)</th>
                <th className="font-bold text-slate-400 text-center w-28">Action</th>
                <th className="font-bold text-slate-400 text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No cancel reasons found. Try adjusting your search query.
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="text-slate-400 font-semibold text-xs text-center">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="text-slate-800 text-xs font-semibold leading-relaxed">
                      {row.reasonText}
                    </td>
                    <td className="text-slate-800 text-xs font-semibold leading-relaxed">
                      {row.reasonTextPt}
                    </td>
                    <td className="text-center">
                      {confirmDeleteId === row.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded text-[10px] font-bold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-lg transition"
                            title="Edit Reason"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(row.id)}
                            className="p-1.5 border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            title="Delete Reason"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => toggleCancelReasonStatus(row.id)}
                        className={`inline-flex rounded px-2.5 py-0.5 text-[9px] font-bold text-white uppercase transition ${
                          row.status === 'Active' ? 'bg-[#002b5c]' : 'bg-slate-400'
                        }`}
                        title="Click to toggle status"
                      >
                        {row.status === 'Active' ? 'Active' : 'Deactive'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
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
    </div>
  );
};

export default DisplayCancelReasons;
