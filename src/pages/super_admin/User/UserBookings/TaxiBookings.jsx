import { useState, useMemo, useEffect } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate, currency } from '../../../../utils/storage';
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
    { id: 'TXB001', customerName: 'Rahul Sharma', customerPhone: '+91 98765 43210', driverName: 'Rajesh Kumar', driverPhone: '+91 87654 32101', carName: 'Maruti Swift', carNumber: 'DL 01 AB 1234', pickup: 'Connaught Place, Delhi', drop: 'Indira Gandhi International Airport', fare: 450, status: 'completed', createdAt: '2025-01-15T08:30:00Z' },
    { id: 'TXB002', customerName: 'Priya Patel', customerPhone: '+91 98765 43211', driverName: 'Suresh Yadav', driverPhone: '+91 87654 32102', carName: 'Honda City', carNumber: 'UP 14 CD 5678', pickup: 'Sector 62, Noida', drop: 'Rajiv Chowk Metro Station', fare: 320, status: 'active', createdAt: '2025-01-16T10:15:00Z' },
    { id: 'TXB003', customerName: 'Amit Kumar', customerPhone: '+91 98765 43212', driverName: 'Pending Assignment', driverPhone: '—', carName: '—', carNumber: '—', pickup: 'DLF Cyber City, Gurgaon', drop: 'Saket Select City Walk', fare: 280, status: 'pending', createdAt: '2025-01-16T14:45:00Z' },
    { id: 'TXB004', customerName: 'Sneha Reddy', customerPhone: '+91 98765 43213', driverName: 'Manoj Singh', driverPhone: '+91 87654 32103', carName: 'Hyundai i20', carNumber: 'DL 02 EF 9012', pickup: 'Nehru Place, Delhi', drop: 'Greater Kailash I', fare: 180, status: 'completed', createdAt: '2025-01-14T09:20:00Z' },
    { id: 'TXB005', customerName: 'Vikram Singh', customerPhone: '+91 98765 43214', driverName: 'Cancelled', driverPhone: '—', carName: '—', carNumber: '—', pickup: 'Vasant Kunj, Delhi', drop: 'Dhaula Kuan', fare: 350, status: 'cancelled', createdAt: '2025-01-13T16:00:00Z' },
    { id: 'TXB006', customerName: 'Anjali Mehta', customerPhone: '+91 98765 43215', driverName: 'Pending Assignment', driverPhone: '—', carName: '—', carNumber: '—', pickup: 'Karol Bagh, Delhi', drop: 'New Delhi Railway Station', fare: 150, status: 'pending', createdAt: '2025-01-17T07:30:00Z' },
    { id: 'TXB007', customerName: 'Rajesh Gupta', customerPhone: '+91 98765 43216', driverName: 'Vijay Verma', driverPhone: '+91 87654 32104', carName: 'Tata Nexon', carNumber: 'HR 26 GH 3456', pickup: 'Lajpat Nagar, Delhi', drop: 'Sarojini Nagar Market', fare: 120, status: 'completed', createdAt: '2025-01-12T11:45:00Z' },
  ];

  const taxiBookings = useMemo(
    () => state.taxiBookings && state.taxiBookings.length > 0 ? state.taxiBookings : demoTaxiBookings,
    [state.taxiBookings]
  );

  const filteredTaxi = useMemo(() => {
    return taxiBookings.filter((t) => {
      const matchesSearch =
        t.id?.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        t.customerPhone?.toLowerCase().includes(search.toLowerCase()) ||
        t.driverName?.toLowerCase().includes(search.toLowerCase()) ||
        t.driverPhone?.toLowerCase().includes(search.toLowerCase()) ||
        t.carName?.toLowerCase().includes(search.toLowerCase()) ||
        t.carNumber?.toLowerCase().includes(search.toLowerCase()) ||
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
      <div className="page-header">
        <p className="breadcrumb-label">Management</p>
        <h2>Taxi Bookings</h2>
        <p>Monitor and track taxi trips, fares, and driver assignments.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'active', 'completed', 'cancelled'].map((item) => (
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
            placeholder="Search taxi bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] transition"
            onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {filteredTaxi.length ? (
        <div className="card card-table p-2">
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">Booking ID</th>
                  <th className="font-bold text-slate-400">Customer Name</th>
                  <th className="font-bold text-slate-400">Phone</th>
                  <th className="font-bold text-slate-400">Driver Name</th>
                  <th className="font-bold text-slate-400">Car Name</th>
                  <th className="font-bold text-slate-400">Car No</th>
                  <th className="font-bold text-slate-400">Pickup</th>
                  <th className="font-bold text-slate-400">Drop Point</th>
                  <th className="font-bold text-slate-400">Fare</th>
                  <th className="font-bold text-slate-400 text-center">Status</th>
                  <th className="font-bold text-slate-400 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTaxi.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Booking ID */}
                    <td>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">
                        {t.id}
                      </span>
                    </td>

                    {/* Customer Name */}
                    <td className="font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm uppercase text-white"
                          style={{ backgroundColor: '#031E3C' }}
                        >
                          {t.customerName.slice(0, 2)}
                        </div>
                        <span>{t.customerName}</span>
                      </div>
                    </td>

                    {/* Customer Phone */}
                    <td className="text-slate-600 text-xs">{t.customerPhone}</td>

                    {/* Driver Name */}
                    <td className="text-slate-800 font-semibold text-sm">{t.driverName || '—'}</td>

                    {/* Car Name */}
                    <td className="text-slate-600 text-xs">{t.carName || '—'}</td>

                    {/* Car No */}
                    <td className="text-slate-600 font-mono text-xs">{t.carNumber || '—'}</td>

                    {/* Pickup */}
                    <td className="text-xs text-slate-700 max-w-[200px] truncate" title={t.pickup}>{t.pickup}</td>

                    {/* Drop */}
                    <td className="text-xs text-slate-700 max-w-[200px] truncate" title={t.drop}>{t.drop}</td>

                    {/* Fare */}
                    <td className="font-extrabold text-slate-900 text-base">{currency(t.fare || 0)}</td>

                    {/* Status */}
                    <td className="text-center">
                      <span
                        className="inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-bold capitalize"
                        style={
                          t.status === 'completed' || t.status === 'active'
                            ? { color: '#10b981', borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }
                            : t.status === 'pending'
                            ? { color: '#f59e0b', borderColor: '#fef3c7', backgroundColor: '#fffbeb' }
                            : { color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }
                        }
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="text-right text-xs text-slate-500">
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
        <EmptyState title="No taxi bookings" message="Taxi booking data is not available yet." />
      )}
    </div>
  );
};

export default TaxiBookings;
