import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  ArrowLeft,
  Plus,
  Percent,
  DollarSign,
  Gift,
  AlertTriangle,
  CheckCircle2,
  Ticket
} from 'lucide-react';

const CreateCoupon = ({ setActivePage }) => {
  const { state, createCoupon } = useApp();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [benefitType, setBenefitType] = useState('rental_discount');
  const [benefitValue, setBenefitValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // UI Feedback States
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract coupons list from global state (for validation)
  const coupons = state.coupons || [];

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Offer Title is required.');
      return;
    }
    if (!benefitValue || Number(benefitValue) <= 0) {
      setErrorMsg('Benefit Value must be a positive number.');
      return;
    }
    if (!expiryDate) {
      setErrorMsg('Expiration Date is required.');
      return;
    }

    // Auto-generate a unique coupon code in the background
    let generatedCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomCode = '';
      for (let i = 0; i < 8; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const prefix = benefitType === 'rental_discount' ? 'PCT' : benefitType === 'wallet_cashback' ? 'CASH' : 'FREE';
      generatedCode = `${prefix}${randomCode}`;

      const duplicate = coupons.some(c => c.code === generatedCode);
      if (!duplicate) {
        isUnique = true;
      }
      attempts++;
    }

    const couponData = {
      code: generatedCode,
      title: title.trim(),
      description: description.trim(),
      benefitType,
      benefitValue: Number(benefitValue),
      expiryDate,
      status: new Date(expiryDate) < new Date() ? 'expired' : 'active',
    };

    const res = createCoupon(couponData);
    if (res.ok) {
      setSuccessMsg(`Coupon "${couponData.code}" created successfully! Redirecting...`);

      // Redirect back to coupon list after 1.5 seconds
      setTimeout(() => {
        setActivePage('coupons');
      }, 1500);
    } else {
      setErrorMsg('Something went wrong while creating the coupon.');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Back Button */}
      <button
        onClick={() => setActivePage('coupons')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold"
        type="button"
      >
        <ArrowLeft size={16} /> Back to Coupons
      </button>

      {/* Form Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
            <Ticket size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-950">Create New Coupon</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {successMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-100">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800 border border-rose-100">
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Offer Title & Benefit Type Inline */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Offer Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offer Title</label>
              <input
                type="text"
                placeholder="e.g. 20% Off Creta Bookings"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              />
            </div>

            {/* Benefit Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Benefit Type</label>
              <select
                value={benefitType}
                onChange={(e) => setBenefitType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              >
                <option value="rental_discount">Rental Discount (%)</option>
                <option value="wallet_cashback">Wallet Cashback (₹)</option>
                <option value="taxi_booking">Taxi Booking (%)</option>
                <option value="free_day">Free Booking Day(s)</option>
              </select>
            </div>
          </div>

          {/* Benefit Value & Expiration Date Inline */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Benefit Value */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Benefit Value ({benefitType === 'rental_discount' ? '%' : benefitType === 'wallet_cashback' ? '₹' : 'Days'})
              </label>
              <input
                type="number"
                placeholder={benefitType === 'rental_discount' ? 'e.g. 20' : benefitType === 'wallet_cashback' ? 'e.g. 100' : 'e.g. 1'}
                value={benefitValue}
                onChange={(e) => setBenefitValue(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiration Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Description (Spans full width) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Brief explanation of coupon terms, validity conditions, or rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-3 gap-4 pt-3">
            <button
              type="button"
              onClick={() => setActivePage('coupons')}
              className="col-span-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-3.5 font-bold transition text-sm text-center shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[#00D6CC] text-white py-3.5 px-4 font-bold shadow-md hover:bg-[#00c2b9] hover:shadow-lg transition-all text-sm"
            >
              <Plus size={16} /> Create Promo Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoupon;
