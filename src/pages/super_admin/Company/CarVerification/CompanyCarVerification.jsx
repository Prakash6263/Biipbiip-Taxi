import { useState, useMemo, useEffect } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate } from '../../../../utils/storage';
import { Search, Car as CarIcon, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CompanyCarVerification = ({ onShowDetail }) => {
  const { state, verifyCompanyCar, rejectCompanyCar, currentUser, syncAllCompanyCars } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [rejectModal, setRejectModal] = useState({ open: false, carId: null, reason: '' });

  // Run only once when company car verification mounts to prevent loops
  useEffect(() => {
    if (currentUser && currentUser.token) {
      syncAllCompanyCars(currentUser.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.token]);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const cars = useMemo(() => {
    return state.allCompanyCars.filter((car) => {
      const matchesSearch =
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.brand.toLowerCase().includes(search.toLowerCase()) ||
        car.model.toLowerCase().includes(search.toLowerCase()) ||
        car.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
        car.companyName.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === 'all' ? true : car.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [state.allCompanyCars, search, filter]);

  const totalPages = Math.ceil(cars.length / itemsPerPage);

  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return cars.slice(startIndex, startIndex + itemsPerPage);
  }, [cars, currentPage, itemsPerPage]);

  const handleVerify = (id) => {
    verifyCompanyCar(id);
  };

  const handleOpenReject = (id) => {
    setRejectModal({ open: true, carId: id, reason: '' });
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectModal.reason.trim()) return;
    rejectCompanyCar(rejectModal.carId, rejectModal.reason.trim());
    setRejectModal({ open: false, carId: null, reason: '' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <p className="breadcrumb-label">VERIFICATIONS</p>
        <h2>Company Car Verification</h2>
        <p>Review and verify vehicle documents submitted by companies.</p>
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
      {paginatedCars.length === 0 ? (
        <EmptyState
          icon={CarIcon}
          title="No Vehicles Found"
          description="There are no company vehicles waiting for verification under this status."
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
                placeholder="Search cars, brands, registration..."
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
                  <th className="font-bold text-slate-400">Vehicle Details</th>
                  <th className="font-bold text-slate-400">Company Name</th>
                  <th className="font-bold text-slate-400">Registration No.</th>
                  <th className="font-bold text-slate-400">Submitted On</th>
                  <th className="font-bold text-slate-400 text-center">Status</th>
                  <th className="font-bold text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {car.image ? (
                            <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <CarIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{car.brand} {car.model}</p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{car.year} • {car.fuelType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle font-semibold text-slate-700">{car.companyName}</td>
                    <td className="align-middle font-mono font-bold text-slate-600 text-xs uppercase">{car.registrationNo}</td>
                    <td className="align-middle text-slate-500 font-medium">{formatDate(car.createdAt)}</td>
                    <td className="align-middle text-center">
                      <Badge status={car.status} />
                    </td>
                    <td className="align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onShowDetail(car.id)}
                          className="p-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl transition"
                          title="View Documents"
                        >
                          <Eye size={14} />
                        </button>
                        {car.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(car.id)}
                              className="rounded-xl bg-[#00D6CC] text-white px-3 py-1.5 text-xs font-bold shadow-sm transition hover:opacity-90 active:scale-95 border-0"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleOpenReject(car.id)}
                              className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 px-3 py-1.5 text-xs font-bold transition hover:bg-rose-100/60"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
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

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95">
            <div className="bg-[#002E5B] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-wider uppercase">Reject Vehicle Request</h3>
              <button
                onClick={() => setRejectModal({ open: false, carId: null, reason: '' })}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify the reason why this vehicle's verification request is being rejected..."
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#00D6CC] focus:bg-white resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, carId: null, reason: '' })}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCarVerification;
