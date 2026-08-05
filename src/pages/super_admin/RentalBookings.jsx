import { useState, useMemo, useEffect } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate, currency } from '../../utils/storage';
import { Search, User, Mail, Phone, Calendar, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

const RentalBookings = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // Demo data
  const demoCars = [
    { id: 'CAR001', name: 'Honda City', pricePerDay: 2500 },
    { id: 'CAR002', name: 'Maruti Swift', pricePerDay: 1800 },
    { id: 'CAR003', name: 'Hyundai i20', pricePerDay: 2000 },
    { id: 'CAR004', name: 'Toyota Innova', pricePerDay: 3500 },
    { id: 'CAR005', name: 'Mahindra XUV500', pricePerDay: 4000 },
  ];

  const demoRentals = [
    { id: 'RNT001', customerName: 'Rahul Sharma', customerEmail: 'rahul.sharma@email.com', customerPhone: '+91 98765 43210', carId: 'CAR001', pickupDate: '2025-01-15', returnDate: '2025-01-18', status: 'active', createdAt: '2025-01-10T10:30:00Z' },
    { id: 'RNT002', customerName: 'Priya Patel', customerEmail: 'priya.patel@email.com', customerPhone: '+91 98765 43211', carId: 'CAR002', pickupDate: '2025-01-20', returnDate: '2025-01-25', status: 'pending', createdAt: '2025-01-12T14:20:00Z' },
    { id: 'RNT003', customerName: 'Amit Kumar', customerEmail: 'amit.kumar@email.com', customerPhone: '+91 98765 43212', carId: 'CAR003', pickupDate: '2025-01-10', returnDate: '2025-01-12', status: 'returned', createdAt: '2025-01-08T09:15:00Z' },
    { id: 'RNT004', customerName: 'Sneha Reddy', customerEmail: 'sneha.reddy@email.com', customerPhone: '+91 98765 43213', carId: 'CAR004', pickupDate: '2025-01-22', returnDate: '2025-01-24', status: 'pending', createdAt: '2025-01-14T16:45:00Z' },
    { id: 'RNT005', customerName: 'Vikram Singh', customerEmail: 'vikram.singh@email.com', customerPhone: '+91 98765 43214', carId: 'CAR005', pickupDate: '2025-01-18', returnDate: '2025-01-20', status: 'rejected', createdAt: '2025-01-11T11:00:00Z' },
    { id: 'RNT006', customerName: 'Anjali Mehta', customerEmail: 'anjali.mehta@email.com', customerPhone: '+91 98765 43215', carId: 'CAR001', pickupDate: '2025-01-25', returnDate: '2025-01-28', status: 'pending', createdAt: '2025-01-15T13:30:00Z' },
  ];

  const rentalRequests = useMemo(
    () => state.rentalRequests && state.rentalRequests.length > 0 ? state.rentalRequests : demoRentals,
    [state.rentalRequests]
  );

  const filteredRentals = useMemo(() => {
    return rentalRequests.filter((r) => {
      const matchesSearch =
        r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        r.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
        r.customerPhone?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ? true : r.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [rentalRequests, search, filter]);

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);

  const paginatedRentals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRentals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRentals, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Rental Bookings</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'active', 'returned', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                filter === item
                  ? 'bg-[#00D6CC] text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
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
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {filteredRentals.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">Duration</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRentals.map((r) => {
                  const days = Math.max(
                    1,
                    Math.ceil(
                      (new Date(r.returnDate) - new Date(r.pickupDate)) / 86400000
                    )
                  );
                  const cars = state.cars && state.cars.length > 0 ? state.cars : demoCars;
                  const car = cars.find((c) => c.id === r.carId);
                  const amount = Number(car?.pricePerDay || 0) * days;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-950">{r.customerName}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {car?.name || 'Unknown Car'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={13} className="text-slate-400" />
                            <span>{r.customerEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={13} className="text-slate-400" />
                            <span>{r.customerPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <div>
                            <div className="font-semibold text-slate-800">
                              {days} {days === 1 ? 'day' : 'days'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {r.pickupDate} → {r.returnDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={14} className="text-slate-400" />
                          <span className="font-bold text-slate-950">{currency(amount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500">
                        {formatDate(r.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {filteredRentals.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRentals.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredRentals.length)} of {filteredRentals.length} entries
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
        <EmptyState title="No rental bookings" message="No rental bookings match the selected filters." />
      )}
    </div>
  );
};

export default RentalBookings;
