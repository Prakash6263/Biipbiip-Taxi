import { Car, ClipboardCheck, Clock3, IndianRupee } from 'lucide-react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';
import { useApp } from '../../context/AppContext';
import { currency, formatDate } from '../../utils/storage';

const AdminDashboard = ({ setActivePage }) => {
  const { state, currentUser } = useApp();
  const company = state.companies.find((item) => item.id === currentUser?.companyId);
  const cars = state.cars.filter((car) => car.companyId === company?.id);
  const requests = state.rentalRequests.filter((request) => request.companyId === company?.id);
  const activeRequests = requests.filter((request) => request.status === 'active');
  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const totalRevenue = activeRequests.reduce((sum, request) => {
    const car = state.cars.find((item) => item.id === request.carId);
    const days = Math.max(1, Math.ceil((new Date(request.returnDate) - new Date(request.pickupDate)) / 86400000));
    return sum + Number(car?.pricePerDay || 0) * days;
  }, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Admin</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Welcome, {currentUser?.name}</h2>
          <p className="mt-2 text-slate-500">Company status: <Badge status={company?.status || 'pending'} /></p>
        </div>
      </div>

      {company?.status !== 'verified' ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <h3 className="font-bold">Verification pending</h3>
          <p className="mt-1 text-sm">The Super Admin will verify your company documents. You can upload cars after verification.</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Cars" value={cars.length} icon={Car} />
        <StatCard title="Pending Requests" value={pendingRequests.length} icon={Clock3} />
        <StatCard title="Active Rentals" value={activeRequests.length} icon={ClipboardCheck} />
        <StatCard title="Projected Revenue" value={currency(totalRevenue)} icon={IndianRupee} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-950">Latest Rent Requests</h3>
          <button onClick={() => setActivePage('requests')} className="text-sm font-bold text-slate-950 underline">View all</button>
        </div>
        {requests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Car</th>
                  <th className="px-3 py-3">Dates</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.slice(0, 6).map((request) => {
                  const car = state.cars.find((item) => item.id === request.carId);
                  return (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-3 py-4 font-semibold text-slate-950">{request.customerName}</td>
                      <td className="px-3 py-4 text-slate-600">{car?.name || 'Deleted car'}</td>
                      <td className="px-3 py-4 text-slate-600">{request.pickupDate} → {request.returnDate}</td>
                      <td className="px-3 py-4"><Badge status={request.status} /></td>
                      <td className="px-3 py-4 text-slate-500">{formatDate(request.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No rent requests" message="Rental requests submitted by users will appear here." />
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
