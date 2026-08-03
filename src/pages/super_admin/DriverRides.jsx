import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getDriverRides } from '../../data/ridesData';
import { formatDate } from '../../utils/storage';
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
  Navigation
} from 'lucide-react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';

const DriverRides = ({ selectedDriverId, setSelectedDriverId }) => {
  const { state } = useApp();
  const [search, setSearch] = useState('');

  // Extract all drivers (stored in verificationRequests)
  const drivers = useMemo(() => {
    return state.verificationRequests || [];
  }, [state.verificationRequests]);

  // Filter drivers based on search input
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => 
      d.userName.toLowerCase().includes(search.toLowerCase()) ||
      d.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      d.carName.toLowerCase().includes(search.toLowerCase()) ||
      d.registrationNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [drivers, search]);

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Driver Rides</h2>
          </div>

          <div className="relative w-full max-w-xs sm:mt-8">
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
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">Driver Name</th>
                    <th scope="col" className="px-6 py-4 font-bold">Contact Info</th>
                    <th scope="col" className="px-6 py-4 font-bold">Car Details</th>
                    <th scope="col" className="px-6 py-4 font-bold">Status</th>
                    <th scope="col" className="px-6 py-4 font-bold">Registered</th>
                    <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDrivers.map((d) => (
                    <tr 
                      key={d.id} 
                      onClick={() => setSelectedDriverId(d.id)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer font-medium"
                    >
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={13} className="text-slate-400" />
                            <span>{d.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={13} className="text-slate-400" />
                            <span>{d.userPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                            <Car size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{d.carName}</p>
                            <p className="font-mono text-xs text-slate-400 mt-0.5">{d.registrationNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={d.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(d.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Rides: {activeDriver.userName}</h2>
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
        </div>

        {rides.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Ride Details</th>
                  <th scope="col" className="px-6 py-4 font-bold">Customer</th>
                  <th scope="col" className="px-6 py-4 font-bold">Route</th>
                  <th scope="col" className="px-6 py-4 font-bold">Distance</th>
                  <th scope="col" className="px-6 py-4 font-bold">Fare</th>
                  <th scope="col" className="px-6 py-4 font-bold">Tip</th>
                  <th scope="col" className="px-6 py-4 font-bold">Total Price</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 text-xs">{ride.id.toUpperCase()}</div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                          <Calendar size={12} />
                          <span>{formatDate(ride.date)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">{ride.customerName}</div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <Phone size={11} />
                          <span>{ride.customerPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" title="Pickup" />
                          <span className="text-xs font-semibold text-slate-800 truncate">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" title="Drop point" />
                          <span className="text-xs font-semibold text-slate-800 truncate">{ride.drop}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-950">
                      {ride.km} km
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-950">
                      ₹{ride.price}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">
                      {ride.tip > 0 ? `₹${ride.tip}` : '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#00D6CC] text-base">
                      ₹{ride.price + ride.tip}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ride.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
