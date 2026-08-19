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
  XCircle,
  CheckCircle,
  IndianRupee,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';

const RideStatements = ({ mode = 'overall' }) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Custom navigation state for detail view when clicking cards
  const [viewMode, setViewMode] = useState('list'); 
  const [cardStatusFilter, setCardStatusFilter] = useState('all');

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
    return ridesList;
  }, [drivers]);

  // Timeframe filtered rides based on the mode (Overall, Daily, Monthly, Yearly)
  const timeframeRides = useMemo(() => {
    const todayRef = new Date('2026-08-19');
    
    return allRides.filter(ride => {
      const rideDate = new Date(ride.date);
      
      if (mode === 'daily') {
        return (
          rideDate.getDate() === todayRef.getDate() &&
          rideDate.getMonth() === todayRef.getMonth() &&
          rideDate.getFullYear() === todayRef.getFullYear()
        );
      }
      
      if (mode === 'monthly') {
        return (
          rideDate.getMonth() === todayRef.getMonth() &&
          rideDate.getFullYear() === todayRef.getFullYear()
        );
      }
      
      if (mode === 'yearly') {
        return rideDate.getFullYear() === todayRef.getFullYear();
      }
      
      return true; // overall shows all
    });
  }, [allRides, mode]);

  // Apply filters (Driver, Status, Search) to the timeframe rides
  const filteredRides = useMemo(() => {
    return timeframeRides.filter(ride => {
      // Driver filter
      if (selectedDriver !== 'all' && ride.driverName !== selectedDriver) {
        return false;
      }
      // Status filter (controlled by card click in detail view, or dropdown in standard view)
      const currentStatusFilter = viewMode === 'detail-list' ? cardStatusFilter : selectedStatus;
      if (currentStatusFilter !== 'all' && ride.status.toLowerCase() !== currentStatusFilter.toLowerCase()) {
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
  }, [timeframeRides, selectedDriver, selectedStatus, cardStatusFilter, viewMode, searchTerm]);

  // Overall KPI Stats based on the timeframe rides
  const stats = useMemo(() => {
    const totalRides = timeframeRides.length;
    const cancelledRides = timeframeRides.filter(r => r.status === 'Cancelled').length;
    const completedRides = timeframeRides.filter(r => r.status === 'Completed').length;
    
    // Sum price of completed rides
    const totalFare = timeframeRides.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.price, 0);
    const totalTips = timeframeRides.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.tip, 0);
    const totalRevenue = totalFare + totalTips;
    const totalCommission = timeframeRides.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.commission, 0);

    return { totalRides, cancelledRides, completedRides, totalRevenue, totalCommission };
  }, [timeframeRides]);

  // Pagination for lists
  const totalPages = Math.ceil(filteredRides.length / entriesPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredRides.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredRides, currentPage, entriesPerPage]);

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

  // Handles card "MORE INFO" action
  const handleCardClick = (statusFilter) => {
    setCardStatusFilter(statusFilter);
    setViewMode('detail-list');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* ── Page Header (Standard Layout Header block) ──────────────────────── */}
      <div className="page-header">
        <p className="breadcrumb-label">TRIPS / RIDES</p>
        <h2>{getModeTitle()}</h2>
        <p>Track passenger trip statements, revenues, and platform commission records.</p>
      </div>

      {/* ── Statement History Banner (Shown ONLY on main overview page view) ── */}
      {viewMode === 'list' && (
        <div className="bg-[#0b132b] text-white px-6 py-4 rounded-xl flex items-center gap-3">
          <ClipboardList size={20} className="text-[#00D6CC]" />
          <span className="font-bold text-sm tracking-wider uppercase">Statement History</span>
        </div>
      )}

      {/* ── Four Colored KPI Cards Styled in Site White-to-Teal Gradient (Shown ONLY on main overview page view) ── */}
      {viewMode === 'list' && (
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
              <button 
                onClick={() => handleCardClick('all')}
                className="w-full border-0 bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20"
              >
                More Info <ChevronRight size={10} />
              </button>
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
              <button 
                onClick={() => handleCardClick('cancelled')}
                className="w-full border-0 bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20"
              >
                More Info <ChevronRight size={10} />
              </button>
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
              <button 
                onClick={() => handleCardClick('completed')}
                className="w-full border-0 bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20"
              >
                More Info <ChevronRight size={10} />
              </button>
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
              <button 
                onClick={() => handleCardClick('completed')}
                className="w-full border-0 bg-[#002E5B] text-[#00D6CC] text-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1 border-t border-[#00D6CC]/20"
              >
                More Info <ChevronRight size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Heading and Back navigation button ──────────────── */}
      <div className="pt-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#031E3C]">History Booking</h3>
        
        {viewMode === 'detail-list' && (
          <button
            onClick={() => { setViewMode('list'); setCardStatusFilter('all'); }}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#002E5B', borderColor: '#00D6CC' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
      </div>

      {/* ── Table Card (Standard clean white page table layout) ── */}
      <div className="card card-table p-2">
        
        {/* Toolbar Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {viewMode === 'detail-list' ? 'Display History Booking' : `Display ${getModeTitle()}`}
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input Box */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Search:</span>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-2xl border border-[#e2e8f0] bg-white py-1.5 pl-9 pr-4 text-xs outline-none transition focus:border-[#00D6CC]"
                />
              </div>
            </div>

            {/* Entries Size Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-[#e2e8f0] px-2 py-1 rounded-lg focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={selectedDriver}
                onChange={(e) => { setSelectedDriver(e.target.value); setCurrentPage(1); }}
                className="border border-[#e2e8f0] px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 focus:outline-none bg-white"
              >
                <option value="all">All Drivers</option>
                {[...new Set(timeframeRides.map(r => r.driverName))].map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              {/* Hide status filter dropdown when we are in card-clicked detail list view */}
              {viewMode === 'list' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                  className="border border-[#e2e8f0] px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 focus:outline-none bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Card Body and Table wrapper */}
        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped mb-0 text-left">
            <thead>
              <tr>
                <th className="font-bold text-slate-400 w-20">Ride ID</th>
                <th className="font-bold text-slate-400">Picked Up</th>
                <th className="font-bold text-slate-400">Dropped</th>
                <th className="font-bold text-slate-400 w-40">Date On</th>
                <th className="font-bold text-slate-400 w-28">Total Amount</th>
                <th className="font-bold text-slate-400 text-center w-28">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No matching trip statements found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((ride) => {
                  const { dateStr, timeStr } = formatRideDate(ride.date);
                  return (
                    <tr key={ride.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="font-semibold text-slate-500 text-xs">
                        {ride.displayId}
                      </td>
                      <td className="text-slate-700 text-xs leading-relaxed max-w-[280px]">
                        {ride.pickup}
                      </td>
                      <td className="text-slate-700 text-xs leading-relaxed max-w-[280px]">
                        {ride.drop}
                      </td>
                      <td className="text-slate-600 text-xs">
                        <span className="font-medium block">{dateStr}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{timeStr}</span>
                      </td>
                      <td className="font-bold text-slate-900 text-xs">
                        ₹ {ride.price.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase ${
                            ride.status === 'Completed' ? 'bg-[#00B5AD]' : 'bg-[#E63946]'
                          }`}
                        >
                          {ride.status}
                        </span>
                        <button
                          onClick={() => setSelectedInvoice(ride)}
                          className="block mx-auto mt-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 underline focus:outline-none"
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/30">
            <span className="text-xs text-slate-400 font-semibold">
              Showing page <span className="text-slate-800 font-bold">{currentPage}</span> of <span className="text-slate-800 font-bold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
              >
                <ChevronRight size={14} />
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
