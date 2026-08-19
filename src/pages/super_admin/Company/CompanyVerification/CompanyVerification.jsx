import { useState, useMemo, useEffect } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate } from '../../../../utils/storage';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const CompanyVerification = ({ onShowDetail }) => {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const companies = useMemo(() => {
    return state.companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(search.toLowerCase()) ||
      company.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      company.email.toLowerCase().includes(search.toLowerCase()) ||
      (company.gstNumber && company.gstNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = filter === 'all' ? true : company.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [state.companies, search, filter]);

  const totalPages = Math.ceil(companies.length / itemsPerPage);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return companies.slice(startIndex, startIndex + itemsPerPage);
  }, [companies, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="breadcrumb-label">Verification</p>
        <h2>Company Verification</h2>
        <p>Review and verify documentation uploaded by car rental companies.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((item) => (
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
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] transition"
            onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {companies.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-400">Company</th>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-400">Contact Details</th>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-400">GST & Address</th>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-400 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* COMPANY column */}
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{company.companyName}</div>
                        <div className="text-xs text-slate-400 mt-1">Reg: {formatDate(company.createdAt)}</div>
                      </div>
                    </td>

                    {/* CONTACT DETAILS column */}
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{company.ownerName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{company.phone}</div>
                        <div className="text-xs text-slate-400">{company.email}</div>
                      </div>
                    </td>

                    {/* GST & ADDRESS column */}
                    <td className="px-6 py-5">
                      <div className="max-w-[300px]">
                        <span className="inline-block bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide mb-1 border border-slate-200">
                          GST: {company.gstNumber || '—'}
                        </span>
                        <div className="text-xs text-slate-500 truncate" title={company.address}>
                          {company.address}
                        </div>
                      </div>
                    </td>

                    {/* STATUS column */}
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col gap-1 items-center justify-center">
                        <span
                          className="inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-bold capitalize"
                          style={
                            company.status === 'verified'
                              ? { color: '#10b981', borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }
                              : company.status === 'pending'
                              ? { color: '#f59e0b', borderColor: '#fef3c7', backgroundColor: '#fffbeb' }
                              : { color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }
                          }
                        >
                          {company.status}
                        </span>
                        {company.status === 'rejected' && company.rejectionReason && (
                          <div className="mt-1 text-[10px] font-semibold text-rose-600 max-w-[150px] truncate" title={company.rejectionReason}>
                            Reason: {company.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ACTIONS column */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => onShowDetail?.(company.id)}
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
          {companies.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, companies.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, companies.length)} of {companies.length} entries
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
        <EmptyState title="No companies found" message="No companies found for the selected filter." />
      )}
    </div>
  );
};

export default CompanyVerification;
