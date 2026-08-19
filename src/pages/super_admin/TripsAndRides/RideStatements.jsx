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
  Filter,
  FileText,
  X,
  ClipboardList,
  CheckCircle,
  XCircle,
  IndianRupee
} from 'lucide-react';

const RideStatements = ({ mode = 'overall' }) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Retrieve all verified drivers
  const drivers = useMemo(() => {
    return (state.verificationRequests || []).filter(d => d.status === 'verified');
  }, [state.verificationRequests]);

  // Aggregate all rides across verified drivers
  const allRides = useMemo(() => {
    const ridesList = [];
    drivers.forEach(driver => {
      const driverRides = getDriverRides(driver.id);
      driverRides.forEach((ride, i) => {
        const numericId = 2400 + (driver.id.charCodeAt(driver.id.length - 1) * 3) + i;
        ridesList.push({
          ...ride,
          displayId: String(numericId),
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
          ride.displayId.includes(query) ||
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
        key = rideDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } else if (mode === 'monthly') {
        key = rideDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

  // Overall KPI Stats based on all rides
  const stats = useMemo(() => {
    const totalRides = filteredRides.length;
    const cancelledRides = filteredRides.filter(r => r.status === 'Cancelled').length;
    const completedRides = filteredRides.filter(r => r.status === 'Completed').length;
    
    // Sum price of completed rides
    const totalFare = filteredRides.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.price, 0);
    const totalTips = filteredRides.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.tip, 0);
    const totalRevenue = totalFare + totalTips;
    const totalCommission = filteredRides.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.commission, 0);

    return { totalRides, cancelledRides, completedRides, totalRevenue, totalCommission };
  }, [filteredRides]);

  // Pagination for lists
  const dataList = mode === 'overall' ? filteredRides : groupedData;
  const totalPages = Math.ceil(dataList.length / entriesPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return dataList.slice(startIndex, startIndex + entriesPerPage);
  }, [dataList, currentPage, entriesPerPage]);

  const formatRideDate = (dateString) => {
    const d = new Date(dateString);
    const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { dateStr, timeStr };
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
    <div className="space-y-6 text-left">
      
      {/* ── Statement History Banner Styled to Match Header Theme ──────────────── */}
      <div 
        className="text-white px-6 py-4 rounded-2xl flex items-center gap-3 border shadow-sm" 
        style={{ backgroundColor: '#002E5B', borderColor: '#00D6CC' }}
      >
        <ClipboardList size={20} className="text-[#00D6CC]" />
        <span className="font-bold text-sm tracking-wider uppercase">Statement History</span>
      </div>

      {/* ── Four Stat Cards Styled in Site White-to-Teal Gradient ───────────────── */}
      <div className="row g-4 mt-1">
        <div className="col-xl-3 col-sm-6 col-12">
          <div 
            className="card h-100 shadow-sm overflow-hidden" 
            style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}
          >
            <div className="card-body p-4 pb-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <Car size={22} color="#fff" />
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Total No Of Ride
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      {stats.totalRides}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20">
              More Info <ChevronRight size={10} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6 col-12">
          <div 
            className="card h-100 shadow-sm overflow-hidden" 
            style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}
          >
            <div className="card-body p-4 pb-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <XCircle size={22} color="#fff" />
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Cancelled Ride
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      {stats.cancelledRides}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20">
              More Info <ChevronRight size={10} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6 col-12">
          <div 
            className="card h-100 shadow-sm overflow-hidden" 
            style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}
          >
            <div className="card-body p-4 pb-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <CheckCircle size={22} color="#fff" />
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Completed Ride
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      {stats.completedRides}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20">
              More Info <ChevronRight size={10} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6 col-12">
          <div 
            className="card h-100 shadow-sm overflow-hidden" 
            style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}
          >
            <div className="card-body p-4 pb-4">
              <div className="dash-widget-header">
                <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
                  <IndianRupee size={22} color="#fff" />
                </span>
                <div className="dash-count">
                  <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                    Revenue From {stats.completedRides} Rides
                  </div>
                  <div className="dash-counts">
                    <p className="text-slate-950 font-bold mb-0 text-2xl">
                      ₹ : {stats.totalRevenue.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20">
              More Info <ChevronRight size={10} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Area Title ────────────────────────────────── */}
      <div className="pt-4">
        <h3 className="text-lg font-bold text-[#031E3C]">{getModeTitle()}</h3>
      </div>

      {/* ── Search and Filter Controls Styled in Site Theme ── */}
      <div 
        className="card rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Search:</span>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="border border-slate-300 bg-white px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00D6CC]/20 focus:border-[#00D6CC] transition w-56 text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-slate-300 bg-white px-2 py-1 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00D6CC]/20 text-slate-800 font-semibold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs font-semibold text-slate-700">entries</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDriver}
              onChange={(e) => { setSelectedDriver(e.target.value); setCurrentPage(1); }}
              className="border border-slate-300 bg-white px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Drivers</option>
              {[...new Set(allRides.map(r => r.driverName))].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="border border-slate-300 bg-white px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table Card Styled in Site Theme with Gradient Backdrop ── */}
      <div 
        className="card rounded-2xl shadow-sm overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}
      >
        <div className="table-responsive">
          <table className="table table-striped mb-0 align-middle" style={{ backgroundColor: 'transparent' }}>
            {mode === 'overall' ? (
              // ── Overall Statement Table Headers ──
              <thead>
                <tr className="border-b border-[#49e3dd]/30 bg-[#002E5B]/5">
                  <th className="px-4 py-3 text-xs font-bold text-[#031E3C] tracking-wider w-20">Ride ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-[#031E3C] tracking-wider">Picked Up</th>
                  <th className="px-4 py-3 text-xs font-bold text-[#031E3C] tracking-wider">Dropped</th>
                  <th className="px-4 py-3 text-xs font-bold text-[#031E3C] tracking-wider w-40">Date On</th>
                  <th className="px-4 py-3 text-xs font-bold text-[#031E3C] tracking-wider w-28">Total Amount</th>
                  <th className="px-4 py-3 text-xs font-bold text-[#031E3C] tracking-wider text-center w-28">Status</th>
                </tr>
              </thead>
            ) : (
              // ── Grouped Statement Table Headers (Daily, Monthly, Yearly) ──
              <thead>
                <tr className="border-b border-[#49e3dd]/30 bg-[#002E5B]/5">
                  <th className="px-6 py-4 text-xs font-bold text-[#031E3C] tracking-wider">Period / Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#031E3C] tracking-wider text-center">Total Trips</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#031E3C] tracking-wider text-center">Total Distance</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#031E3C] tracking-wider">Total Fare</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#031E3C] tracking-wider">Total Tips</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#031E3C] tracking-wider text-right">Commission Earned</th>
                </tr>
              </thead>
            )}

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'overall' ? 6 : 6} className="px-6 py-12 text-center text-slate-500 font-bold">
                    No matching trip statements found. Try adjusting your filters.
                  </td>
                </tr>
              ) : mode === 'overall' ? (
                // ── Overall Statement Table Body ──
                paginatedData.map((ride) => {
                  const { dateStr, timeStr } = formatRideDate(ride.date);
                  return (
                    <tr key={ride.id} className="border-b border-[#49e3dd]/20 hover:bg-[#00D6CC]/5 transition">
                      <td className="px-4 py-3 font-bold text-[#031E3C] text-xs">
                        {ride.displayId}
                      </td>
                      <td className="px-4 py-3 text-[#031E3C] font-semibold text-xs leading-relaxed max-w-[280px]">
                        {ride.pickup}
                      </td>
                      <td className="px-4 py-3 text-[#031E3C] font-semibold text-xs leading-relaxed max-w-[280px]">
                        {ride.drop}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#031E3C] text-xs block font-bold">{dateStr}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-bold">{timeStr}</span>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-[#031E3C] text-xs">
                        {ride.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded px-2.5 py-1 text-[10px] font-bold text-white uppercase ${
                            ride.status === 'Completed' ? 'bg-[#00B5AD]' : 'bg-[#E63946]'
                          }`}
                        >
                          {ride.status}
                        </span>
                        <button
                          onClick={() => setSelectedInvoice(ride)}
                          className="block mx-auto mt-1 text-[11px] font-bold text-[#002E5B] hover:text-[#00D6CC] underline focus:outline-none"
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // ── Grouped Statement Table Body (Daily, Monthly, Yearly) ──
                paginatedData.map((group, idx) => (
                  <tr key={idx} className="border-b border-[#49e3dd]/20 hover:bg-[#00D6CC]/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#031E3C]" />
                        <span className="font-extrabold text-[#031E3C] text-sm">{group.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-[#031E3C] text-sm">{group.rideCount} rides</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-600 text-sm">{group.totalKm} km</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-[#031E3C] text-sm">{currency(group.totalFare)}</span>
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

        {/* ── Pagination controls ── */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#49e3dd]/20 flex items-center justify-between bg-[#002E5B]/5">
            <span className="text-xs text-slate-700 font-bold">
              Showing page <span className="text-[#031E3C] font-extrabold">{currentPage}</span> of <span className="text-[#031E3C] font-extrabold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Premium Invoice Modal Popup ────────────────────── */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#002E5B' }}>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#00D6CC]" />
                <span className="font-bold text-sm tracking-wider uppercase">Trip Invoice #{selectedInvoice.displayId}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-left">
              {/* Top Details Grid */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date & Time</span>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">{formatDate(selectedInvoice.date)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ride Status</span>
                  <p className="mt-0.5">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold text-white uppercase ${
                      selectedInvoice.status === 'Completed' ? 'bg-[#00B5AD]' : 'bg-[#E63946]'
                    }`}>
                      {selectedInvoice.status}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Customer Name</span>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">{selectedInvoice.customerName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedInvoice.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Driver / Car</span>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">{selectedInvoice.driverName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{selectedInvoice.carName} • {selectedInvoice.registrationNo}</p>
                </div>
              </div>

              {/* Trip Route Addresses */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00D6CC] mt-1 shrink-0" />
                    <div className="w-0.5 h-6 bg-slate-300" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#00D6CC] font-bold uppercase tracking-wider">Pickup Location</span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{selectedInvoice.pickup}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                  <div>
                    <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Drop Location</span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{selectedInvoice.drop}</p>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Distance Traveled</span>
                  <span className="text-slate-800 font-bold">{selectedInvoice.km} km</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Base Trip Fare</span>
                  <span className="text-slate-800 font-bold">{currency(selectedInvoice.price - selectedInvoice.tip)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Driver Tips</span>
                  <span className="text-slate-800 font-bold">{currency(selectedInvoice.tip)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Admin Commission (10%)</span>
                  <span className="text-[#00D6CC] font-bold">{currency(selectedInvoice.commission)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-800 font-bold text-sm">Total Amount Paid</span>
                  <span className="text-slate-950 font-extrabold text-lg">{currency(selectedInvoice.price)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-sm"
                style={{ backgroundColor: '#002E5B' }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideStatements;
