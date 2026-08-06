import { useState, useMemo, useEffect } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
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
      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Company Car Verification</h2>
        <p className="mt-2 text-slate-500">Verify and manage company car submissions</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === item ? 'bg-[#00D6CC] text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
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
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {cars.length ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Car Details</th>
                <th scope="col" className="px-6 py-4 font-bold">Company</th>
                <th scope="col" className="px-6 py-4 font-bold">Specifications</th>
                <th scope="col" className="px-6 py-4 font-bold">Price / Day</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      {car.image ? (
                        <img
                          src={car.image}
                          alt={car.name}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <CarIcon size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-950">{car.name}</div>
                        <div className="text-xs text-slate-400">{car.brand} {car.model}</div>
                        <div className="text-xs text-slate-500 mt-1">Reg: {car.registrationNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="font-semibold text-slate-800">{car.companyName}</div>
                    <div className="text-xs text-slate-400 mt-1">Added: {formatDate(car.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="text-xs text-slate-600 space-y-1">
                      <div><span className="font-medium">Year:</span> {car.year}</div>
                      <div><span className="font-medium">Fuel:</span> {car.fuelType}</div>
                      <div><span className="font-medium">Transmission:</span> {car.transmission}</div>
                      <div><span className="font-medium">Seats:</span> {car.seats}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="font-bold text-slate-950">₹{car.pricePerDay}</div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge status={car.status} />
                      {car.status === 'rejected' && car.rejectionReason && (
                        <div className="mt-2 text-xs font-medium text-rose-700 bg-rose-50 rounded-xl p-2 border border-rose-100 max-w-[200px] break-words">
                          <b>Reason:</b> {car.rejectionReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onShowDetail?.(car.id)}
                        className="rounded-xl bg-slate-500 text-white hover:bg-slate-600 px-3 py-2 text-xs font-bold transition shadow-sm flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {car.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerify(car.id)}
                            className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-2 text-xs font-bold transition shadow-sm"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, carId: car.id, reason: '' })}
                            className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 px-3 py-2 text-xs font-bold transition shadow-sm"
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
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition min-h-[100px]"
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
