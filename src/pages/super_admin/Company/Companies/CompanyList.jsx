import { useState, useMemo, useEffect } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate } from '../../../../utils/storage';
import { Search, Building2, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

const CompanyList = ({ onShowDetail, onShowCars }) => {
  const { state, currentUser, syncAllCompanies } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (currentUser && currentUser.token) {
      syncAllCompanies(currentUser.token);
    }
  }, [currentUser, syncAllCompanies]);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredCompanies = useMemo(() => {
    return state.companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(search.toLowerCase()) ||
      company.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      company.email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' ? true : company.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [state.companies, search, filter]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="breadcrumb-label">MANAGEMENT</p>
        <h2>Companies</h2>
        <p>Manage and verify rental companies registered on the platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'verified', 'pending', 'rejected'].map((item) => (
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
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] transition"
            onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {filteredCompanies.length ? (
        <div className="card card-table p-2">
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">Company</th>
                  <th className="font-bold text-slate-400">Owner</th>
                  <th className="font-bold text-slate-400">Phone</th>
                  <th className="font-bold text-slate-400">Email</th>
                  <th className="font-bold text-slate-400">GST</th>
                  <th className="font-bold text-slate-400">Address</th>
                  <th className="font-bold text-slate-400 text-center">Status</th>
                  <th className="font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCompanies.map((company) => {
                  const carCount = state.allCompanyCars.filter((car) => car.companyId === company.id).length;
                  return (
                    <tr key={company.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Company Name */}
                      <td className="font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          {company.companyName}
                          <button
                            onClick={() => onShowCars?.(company.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-[#00D6CC]/10 hover:text-[#00D6CC] px-2 py-0.5 text-[10px] font-bold text-slate-600 transition"
                            title="View fleet cars"
                          >
                            🚗 {carCount}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1">
                          Reg: {formatDate(company.createdAt)}
                        </div>
                      </td>

                      {/* Owner Name */}
                      <td className="text-slate-800 font-semibold text-sm">{company.ownerName}</td>

                      {/* Phone */}
                      <td className="text-slate-600 text-xs">{company.phone}</td>

                      {/* Email */}
                      <td className="text-slate-600 text-xs">{company.email}</td>

                      {/* GST */}
                      <td className="text-slate-600 text-xs">{company.gstNumber || '—'}</td>

                      {/* Address */}
                      <td className="text-slate-600 text-xs max-w-[200px] truncate" title={company.address}>
                        {company.address}
                      </td>

                      {/* Status */}
                      <td className="text-center">
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
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <button
                          onClick={() => onShowDetail?.(company.id)}
                          className="inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
                          style={{ backgroundColor: '#00D6CC', boxShadow: '0 2px 6px rgba(0, 214, 204, 0.2)' }}
                        >
                          Show Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {filteredCompanies.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCompanies.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} entries
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
        <EmptyState title="No companies found" message="No companies match the selected filters and search details." />
      )}
    </div>
  );
};

export default CompanyList;
