import { useState, useMemo, useEffect } from 'react';
import { currency } from '../../../utils/storage';
import {
  IndianRupee,
  Users,
  Car,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const demoDriverReports = [
  { id: 'DRV001', name: 'Rajesh Kumar',     phone: '+91 87654 32101', trips: 23, total: 18450, commission: 1845, payable: 16605 },
  { id: 'DRV002', name: 'Suresh Yadav',     phone: '+91 87654 32102', trips: 14, total: 11200, commission: 1120, payable: 10080 },
  { id: 'DRV003', name: 'Manoj Singh',      phone: '+91 87654 32103', trips: 20, total: 16000, commission:  160, payable: 15840 },
  { id: 'DRV004', name: 'Vijay Verma',      phone: '+91 87654 32104', trips:  5, total:  4000, commission:  400, payable:  3600 },
  { id: 'DRV005', name: 'Arun Tiwari',      phone: '+91 87654 32105', trips:  6, total:  4800, commission:  480, payable:  4320 },
  { id: 'DRV006', name: 'Sanjay Patil',     phone: '+91 87654 32106', trips:  5, total:  4100, commission:   41, payable:  4059 },
  { id: 'DRV007', name: 'Deepak Sharma',    phone: '+91 87654 32107', trips:  4, total:  3200, commission:  320, payable:  2880 },
  { id: 'DRV008', name: 'Nitin Gupta',      phone: '+91 87654 32108', trips:  3, total:  2400, commission:    0, payable:  2400 },
  { id: 'DRV009', name: 'Ramesh Rao',       phone: '+91 87654 32109', trips:  3, total:  2250, commission:  225, payable:  2025 },
  { id: 'DRV010', name: 'Pradeep Nair',     phone: '+91 87654 32110', trips:  3, total:  2100, commission:  210, payable:  1890 },
  { id: 'DRV011', name: 'Harish Patel',     phone: '+91 87654 32111', trips:  2, total:  1600, commission:  160, payable:  1440 },
  { id: 'DRV012', name: 'Kiran Joshi',      phone: '+91 87654 32112', trips:  1, total:   800, commission:   80, payable:   720 },
];

const demoCompanyReports = [
  { id: 'COM001', name: 'Sharma Travels',       phone: '+91 98765 43210', trips: 42, total: 87500, commission: 4375, payable: 83125 },
  { id: 'COM002', name: 'City Wheels Rental',   phone: '+91 99887 76655', trips: 31, total: 64000, commission: 3200, payable: 60800 },
  { id: 'COM003', name: 'QuickRide Cabs',       phone: '+91 91234 56789', trips: 28, total: 52000, commission: 2600, payable: 49400 },
  { id: 'COM004', name: 'Metro Car Rentals',    phone: '+91 92345 67890', trips: 19, total: 38000, commission: 1900, payable: 36100 },
  { id: 'COM005', name: 'Sunrise Cab Services', phone: '+91 93456 78901', trips: 15, total: 28000, commission: 1400, payable: 26600 },
  { id: 'COM006', name: 'Royal Fleet India',    phone: '+91 94567 89012', trips: 12, total: 22500, commission: 1125, payable: 21375 },
  { id: 'COM007', name: 'Swift Rentals',        phone: '+91 95678 90123', trips:  9, total: 16800, commission:  840, payable: 15960 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SummaryCard = ({ icon: Icon, label, value, accent }) => (
  <div
    className="flex items-center gap-4 rounded-2xl p-5 shadow-sm"
    style={{ background: accent ? '#00D6CC' : '#031E3C' }}
  >
    <div
      className="flex h-14 w-14 items-center justify-center rounded-xl"
      style={{ backgroundColor: accent ? 'rgba(255,255,255,0.25)' : 'rgba(0,214,204,0.15)' }}
    >
      <Icon size={26} color={accent ? '#031E3C' : '#00D6CC'} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent ? '#031E3C99' : '#ffffff88' }}>
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-extrabold" style={{ color: accent ? '#031E3C' : '#ffffff' }}>
        {value}
      </p>
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onChange }) => (
  <div className="flex items-center gap-1.5">
    <button
      onClick={() => onChange(Math.max(currentPage - 1, 1))}
      disabled={currentPage === 1}
      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
    >
      <ChevronLeft size={14} />
    </button>
    {Array.from({ length: totalPages || 1 }).map((_, i) => {
      const p = i + 1;
      return (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs transition"
          style={
            currentPage === p
              ? { backgroundColor: '#00D6CC', color: '#fff' }
              : { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569' }
          }
        >
          {p}
        </button>
      );
    })}
    <button
      onClick={() => onChange(Math.min(currentPage + 1, totalPages || 1))}
      disabled={currentPage === (totalPages || 1)}
      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
    >
      <ChevronRight size={14} />
    </button>
  </div>
);

const HistoryModal = ({ item, type, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Payment History — {item.name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-xl font-bold">✕</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: type === 'driver' ? 'Total Trips' : 'Total Rentals', value: item.trips, color: '#031E3C' },
          { label: 'Total Revenue', value: currency(item.total),   color: '#031E3C' },
          { label: 'Payable',       value: currency(item.payable), color: '#00D6CC' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-4 text-center text-white" style={{ backgroundColor: card.color }}>
            <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{card.label}</p>
            <p className="mt-1 text-lg font-extrabold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-bold">Item</th>
              <th className="px-4 py-3 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 text-slate-700">Gross Earnings</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">{currency(item.total)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-rose-600">
                Platform Commission ({type === 'driver' ? '10%' : '5%'})
              </td>
              <td className="px-4 py-3 text-right font-semibold text-rose-600">− {currency(item.commission)}</td>
            </tr>
            <tr className="bg-emerald-50">
              <td className="px-4 py-3 font-bold text-emerald-700">Net Payable</td>
              <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{currency(item.payable)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const PaymentTable = ({ data, type }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => { setCurrentPage(1); }, [search]);

  const filtered = useMemo(() =>
    data.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
    ), [data, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalTrips   = data.reduce((s, r) => s + r.trips, 0);
  const totalRevenue = data.reduce((s, r) => s + r.total, 0);

  const isDriver = type === 'driver';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={isDriver ? Users : Car}
          label={isDriver ? 'Total No Of Rides' : 'Total No Of Rentals'}
          value={totalTrips}
          accent={true}
        />
        <SummaryCard
          icon={IndianRupee}
          label={`Revenue From ${totalTrips} ${isDriver ? 'Rides' : 'Rentals'}`}
          value={currency(totalRevenue)}
          accent={false}
        />
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-950">Payment History</h3>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${isDriver ? 'driver' : 'company'}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition"
              onFocus={e => e.target.style.borderColor = '#00D6CC'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">#</th>
                <th className="px-6 py-4 font-bold">{isDriver ? 'Driver Name' : 'Company Name'}</th>
                <th className="px-6 py-4 font-bold">{isDriver ? 'Trips' : 'Rentals'}</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Commission</th>
                <th className="px-6 py-4 font-bold">Payable</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-semibold">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm uppercase"
                        style={isDriver
                          ? { backgroundColor: '#031E3C', color: '#fff' }
                          : { backgroundColor: 'rgba(0,214,204,0.12)', color: '#00D6CC' }
                        }
                      >
                        {isDriver ? row.name.slice(0, 2) : <Building2 size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{row.trips}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{currency(row.total)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-rose-600 bg-rose-50">
                      {currency(row.commission)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50">
                      {currency(row.payable)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(row)}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition"
                      style={{ backgroundColor: 'rgba(0,214,204,0.1)', color: '#00D6CC' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#00D6CC'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,214,204,0.1)'; e.currentTarget.style.color = '#00D6CC'; }}
                    >
                      <Eye size={12} /> All Payment History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/20">
          <span className="text-xs font-medium text-slate-500">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      </div>

      {selected && <HistoryModal item={selected} type={type} onClose={() => setSelected(null)} />}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EarningReports = ({ defaultTab = 'driver' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'driver',  label: 'Driver Payment Reports',  icon: Users     },
    { id: 'company', label: 'Company Payment Reports', icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Earning Reports</h2>
        <p className="mt-1 text-slate-500 text-sm">Track driver and company payment history with commission breakdowns.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all"
              style={{ color: active ? '#00D6CC' : '#64748b' }}
            >
              <Icon size={16} />
              {tab.label}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                  style={{ backgroundColor: '#00D6CC' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'driver'  && <PaymentTable data={demoDriverReports}  type="driver"  />}
      {activeTab === 'company' && <PaymentTable data={demoCompanyReports} type="company" />}
    </div>
  );
};

export default EarningReports;
