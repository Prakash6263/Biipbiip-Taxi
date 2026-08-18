import { Building2, Car, CheckCircle2, Clock3, Users, TrendingUp, DollarSign } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';

const SuperAdminDashboard = () => {
  const { state } = useApp();
  const pending  = state.companies.filter(c => c.status === 'pending');
  const verified = state.companies.filter(c => c.status === 'verified');

  // Demo driver stats
  const totalDrivers   = 124;
  const activeDrivers  = 87;
  const totalRides     = 1_420;

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <p className="breadcrumb-label">Overview</p>
        <h2>Super Admin Dashboard</h2>
        <p>Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={state.companies.length}
          icon={Building2}
          hint="Registered on platform"
          colorIndex={0}
        />
        <StatCard
          title="Pending Verification"
          value={pending.length}
          icon={Clock3}
          hint="Awaiting review"
          colorIndex={2}
        />
        <StatCard
          title="Verified Companies"
          value={verified.length}
          icon={CheckCircle2}
          hint="Approved & active"
          colorIndex={3}
        />
        <StatCard
          title="Total Cars Listed"
          value={state.cars.length}
          icon={Car}
          hint="Across all companies"
          colorIndex={1}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Drivers"
          value={totalDrivers}
          icon={Users}
          hint={`${activeDrivers} currently active`}
          colorIndex={4}
        />
        <StatCard
          title="Total Rides"
          value={totalRides.toLocaleString()}
          icon={TrendingUp}
          hint="All time"
          colorIndex={1}
        />
        <StatCard
          title="Platform Revenue"
          value="₹9,04,250"
          icon={DollarSign}
          hint="This month"
          colorIndex={3}
        />
      </div>

      {/* ── Recent Company Registrations ─────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Company Registrations</h3>
          <span className="badge badge-pending">Pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Owner</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {state.companies.slice(0, 6).map((company, idx) => (
                <tr key={company.id}>
                  <td className="text-slate-400 font-semibold text-xs">{idx + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#031E3C' }}
                      >
                        {company.companyName?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="text-slate-600">{company.ownerName}</td>
                  <td>
                    <p className="text-slate-700">{company.email}</p>
                    <p className="text-xs text-slate-400">{company.phone}</p>
                  </td>
                  <td>
                    <span className={`badge badge-${company.status}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="text-slate-500 text-xs">{formatDate(company.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
