import { Building2, Car, CheckCircle2, Clock3 } from 'lucide-react';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';

const SuperAdminDashboard = ({ setActivePage }) => {
  const { state } = useApp();
  const pending = state.companies.filter((company) => company.status === 'pending');
  const verified = state.companies.filter((company) => company.status === 'verified');

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Company Verification Dashboard</h2>
          <p className="mt-2 text-slate-500">Admins ki company registration requests yahan review aur verify hoti hain.</p>
        </div>
        <button onClick={() => setActivePage('companies')} className="rounded-2xl bg-[#00D6CC] px-5 py-3 font-bold text-white hover:opacity-90 transition">
          Review Companies
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Companies" value={state.companies.length} icon={Building2} />
        <StatCard title="Pending Verification" value={pending.length} icon={Clock3} />
        <StatCard title="Verified Companies" value={verified.length} icon={CheckCircle2} />
        <StatCard title="Uploaded Cars" value={state.cars.length} icon={Car} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-950">Recent Company Registrations</h3>
          <Badge status="pending" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.companies.slice(0, 6).map((company) => (
                <tr key={company.id} className="hover:bg-slate-50">
                  <td className="px-3 py-4 font-semibold text-slate-950">{company.companyName}</td>
                  <td className="px-3 py-4 text-slate-600">{company.ownerName}</td>
                  <td className="px-3 py-4 text-slate-600">
                    <p>{company.email}</p>
                    <p className="text-xs text-slate-400">{company.phone}</p>
                  </td>
                  <td className="px-3 py-4"><Badge status={company.status} /></td>
                  <td className="px-3 py-4 text-slate-500">{formatDate(company.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SuperAdminDashboard;
