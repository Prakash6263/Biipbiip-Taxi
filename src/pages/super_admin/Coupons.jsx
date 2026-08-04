import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import {
  Ticket,
  Plus,
  Search,
  Trash2,
  Percent,
  Calendar,
  DollarSign,
  Gift,
  CheckCircle2,
  Power,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Coupons = ({ setActivePage }) => {
  const { state, deleteCoupon, toggleCouponStatus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Extract coupons list from global state
  const coupons = state.coupons || [];

  // Derived Stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.status === 'active' && new Date(c.expiryDate) >= new Date()).length;
  const expiredCoupons = coupons.filter(c => c.status === 'expired' || new Date(c.expiryDate) < new Date()).length;

  // Filter coupons based on search and status
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      coupon.title.toLowerCase().includes(search.toLowerCase()) ||
      (coupon.description || '').toLowerCase().includes(search.toLowerCase());

    const isExpired = new Date(coupon.expiryDate) < new Date();
    const computedStatus = coupon.status === 'active' && isExpired ? 'expired' : coupon.status;
    const matchesFilter = statusFilter === 'all' ? true : computedStatus === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const getBenefitDetails = (type, value) => {
    switch (type) {
      case 'rental_discount':
        return {
          text: `${value}% Off Rental`,
          icon: Percent,
          color: 'text-blue-600 bg-blue-50 border-blue-100',
        };
      case 'wallet_cashback':
        return {
          text: `₹${value} Cashback`,
          icon: DollarSign,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        };
      case 'free_day':
        return {
          text: `${value} Day(s) Free`,
          icon: Gift,
          color: 'text-purple-600 bg-purple-50 border-purple-100',
        };
      default:
        return {
          text: `${value}`,
          icon: Ticket,
          color: 'text-slate-600 bg-slate-50 border-slate-100',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Coupon Management</h2>
          <p className="mt-1.5 text-sm text-slate-500">Create, manage, and monitor coupon codes and vouchers for booking promotions.</p>
        </div>
        <button
          onClick={() => setActivePage('create-coupon')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#00D6CC] text-white py-3 px-5 font-bold shadow-md hover:bg-[#00c2b9] hover:shadow-lg transition-all text-sm self-start sm:self-center"
          type="button"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Created Coupons</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{totalCoupons}</h4>
              <p className="mt-2 text-xs text-slate-500">Active and inactive vouchers historical log</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Ticket size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Promotions</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{activeCoupons}</h4>
              <p className="mt-2 text-xs text-slate-500">Coupons currently eligible at checkout</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Expired / Inactive</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{expiredCoupons}</h4>
              <p className="mt-2 text-xs text-slate-500">Expired and manually turned off coupons</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'expired', 'inactive'].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setStatusFilter(statusOption)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${statusFilter === statusOption
                  ? 'bg-[#00D6CC] text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                }`}
              type="button"
            >
              {statusOption === 'all' ? 'All' : statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {/* Table Container Card */}
      {filteredCoupons.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Coupon Code</th>
                  <th scope="col" className="px-6 py-4 font-bold">Campaign Details</th>
                  <th scope="col" className="px-6 py-4 font-bold">Benefit Type</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                  <th scope="col" className="px-6 py-4 font-bold">Expiry Date</th>
                  <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  const computedStatus = coupon.status === 'active' && isExpired ? 'expired' : coupon.status;
                  const benefit = getBenefitDetails(coupon.benefitType, coupon.benefitValue);
                  const BenefitIcon = benefit.icon;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Code Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#00D6CC]/10 text-[#00D6CC] flex items-center justify-center font-bold text-sm uppercase">
                            {coupon.code.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-950">{coupon.code}</div>
                            <div className="text-xs text-slate-400 mt-0.5">ID: {coupon.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Campaign Details Column */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-950">{coupon.title}</div>
                          {coupon.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{coupon.description}</p>
                          )}
                        </div>
                      </td>

                      {/* Benefit Type Column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${benefit.color}`}>
                          <BenefitIcon size={12} />
                          {benefit.text}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <Badge status={computedStatus} />
                      </td>

                      {/* Expiry Date Column */}
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <p className="font-bold text-slate-700">{coupon.expiryDate}</p>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isExpired && (
                            <button
                              onClick={() => toggleCouponStatus(coupon.id)}
                              className={`rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm ${
                                coupon.status === 'active'
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  : 'bg-[#00D6CC]/10 text-[#00D6CC] hover:bg-[#00D6CC] hover:text-white'
                              }`}
                              type="button"
                            >
                              {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white px-3 py-2 text-xs font-bold transition shadow-sm"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 p-4 bg-slate-50/20 text-xs font-medium text-slate-500">
            <span>Showing 1 to {filteredCoupons.length} of {filteredCoupons.length} entries</span>
            <div className="flex items-center gap-1.5 self-end">
              <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition" disabled type="button">
                <ChevronLeft size={14} />
              </button>
              <button className="h-7 w-7 rounded-lg bg-[#00D6CC] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#00D6CC]/15" type="button">
                1
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition" disabled type="button">
                <ChevronLeft size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState title="No coupons found" message="No coupon codes match your active search or category filters." />
      )}
    </div>
  );
};

export default Coupons;
