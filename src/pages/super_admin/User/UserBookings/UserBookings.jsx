import { useState, useMemo } from 'react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { formatDate, currency } from '../../../../utils/storage';
import { Search, User, Car, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'rental', label: 'Rental Bookings' },
  { key: 'taxi', label: 'Taxi Bookings' },
];

const UserBookings = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');

  // ── Normal Users (exclude admin & super_admin) ──
  const normalUsers = useMemo(() => {
    return (state.users || []).filter(
      (u) => u.role !== 'admin' && u.role !== 'super_admin'
    );
  }, [state.users]);

  const filteredUsers = normalUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Rental Bookings ──
  const rentalRequests = useMemo(
    () => state.rentalRequests || [],
    [state.rentalRequests]
  );

  const filteredRentals = rentalRequests.filter(
    (r) =>
      r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Taxi Bookings (placeholder – ready for future backend) ──
  const taxiBookings = useMemo(() => state.taxiBookings || [], [state.taxiBookings]);

  const filteredTaxi = taxiBookings.filter(
    (t) =>
      t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      t.customerPhone?.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────── Renderers ───────────

  const renderUsersTable = () => (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm text-slate-500">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-950">{u.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Mail size={13} className="text-slate-400" />
                    <span>{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 capitalize">
                    {u.role || 'user'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRentalsTable = () => (
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
            {filteredRentals.map((r) => {
              const days = Math.max(
                1,
                Math.ceil(
                  (new Date(r.returnDate) - new Date(r.pickupDate)) / 86400000
                )
              );
              const car = (state.cars || []).find((c) => c.id === r.carId);
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
    </div>
  );

  const renderTaxiTable = () => (
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
  );

  const renderContent = () => {
    if (activeTab === 'users') {
      return filteredUsers.length ? (
        renderUsersTable()
      ) : (
        <EmptyState title="No users found" message="No normal users match the search criteria." />
      );
    }
    if (activeTab === 'rental') {
      return filteredRentals.length ? (
        renderRentalsTable()
      ) : (
        <EmptyState title="No rental bookings" message="No rental bookings match the search criteria." />
      );
    }
    // taxi
    return filteredTaxi.length ? (
      renderTaxiTable()
    ) : (
      <EmptyState title="No taxi bookings" message="Taxi booking data is not available yet." />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Users &amp; Bookings</h2>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#00D6CC] text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {/* Table / Empty */}
      {renderContent()}
    </div>
  );
};

export default UserBookings;
