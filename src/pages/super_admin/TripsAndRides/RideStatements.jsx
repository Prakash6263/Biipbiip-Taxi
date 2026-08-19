import { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { getDriverRides } from '../../../data/ridesData';
import { formatDate, currency } from '../../../utils/storage';
import {
  Calendar,
  Car,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Filter
} from 'lucide-react';

const RideStatements = ({ mode = 'overall' }) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Retrieve all verified drivers
  const drivers = useMemo(() => {
    return (state.verificationRequests || []).filter(d => d.status === 'verified');
  }, [state.verificationRequests]);

  // Aggregate all rides across verified drivers
  const allRides = useMemo(() => {
    const ridesList = [];
    drivers.forEach(driver => {
      const driverRides = getDriverRides(driver.id);
      driverRides.forEach(ride => {
        ridesList.push({
          ...ride,
          driverName: driver.userName,
          driverPhone: driver.userPhone,
          carName: driver.carName,
          registrationNo: driver.registrationNo,
          commission: Math.round(ride.price * 0.1) // 10% commission
        });
      });
    });
    // Sort by date descending
    return ridesList.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [drivers]);

  // Apply filters depending on the mode
  const filteredRides = useMemo(() => {
    return allRides.filter(ride => {
      // Driver filter
      if (selectedDriver !== 'all' && ride.driverName !== selectedDriver) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && ride.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      // Search term filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          ride.id.toLowerCase().includes(query) ||
          ride.customerName.toLowerCase().includes(query) ||
          ride.driverName.toLowerCase().includes(query) ||
          ride.pickup.toLowerCase().includes(query) ||
          ride.drop.toLowerCase().includes(query) ||
          ride.carName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [allRides, selectedDriver, selectedStatus, searchTerm]);

  // Grouped statement calculation for Daily, Monthly, and Yearly views
  const groupedData = useMemo(() => {
    const groups = {};

    filteredRides.forEach(ride => {
      const rideDate = new Date(ride.date);
      let key = '';

      if (mode === 'daily') {
        key = rideDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      } else if (mode === 'monthly') {
        key = rideDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      } else if (mode === 'yearly') {
        key = rideDate.getFullYear().toString();
      }

      if (!key) return;

      if (!groups[key]) {
        groups[key] = {
          label: key,
          rideCount: 0,
          totalKm: 0,
          totalFare: 0,
          totalTips: 0,
          totalCommission: 0,
          rides: []
        };
      }

      groups[key].rideCount += 1;
      groups[key].totalKm += ride.km;
      groups[key].totalFare += ride.price;
      groups[key].totalTips += ride.tip;
      groups[key].totalCommission += ride.commission;
      groups[key].rides.push(ride);
    });

    return Object.values(groups);
  }, [filteredRides, mode]);

  // Overall KPI Stats
  const stats = useMemo(() => {
    const totalRides = filteredRides.length;
    const totalKm = filteredRides.reduce((sum, r) => sum + r.km, 0);
    const totalFare = filteredRides.reduce((sum, r) => sum + r.price, 0);
    const totalTips = filteredRides.reduce((sum, r) => sum + r.tip, 0);
    const totalCommission = filteredRides.reduce((sum, r) => sum + r.commission, 0);
    const totalRevenue = totalFare + totalTips;

    return { totalRides, totalKm, totalRevenue, totalCommission };
  }, [filteredRides]);

  // Pagination for lists
  const dataList = mode === 'overall' ? filteredRides : groupedData;
  const totalPages = Math.ceil(dataList.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return dataList.slice(startIndex, startIndex + itemsPerPage);
  }, [dataList, currentPage, itemsPerPage]);

  const getStatusBadge = (status) => {
    switch (String(status).toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-emerald-200 text-emerald-700">
            Completed
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-amber-200 text-amber-700">
            Ongoing
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-rose-200 text-rose-700">
            Cancelled
          </span>
        );
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'daily':
        return 'Daily Ride Statement';
      case 'monthly':
        return 'Monthly Ride Statement';
      case 'yearly':
        return 'Yearly Ride Statement';
      default:
        return 'Overall Ride Statement';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#031E3C]">{getModeTitle()}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track passenger trip statements, revenues, and commissions earned across the platform.
          </p>
        </div>
      </div>

      {/* ── Summary KPI Cards ───────────────────────────────── */}
      <div className="row g-4 text-left">
        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card h-100 shadow-sm" style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}>
            <div className="card-body p-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <Car size={22} color="#fff" />
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Total Rides Listed
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      {stats.totalRides}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card h-100 shadow-sm" style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}>
            <div className="card-body p-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <TrendingUp size={22} color="#fff" />
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Total Kilometers (KM)
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      {stats.totalKm} km
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card h-100 shadow-sm" style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}>
            <div className="card-body p-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">₹</span>
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Total Fare Revenue
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      {currency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card h-100 shadow-sm" style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}>
            <div className="card-body p-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">%</span>
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Total Comm. Earned (10%)
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      {currency(stats.totalCommission)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters Card ─────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 text-left">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Ride ID, customer, driver, route or car..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00D6CC]/20 focus:border-[#00D6CC] text-sm text-slate-700 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedDriver}
              onChange={(e) => { setSelectedDriver(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00D6CC]/20 transition"
            >
              <option value="all">All Drivers</option>
              {[...new Set(allRides.map(r => r.driverName))].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00D6CC]/20 transition"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table Card ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
        <div className="table-responsive">
          <table className="table table-striped mb-0 align-middle">
            {mode === 'overall' ? (
              // ── Overall Statement Table Headers ──
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ride Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver / Vehicle</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trip Route</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fare / Tip</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Commission</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
            ) : (
              // ── Grouped Statement Table Headers (Daily, Monthly, Yearly) ──
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Period / Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Trips</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Distance</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Fare</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tips</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Commission Earned</th>
                </tr>
              </thead>
            )}

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'overall' ? 7 : 6} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No matching trip statements found. Try adjusting your filters.
                  </td>
                </tr>
              ) : mode === 'overall' ? (
                // ── Overall Statement Table Body ──
                paginatedData.map((ride) => (
                  <tr key={ride.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm block">{ride.id.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{formatDate(ride.date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm">{ride.customerName}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{ride.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm">{ride.driverName}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-medium">{ride.carName} • <span className="font-bold text-slate-800">{ride.registrationNo}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[220px]">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <MapPin size={11} className="text-[#00D6CC] shrink-0" />
                          <span className="truncate">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mt-1">
                          <MapPin size={11} className="text-rose-500 shrink-0" />
                          <span className="truncate">{ride.drop}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm block">{currency(ride.price)}</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Tip: {currency(ride.tip)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-extrabold text-[#00D6CC] text-sm">{currency(ride.commission)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(ride.status)}
                    </td>
                  </tr>
                ))
              ) : (
                // ── Grouped Statement Table Body (Daily, Monthly, Yearly) ──
                paginatedData.map((group, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-900 text-sm">{group.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-800 text-sm">{group.rideCount} rides</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-600 text-sm">{group.totalKm} km</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm">{currency(group.totalFare)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-600 text-sm">{currency(group.totalTips)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-extrabold text-[#00D6CC] text-sm">{currency(group.totalCommission)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination controls ────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs text-slate-500 font-semibold">
              Showing page <span className="text-slate-800 font-bold">{currentPage}</span> of <span className="text-slate-800 font-bold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideStatements;
