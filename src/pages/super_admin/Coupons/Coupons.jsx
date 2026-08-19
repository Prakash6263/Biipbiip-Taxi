import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import Badge from '../../../components/Badge';
import EmptyState from '../../../components/EmptyState';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center page-header mb-0">
        <div>
          <p className="breadcrumb-label">Marketing</p>
          <h2>Coupon Management</h2>
          <p>Create and manage discount coupons and promotional offers.</p>
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
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft relative overflow-hidden" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Ticket size={24} className="text-indigo-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Created</p>
              <h4 className="mt-1 text-2xl font-extrabold text-slate-900">{totalCoupons}</h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Historical log count</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft relative overflow-hidden" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Promotions</p>
              <h4 className="mt-1 text-2xl font-extrabold text-slate-900">{activeCoupons}</h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Currently eligible checkout offers</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft relative overflow-hidden" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
              <Calendar size={24} className="text-rose-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Expired / Inactive</p>
              <h4 className="mt-1 text-2xl font-extrabold text-slate-900">{expiredCoupons}</h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Offers no longer available</p>
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
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === statusOption
                  ? 'text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
              style={statusFilter === statusOption ? { backgroundColor: '#00D6CC', boxShadow: '0 4px 12px rgba(0, 214, 204, 0.2)' } : {}}
              type="button"
            >
              {statusOption}
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
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] transition"
            onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {/* Table Container Card */}
      {filteredCoupons.length > 0 ? (
        <>
          <div className="card card-table p-2">
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">Coupon Code</th>
                  <th className="font-bold text-slate-400">Campaign Title</th>
                  <th className="font-bold text-slate-400">Description</th>
                  <th className="font-bold text-slate-400">Benefit Type</th>
                  <th className="font-bold text-slate-400 text-center">Status</th>
                  <th className="font-bold text-slate-400">Expiry Date</th>
                  <th className="font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  const computedStatus = coupon.status === 'active' && isExpired ? 'expired' : coupon.status;
                  const benefit = getBenefitDetails(coupon.benefitType, coupon.benefitValue);
                  const BenefitIcon = benefit.icon;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Code Column */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm uppercase text-white"
                            style={{ backgroundColor: '#031E3C' }}
                          >
                            {coupon.code.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{coupon.code}</div>
                            <div className="text-xs text-slate-400 mt-0.5">ID: {coupon.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Campaign Title */}
                      <td className="font-bold text-slate-900 text-sm">{coupon.title}</td>

                      {/* Description */}
                      <td className="text-xs text-slate-500 max-w-[200px] truncate" title={coupon.description}>
                        {coupon.description || '—'}
                      </td>

                      {/* Benefit Type */}
                      <td>
                        <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${benefit.color}`}>
                          <BenefitIcon size={12} />
                          {benefit.text}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="text-center">
                        <span
                          className="inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-bold capitalize"
                          style={
                            computedStatus === 'active'
                              ? { color: '#10b981', borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }
                              : computedStatus === 'expired'
                              ? { color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }
                              : { color: '#64748b', borderColor: '#e2e8f0', backgroundColor: '#f1f5f9' }
                          }
                        >
                          {computedStatus}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="text-xs font-bold text-slate-700">{coupon.expiryDate}</td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isExpired && (
                            <button
                              onClick={() => toggleCouponStatus(coupon.id)}
                              className={`rounded-full px-4 py-2 text-xs font-bold transition shadow-sm ${
                                coupon.status === 'active'
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                  : 'text-white hover:opacity-90'
                              }`}
                              style={coupon.status !== 'active' ? { backgroundColor: '#00D6CC', boxShadow: '0 2px 6px rgba(0, 214, 204, 0.2)' } : {}}
                              type="button"
                            >
                              {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="rounded-full bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white px-4 py-2 text-xs font-bold transition border border-rose-200"
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
        </div>

          {/* Table Footer */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 p-4 bg-slate-50/20 text-xs font-medium text-slate-500">
            <span>Showing 1 to {filteredCoupons.length} of {filteredCoupons.length} entries</span>
            <div className="flex items-center gap-1.5 self-end">
              <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition" disabled type="button">
                <ChevronLeft size={14} />
              </button>
              <button className="h-7 w-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-sm" style={{ backgroundColor: '#00D6CC' }} type="button">
                1
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition" disabled type="button">
                <ChevronLeft size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No coupons found" message="No coupon codes match your active search or category filters." />
      )}
    </div>
  );
};

export default Coupons;
