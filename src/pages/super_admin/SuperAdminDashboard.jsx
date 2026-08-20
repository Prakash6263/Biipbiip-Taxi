import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import StatCard from '../../components/StatCard';

const SuperAdminDashboard = () => {
  const { state, currentUser, syncAllCompanies, syncAllCompanyCars } = useApp();

  useEffect(() => {
    if (currentUser && currentUser.token) {
      syncAllCompanies(currentUser.token);
      syncAllCompanyCars(currentUser.token);
    }
  }, [currentUser, syncAllCompanies, syncAllCompanyCars]);

  const pending  = state.companies.filter(c => c.status === 'pending');
  const verified = state.companies.filter(c => c.status === 'verified');

  // Demo driver stats
  const totalDrivers   = 124;
  const activeDrivers  = 87;
  const totalRides     = 1420;

  return (
    <div className="space-y-6">

      {/* ── First Row: 4 KPI Cards ──────────────────────────── */}
      <div className="row mb-3 g-4">
        <div className="col-xl-3 col-sm-6 col-12">
          <StatCard
            title="Total Companies"
            value={state.companies.length}
            subtitle="Registered on platform"
            colorVariant="purple"
            faIcon="fa-solid fa-building"
          />
        </div>
        <div className="col-xl-3 col-sm-6 col-12">
          <StatCard
            title="Pending Verification"
            value={pending.length}
            subtitle="Awaiting review"
            colorVariant="amber"
            faIcon="fa-solid fa-clock-rotate-left"
          />
        </div>
        <div className="col-xl-3 col-sm-6 col-12">
          <StatCard
            title="Verified Companies"
            value={verified.length}
            subtitle="Approved & active"
            colorVariant="green"
            faIcon="fa-solid fa-check-double"
          />
        </div>
        <div className="col-xl-3 col-sm-6 col-12">
          <StatCard
            title="Total Cars Listed"
            value={state.cars.length}
            subtitle="Available for rental"
            colorVariant="teal"
            faIcon="fa-solid fa-car"
          />
        </div>
      </div>

      {/* ── Second Row: 3 KPI Cards ─────────────────────────── */}
      <div className="row mb-3 g-4">
        <div className="col-xl-4 col-sm-6 col-12">
          <StatCard
            title="Total Drivers"
            value={totalDrivers}
            subtitle="Registered taxi drivers"
            colorVariant="blue"
            faIcon="fa-solid fa-users"
          />
        </div>
        <div className="col-xl-4 col-sm-6 col-12">
          <StatCard
            title="Total Rides"
            value={totalRides.toLocaleString()}
            subtitle="Completed trips to date"
            colorVariant="pink"
            faIcon="fa-solid fa-route"
          />
        </div>
        <div className="col-xl-4 col-sm-12 col-12">
          <StatCard
            title="Platform Revenue"
            value="₹9,04,250"
            subtitle="Total earnings collected"
            colorVariant="green"
            faIcon="fa-solid fa-sack-dollar"
          />
        </div>
      </div>

      {/* ── Recent Company Registrations Table ─────────────── */}
      <div className="card card-purple overflow-hidden rounded-3xl" style={{ backgroundImage: 'linear-gradient(to bottom, #dfecff70, #00b5ad96)', border: '1px solid #49e3dd' }}>
        <div className="card-header bg-transparent border-0 px-6 py-4 flex items-center justify-between">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="card-title mb-0 font-bold" style={{ color: '#031E3C', fontSize: '1.05rem' }}>
              Recent Company Registrations
            </h5>
            <span className="badge bg-warning text-dark font-bold uppercase tracking-wider text-[10px] px-2.5 py-1.5 rounded-pill">
              Pending Action
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase">#</th>
                  <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase">Company</th>
                  <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase">Owner</th>
                  <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase">Contact Info</th>
                  <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase">Status</th>
                  <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase">Registered On</th>
                </tr>
              </thead>
              <tbody>
                {state.companies.slice(0, 6).map((company, idx) => (
                  <tr key={company.id} className="align-middle">
                    <td className="px-4 py-3 text-slate-400 font-semibold text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#031E3C' }}
                        >
                          {company.companyName?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{company.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{company.ownerName}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-700 font-medium">{company.email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{company.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-[10px] font-bold capitalize"
                        style={
                          company.status === 'verified'
                            ? { color: '#ffffff', border: '1.5px solid rgba(255,255,255,0.7)', backgroundColor: 'rgba(16,185,129,0.55)' }
                            : company.status === 'pending'
                            ? { color: '#fff8e1', border: '1.5px solid rgba(255,235,59,0.6)', backgroundColor: 'rgba(245,158,11,0.5)' }
                            : { color: '#ffe0e0', border: '1.5px solid rgba(239,68,68,0.6)', backgroundColor: 'rgba(239,68,68,0.45)' }
                        }
                      >
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(company.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
