import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../../../context/AppContext';
import { getDriverRides } from '../../../../data/ridesData';
import { formatDate } from '../../../../utils/storage';
import {
  Search,
  User,
  Car,
  Phone,
  Mail,
  ArrowLeft,
  Compass,
  DollarSign,
  Calendar,
  MapPinOff,
  Navigation,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Badge from '../../../../components/Badge';
import EmptyState from '../../../../components/EmptyState';

const DriverRides = ({ selectedDriverId, setSelectedDriverId }) => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract only verified drivers (stored in verificationRequests)
  const drivers = useMemo(() => {
    return (state.verificationRequests || []).filter((d) => d.status === 'verified');
  }, [state.verificationRequests]);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filter drivers based on search input
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) =>
      d.userName.toLowerCase().includes(search.toLowerCase()) ||
      d.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      d.carName.toLowerCase().includes(search.toLowerCase()) ||
      d.registrationNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [drivers, search]);

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const paginatedDrivers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDrivers, currentPage, itemsPerPage]);

  // Compute stats (total rides and distance) for each driver
  const driverStatsMap = useMemo(() => {
    const statsMap = {};
    drivers.forEach((d) => {
      const driverRides = getDriverRides(d.id);
      const totalRides = driverRides.length;
      const totalKm = driverRides.reduce((sum, r) => sum + (r.km || 0), 0);
      statsMap[d.id] = { totalRides, totalKm };
    });
    return statsMap;
  }, [drivers]);

  // If selectedDriverId is set, get the corresponding driver
  const activeDriver = useMemo(() => {
    if (!selectedDriverId) return null;
    return drivers.find((d) => d.id === selectedDriverId) || null;
  }, [drivers, selectedDriverId]);

  // If a driver is active, get their rides
  const rides = useMemo(() => {
    if (!activeDriver) return [];
    return getDriverRides(activeDriver.id);
  }, [activeDriver]);

  // Compute total stats for the active driver
  const stats = useMemo(() => {
    if (!rides.length) return { totalRides: 0, totalKm: 0, totalRevenue: 0, totalTips: 0 };
    const totalRides = rides.length;
    const totalKm = rides.reduce((sum, r) => sum + (r.km || 0), 0);
    const totalFare = rides.reduce((sum, r) => sum + (r.price || 0), 0);
    const totalTips = rides.reduce((sum, r) => sum + (r.tip || 0), 0);
    const totalRevenue = totalFare + totalTips;
    return { totalRides, totalKm, totalRevenue, totalTips };
  }, [rides]);

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
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-blue-200 text-blue-700">
            Ongoing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-rose-200 text-rose-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-slate-200 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // 1. List View: Table showing all drivers
  if (!activeDriver) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between page-header mb-0">
          <div>
            <p className="breadcrumb-label">MANAGEMENT</p>
            <h2>Driver Rides</h2>
            <p>View all rides completed by verified drivers on the platform.</p>
          </div>
          <div className="relative w-full max-w-xs sm:self-center">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
            />
          </div>
        </div>

        {!drivers.length ? (
          <EmptyState title="No drivers available" message="There are no drivers registered in the system." />
        ) : filteredDrivers.length ? (
          <>
            <div className="card card-table p-2">
            <div className="card-body table-responsive">
              <table className="table table-bordered table-striped mb-0">
                <thead>
                  <tr>
                    <th className="font-bold">Driver Name</th>
                    <th className="font-bold">Email</th>
                    <th className="font-bold">Phone</th>
                    <th className="font-bold">Car Name</th>
                    <th className="font-bold">Reg No</th>
                    <th className="font-bold">Total Rides</th>
                    <th className="font-bold">Total Distance</th>
                    <th className="font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDrivers.map((d) => {
                    const stats = driverStatsMap[d.id] || { totalRides: 0, totalKm: 0 };
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDriverId(d.id)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer font-medium"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
                              <User size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-950">{d.userName}</div>
                              <div className="text-xs text-slate-400 mt-0.5">ID: {d.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-slate-600 text-xs">{d.userEmail}</td>
                        <td className="text-slate-600 text-xs">{d.userPhone}</td>
                        <td className="text-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <Car size={14} className="text-slate-400" />
                            <span>{d.carName}</span>
                          </div>
                        </td>
                        <td className="text-slate-600 text-xs font-mono">{d.registrationNo}</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-[#00D6CC]/10 px-3 py-1.5 text-xs font-bold text-[#00D6CC]">
                            {stats.totalRides} Rides
                          </span>
                        </td>
                        <td className="text-sm font-bold text-slate-800">
                          {stats.totalKm} <span className="text-xs font-semibold text-slate-400">km</span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDriverId(d.id);
                            }}
                            className="rounded-xl bg-[#00D6CC] text-white hover:opacity-90 px-4 py-2 text-xs font-bold transition shadow-sm"
                          >
                            View Rides
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Pagination Footer */}
          {filteredDrivers.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500 mt-2 rounded-b-3xl">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDrivers.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredDrivers.length)} of {filteredDrivers.length} entries
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
          </>
        ) : (
          <EmptyState title="No drivers found" message="No drivers match the search criteria." />
        )}
      </div>
    );
  }

  // 2. Details View: Ride details for the selected driver
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => setSelectedDriverId(null)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Drivers</span>
          </button>
        </div>
      </div>

      {/* Active Driver Card Details */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#00D6CC]/10 p-4 text-[#00D6CC]">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-950">{activeDriver.userName}</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Driver ID: {activeDriver.id}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" />
                  {activeDriver.userEmail}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-slate-400" />
                  {activeDriver.userPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shrink-0 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
              <Car size={20} />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm leading-tight">{activeDriver.carName}</div>
              <div className="font-mono text-xs text-slate-400 mt-1">{activeDriver.registrationNo}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="rounded-2xl bg-[#00D6CC]/10 p-3.5 text-[#00D6CC] shrink-0">
            <Compass size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rides</p>
            <h4 className="text-2xl font-bold text-slate-950 mt-1">{stats.totalRides}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="rounded-2xl bg-indigo-50 p-3.5 text-indigo-500 shrink-0">
            <Navigation size={24} className="rotate-45" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Distance</p>
            <h4 className="text-2xl font-bold text-slate-950 mt-1">{stats.totalKm} km</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-50 p-3.5 text-emerald-500 shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h4 className="text-2xl font-bold text-slate-950 mt-1">₹{stats.totalRevenue.toLocaleString()}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Incl. ₹{stats.totalTips.toLocaleString()} tips</p>
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-950 text-base">Ride History</h3>
        </div>        {rides.length ? (
          <div className="card card-table p-2">
            <div className="card-body table-responsive">
              <table className="table table-bordered table-striped mb-0">
                <thead>
                  <tr>
                    <th className="font-bold">Ride ID</th>
                    <th className="font-bold">Date</th>
                    <th className="font-bold">Customer Name</th>
                    <th className="font-bold">Phone</th>
                    <th className="font-bold">Pickup</th>
                    <th className="font-bold">Drop Point</th>
                    <th className="font-bold">Distance</th>
                    <th className="font-bold">Fare</th>
                    <th className="font-bold">Tip</th>
                    <th className="font-bold">Total Price</th>
                    <th className="font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="font-semibold text-slate-900 text-xs">{ride.id.toUpperCase()}</td>
                      <td className="text-slate-600 text-xs">{formatDate(ride.date)}</td>
                      <td className="font-bold text-slate-900 text-sm">{ride.customerName}</td>
                      <td className="text-slate-600 text-xs">{ride.customerPhone}</td>
                      <td className="text-xs font-semibold text-slate-800">{ride.pickup}</td>
                      <td className="text-xs font-semibold text-slate-800">{ride.drop}</td>
                      <td className="font-bold text-slate-950 text-xs">{ride.km} km</td>
                      <td className="font-bold text-slate-950 text-xs">₹{ride.price}</td>
                      <td className="font-bold text-slate-600 text-xs">{ride.tip > 0 ? `₹${ride.tip}` : '—'}</td>
                      <td className="font-bold text-[#00D6CC] text-sm">₹{ride.price + ride.tip}</td>
                      <td>{getStatusBadge(ride.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <MapPinOff size={40} className="text-slate-300 mb-2" />
            <div className="font-bold text-sm">No rides found</div>
            <div className="text-xs mt-1">This driver hasn't completed any rides yet.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRides;
