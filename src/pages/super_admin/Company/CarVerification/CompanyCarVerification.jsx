import { useState, useMemo, useEffect } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate } from '../../../../utils/storage';
import { Search, Car as CarIcon, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const CompanyCarVerification = ({ onShowDetail }) => {
  const { state, verifyCompanyCar, rejectCompanyCar } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [rejectModal, setRejectModal] = useState({ open: false, carId: null, reason: '' });

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

  const handleVerify = async (carId) => {
    await verifyCompanyCar(carId);
  };

  const handleReject = async () => {
    if (rejectModal.carId && rejectModal.reason.trim()) {
      await rejectCompanyCar(rejectModal.carId, rejectModal.reason);
      setRejectModal({ open: false, carId: null, reason: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="breadcrumb-label">Verification</p>
        <h2>Company Car Verification</h2>
        <p>Verify and manage company car submissions for the rental catalog.</p>
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
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] transition"
            onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {cars.length ? (
        <div className="card card-table p-2">
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">Car Name</th>
                  <th className="font-bold text-slate-400">Reg No</th>
                  <th className="font-bold text-slate-400">Company</th>
                  <th className="font-bold text-slate-400">Date Added</th>
                  <th className="font-bold text-slate-400">Specifications</th>
                  <th className="font-bold text-slate-400">Price / Day</th>
                  <th className="font-bold text-slate-400 text-center">Status</th>
                  <th className="font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50/40 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        {car.image ? (
                          <img
                            src={car.image}
                            alt={car.name}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                            <CarIcon size={20} className="text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{car.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{car.brand} {car.model}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 inline-block">
                        {car.registrationNo}
                      </span>
                    </td>

                    <td className="font-bold text-slate-800 text-sm">{car.companyName}</td>

                    <td className="text-xs text-slate-500">{formatDate(car.createdAt)}</td>

                    <td>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div><span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider mr-1">Year:</span> {car.year}</div>
                        <div><span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider mr-1">Fuel:</span> {car.fuelType}</div>
                        <div><span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider mr-1">Gear:</span> {car.transmission}</div>
                        <div><span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider mr-1">Seats:</span> {car.seats}</div>
                      </div>
                    </td>

                    <td>
                      <div className="font-extrabold text-slate-900 text-base">₹{car.pricePerDay}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Per Day</div>
                    </td>

                    <td className="text-center">
                      <div className="inline-flex flex-col gap-1 items-center justify-center">
                        <span
                          className="inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-bold capitalize"
                          style={
                            car.status === 'verified'
                              ? { color: '#10b981', borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }
                              : car.status === 'pending'
                              ? { color: '#f59e0b', borderColor: '#fef3c7', backgroundColor: '#fffbeb' }
                              : { color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }
                          }
                        >
                          {car.status}
                        </span>
                        {car.status === 'rejected' && car.rejectionReason && (
                          <div className="mt-1 text-[10px] font-semibold text-rose-600 max-w-[150px] truncate" title={car.rejectionReason}>
                            Reason: {car.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => onShowDetail?.(car.id)}
                          className="inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-bold text-white transition hover:opacity-90 shadow-sm animate-pulse-subtle"
                          style={{ backgroundColor: '#00D6CC', boxShadow: '0 2px 6px rgba(0, 214, 204, 0.2)' }}
                        >
                          Show Details
                        </button>
                        {car.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(car.id)}
                              className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, carId: car.id, reason: '' })}
                              className="inline-flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
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

          {/* Table Pagination Footer */}
          {cars.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, cars.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, cars.length)} of {cars.length} entries
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
        <EmptyState title="No cars found" message="No company cars found for the selected filter." />
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-950 mb-4">Reject Car</h3>
            <p className="text-sm text-slate-600 mb-4">Please provide a reason for rejecting this car.</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter rejection reason..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#00D6CC] transition min-h-[100px]"
              onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectModal({ open: false, carId: null, reason: '' })}
                className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 text-sm font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason.trim()}
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed px-4 py-2 text-sm font-bold transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCarVerification;
