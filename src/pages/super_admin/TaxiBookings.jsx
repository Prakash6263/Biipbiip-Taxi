import { useState, useMemo } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate, currency } from '../../utils/storage';
import { Search, Car, Phone, MapPin } from 'lucide-react';

const TaxiBookings = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const taxiBookings = useMemo(
    () => state.taxiBookings || [],
    [state.taxiBookings]
  );

  const filteredTaxi = taxiBookings.filter((t) => {
    const matchesSearch =
      t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      t.customerPhone?.toLowerCase().includes(search.toLowerCase()) ||
      t.pickup?.toLowerCase().includes(search.toLowerCase()) ||
      t.drop?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true : t.status === filter;
    return matchesSearch && matchesFilter;
  });

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
                {filteredTaxi.map((t) => (
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
        </div>
      ) : (
        <EmptyState title="No taxi bookings" message="Taxi booking data is not available yet." />
      )}
    </div>
  );
};

export default TaxiBookings;
