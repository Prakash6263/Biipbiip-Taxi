import { useState } from 'react';
import {
  Bell,
  Send,
  Trash2,
  Building2,
  Megaphone,
  AlertTriangle,
  Calendar,
  Ticket,
  Sparkles,
  CheckCircle2,
  Clock,
  Info,
  Laptop
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';

const CompanyNotifications = () => {
  const { state, sendCompanyNotification, deleteCompanyNotification } = useApp();

  // Form state
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [category, setCategory] = useState('announcement'); // announcement, offer, alert
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachOffer, setAttachOffer] = useState(false);

  // Offer settings
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [benefitType, setBenefitType] = useState('fee_discount'); // fee_discount, account_credit, custom
  const [benefitValue, setBenefitValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Feedbacks
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract companies list
  const companiesList = state.companies || [];

  // Calculate statistics
  const notifications = state.companyNotifications || [];
  const totalSent = notifications.length;

  const activeOffers = notifications.filter(n => {
    if (!n.offer) return false;
    if (!n.offer.expiryDate) return true;
    return new Date(n.offer.expiryDate) >= new Date();
  }).length;

  const totalCompaniesAvailable = companiesList.length;

  // Generate random code
  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'COMP-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOfferCode(code);
  };

  // Submit handler
  const handleSend = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a notification title.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please enter the message details.');
      return;
    }
    if (targetType === 'specific' && !selectedCompanyId) {
      setErrorMsg('Please select a target company.');
      return;
    }

    let targetCompanyName = 'All Registered Companies';
    let targetCompanyContact = '';

    if (targetType === 'specific') {
      const selectedCompany = companiesList.find(c => c.id === selectedCompanyId);
      if (selectedCompany) {
        targetCompanyName = selectedCompany.companyName;
        targetCompanyContact = selectedCompany.email;
      } else {
        setErrorMsg('Selected company not found.');
        return;
      }
    }

    let offerDetails = null;
    if (attachOffer) {
      if (!offerTitle.trim()) {
        setErrorMsg('Please specify an offer title.');
        return;
      }
      if (!offerCode.trim()) {
        setErrorMsg('Please specify a promo/offer code.');
        return;
      }
      if (!benefitValue.trim() || isNaN(benefitValue)) {
        setErrorMsg('Please enter a valid numeric benefit value.');
        return;
      }
      if (!expiryDate) {
        setErrorMsg('Please select an expiry date.');
        return;
      }
      offerDetails = {
        title: offerTitle.trim(),
        code: offerCode.trim().toUpperCase(),
        benefitType,
        benefitValue: Number(benefitValue),
        expiryDate
      };
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      category,
      targetType,
      targetDriverId: targetType === 'specific' ? selectedCompanyId : null,
      targetDriverName: targetCompanyName,
      targetDriverPhone: targetCompanyContact,
      offer: offerDetails
    };

    const res = sendCompanyNotification(payload);
    if (res.ok) {
      setSuccessMsg('Company portal notice broadcasted successfully!');
      setTitle('');
      setMessage('');
      setAttachOffer(false);
      setOfferTitle('');
      setOfferCode('');
      setBenefitValue('');
      setExpiryDate('');
      setSelectedCompanyId('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg('Failed to send company notification.');
    }
  };

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'announcement':
        return {
          label: 'Platform Update',
          bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
          icon: Megaphone,
          iconColor: 'text-blue-500'
        };
      case 'offer':
        return {
          label: 'Fee Incentive',
          bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
          icon: Ticket,
          iconColor: 'text-emerald-500'
        };
      case 'alert':
        return {
          label: 'Compliance Alert',
          bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
          icon: AlertTriangle,
          iconColor: 'text-amber-500'
        };
      default:
        return {
          label: 'Notice Update',
          bg: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/10',
          icon: Bell,
          iconColor: 'text-slate-500'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Company Notifications & Offers</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sent Company Notices</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{totalSent}</h4>
              <p className="mt-2 text-xs text-slate-500">Historical company portal logs</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Bell size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Fee Incentives</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{activeOffers}</h4>
              <p className="mt-2 text-xs text-slate-500">Active commission promos</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Ticket size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Rental Companies</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{totalCompaniesAvailable}</h4>
              <p className="mt-2 text-xs text-slate-500">Registered provider agencies</p>
            </div>
            <div className="rounded-2xl bg-[#00D6CC]/10 p-3 text-[#00D6CC]">
              <Building2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard (Form) */}
      <div className="w-full">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#00D6CC]/10 p-2 text-[#00D6CC]">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Compose Company Notice</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
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

            {/* Target Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('all');
                  setSelectedCompanyId('');
                }}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${targetType === 'all'
                  ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                All Companies
              </button>
              <button
                type="button"
                onClick={() => setTargetType('specific')}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${targetType === 'specific'
                  ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                Specific Agency
              </button>
            </div>

            {/* Company dropdown if specific */}
            {targetType === 'specific' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Rental Company</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
                >
                  <option value="">-- Choose Agency --</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.ownerName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category & Title */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value === 'offer') {
                      setAttachOffer(true);
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
                >
                  <option value="announcement">Announcement</option>
                  <option value="offer">Fee Incentive</option>
                  <option value="alert">System Alert</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Notice Heading</label>
                <input
                  type="text"
                  placeholder="e.g. Commission waiver bonus program"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notice Details</label>
              <textarea
                rows={4}
                placeholder="Type policy changes, announcements or broker deals..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition resize-none"
              />
            </div>

            {/* Attach incentive switcher */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Attach Commission Credit / Promo</p>
                  <p className="text-xs text-slate-500">Enable broker waivers or dashboard credits</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={attachOffer}
                  onChange={(e) => {
                    setAttachOffer(e.target.checked);
                    if (e.target.checked && !offerTitle) {
                      setOfferTitle('Fee Commission Waiver');
                    }
                  }}
                  className="peer sr-only"
                />
                <div className="peer h-6.5 w-12 rounded-full bg-slate-200 after:absolute after:top-[3px] after:left-[3px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
              </label>
            </div>

            {/* Promo incentives form */}
            {attachOffer && (
              <div className="p-5 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/20 space-y-4">
                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles size={16} /> Commission Program Details
                </h4>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incentive Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 5% Commission Off All August Bookings"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. PARTNERWAV"
                        value={offerCode}
                        onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-bold uppercase outline-none focus:border-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 text-xs font-bold transition whitespace-nowrap"
                      >
                        Auto Gen
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Benefit Type</label>
                    <select
                      value={benefitType}
                      onChange={(e) => setBenefitType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 transition"
                    >
                      <option value="fee_discount">Platform Fee Discount (%)</option>
                      <option value="account_credit">Flat Account Wallet Credit (₹/AED)</option>
                      <option value="custom">Custom Partner Deal</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Benefit Value ({benefitType === 'fee_discount' ? '%' : 'Credit Amount'})
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5 or 2500"
                      value={benefitValue}
                      onChange={(e) => setBenefitValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiration Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00D6CC] text-white py-3.5 px-6 font-bold shadow-md hover:bg-[#00c2b9] hover:shadow-lg transition-all"
            >
              <Send size={16} /> Broadcast to Portals
            </button>
          </form>
        </div>
      </div>

      {/* History Log */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Company Portal Notice History</h3>
            <p className="text-xs text-slate-500">History log of notifications and broker incentives broadcasted to partner agencies</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
            Total Broadcasts: {notifications.length}
          </span>
        </div>

        {notifications.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {notifications.map((notif) => {
              const categoryMeta = getCategoryMeta(notif.category);
              const CategoryIcon = categoryMeta.icon;
              const isExpired = notif.offer && notif.offer.expiryDate && new Date(notif.offer.expiryDate) < new Date();

              return (
                <div key={notif.id} className="group relative rounded-2xl border border-slate-200 bg-slate-50/30 p-5 hover:bg-white hover:shadow-soft transition duration-300">
                  <button
                    onClick={() => deleteCompanyNotification(notif.id)}
                    className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition duration-300"
                    title="Delete log"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${categoryMeta.bg}`}>
                        <CategoryIcon size={12} />
                        {categoryMeta.label}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-base">{notif.title}</h4>
                      <p className="text-xs text-slate-600 font-semibold">{notif.message}</p>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Recipient Partner:</span>
                        <span className="text-slate-900 font-bold">{notif.targetDriverName}</span>
                      </div>
                      {notif.targetDriverPhone && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Partner Contact Email:</span>
                          <span className="text-slate-600 font-semibold">{notif.targetDriverPhone}</span>
                        </div>
                      )}
                    </div>

                    {notif.offer && (
                      <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 p-4 space-y-3">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-r border-emerald-100" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-l border-emerald-100" />

                        <div className="flex items-start justify-between border-b border-emerald-500/10 pb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              Commission Incentive Deal
                            </span>
                            <p className="text-xs font-extrabold text-slate-800 mt-0.5">{notif.offer.title}</p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${isExpired ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div className="rounded-lg bg-slate-900 text-emerald-400 font-mono font-bold px-3 py-1.5 border border-slate-800 shadow-sm">
                            {notif.offer.code}
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 block text-sm">
                              {notif.offer.benefitType === 'fee_discount'
                                ? `${notif.offer.benefitValue}% Fee Discount`
                                : `₹ ${notif.offer.benefitValue} Account Credit`}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Exp: {notif.offer.expiryDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
            <Building2 className="mx-auto text-slate-300 mb-3" size={32} />
            <h4 className="text-sm font-bold text-slate-900">No portal notices broadcasted</h4>
            <p className="text-xs text-slate-400 mt-1">Broadcasted notices to company portals will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CompanyNotifications;
