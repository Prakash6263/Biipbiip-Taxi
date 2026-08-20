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

  // Run only once when the company list page mounts to prevent infinite loops
  useEffect(() => {
    if (currentUser && currentUser.token) {
      syncAllCompanies(currentUser.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {item}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs outline-none transition focus:border-[#00D6CC]"
          />
        </div>
      </div>

      {paginatedCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description="There are no rental companies matching your current filter criteria."
        />
      ) : (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{company.companyName}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-slate-400">
                          <span>Reg: {formatDate(company.createdAt)}</span>
                          <span>•</span>
                          <button
                            onClick={() => onShowCars(company.id)}
                            className="text-[#00D6CC] hover:underline bg-transparent border-0 p-0 font-bold"
                          >
                            🚙 {state.cars.filter((c) => c.companyId === company.id).length}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{company.ownerName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-400" />
                        <span>{company.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-400" />
                        <span>{company.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge status={company.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onShowDetail(company.id)}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

export default CompanyList;
