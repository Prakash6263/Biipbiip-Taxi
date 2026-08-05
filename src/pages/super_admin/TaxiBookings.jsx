import { useState, useMemo, useEffect } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate, currency } from '../../utils/storage';
import { Search, Car, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const TaxiBookings = () => {
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
  const demoTaxiBookings = [
    { id: 'TXB001', customerName: 'Rahul Sharma', customerPhone: '+91 98765 43210', pickup: 'Connaught Place, Delhi', drop: 'Indira Gandhi International Airport', fare: 450, status: 'completed', createdAt: '2025-01-15T08:30:00Z' },
    { id: 'TXB002', customerName: 'Priya Patel', customerPhone: '+91 98765 43211', pickup: 'Sector 62, Noida', drop: 'Rajiv Chowk Metro Station', fare: 320, status: 'active', createdAt: '2025-01-16T10:15:00Z' },
    { id: 'TXB003', customerName: 'Amit Kumar', customerPhone: '+91 98765 43212', pickup: 'DLF Cyber City, Gurgaon', drop: 'Saket Select City Walk', fare: 280, status: 'pending', createdAt: '2025-01-16T14:45:00Z' },
    { id: 'TXB004', customerName: 'Sneha Reddy', customerPhone: '+91 98765 43213', pickup: 'Nehru Place, Delhi', drop: 'Greater Kailash I', fare: 180, status: 'completed', createdAt: '2025-01-14T09:20:00Z' },
    { id: 'TXB005', customerName: 'Vikram Singh', customerPhone: '+91 98765 43214', pickup: 'Vasant Kunj, Delhi', drop: 'Dhaula Kuan', fare: 350, status: 'cancelled', createdAt: '2025-01-13T16:00:00Z' },
    { id: 'TXB006', customerName: 'Anjali Mehta', customerPhone: '+91 98765 43215', pickup: 'Karol Bagh, Delhi', drop: 'New Delhi Railway Station', fare: 150, status: 'pending', createdAt: '2025-01-17T07:30:00Z' },
    { id: 'TXB007', customerName: 'Rajesh Gupta', customerPhone: '+91 98765 43216', pickup: 'Lajpat Nagar, Delhi', drop: 'Sarojini Nagar Market', fare: 120, status: 'completed', createdAt: '2025-01-12T11:45:00Z' },
  ];

  const taxiBookings = useMemo(
    () => state.taxiBookings && state.taxiBookings.length > 0 ? state.taxiBookings : demoTaxiBookings,
    [state.taxiBookings]
  );

  const filteredTaxi = useMemo(() => {
    return taxiBookings.filter((t) => {
      const matchesSearch =
        t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        t.customerPhone?.toLowerCase().includes(search.toLowerCase()) ||
        t.pickup?.toLowerCase().includes(search.toLowerCase()) ||
        t.drop?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ? true : t.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [taxiBookings, search, filter]);

  const totalPages = Math.ceil(filteredTaxi.length / itemsPerPage);

  const paginatedTaxi = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTaxi.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTaxi, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Taxi Bookings</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'active', 'completed', 'cancelled'].map((item) => (
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
            placeholder="Search taxi bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {filteredTaxi.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">Pickup → Drop</th>
                  <th className="px-6 py-4 font-bold">Fare</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTaxi.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
                          <Car size={18} />
                        </div>
                        <div className="font-bold text-slate-950">{t.customerName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone size={13} className="text-slate-400" />
                        <span>{t.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{t.pickup} → {t.drop}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-950">
                      {currency(t.fare || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500">
                      {formatDate(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {filteredTaxi.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTaxi.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredTaxi.length)} of {filteredTaxi.length} entries
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
        <EmptyState title="No taxi bookings" message="Taxi booking data is not available yet." />
      )}
    </div>
  );
};

export default TaxiBookings;
