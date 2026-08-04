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
                  onChange={(e) => setCategory(e.target.value)}
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
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">Date Sent</th>
                    <th scope="col" className="px-6 py-4 font-bold">Category</th>
                    <th scope="col" className="px-6 py-4 font-bold">Recipient Partner</th>
                    <th scope="col" className="px-6 py-4 font-bold">Notice Details</th>
                    <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((notif) => {
                    const categoryMeta = getCategoryMeta(notif.category);
                    const CategoryIcon = categoryMeta.icon;
                    return (
                      <tr key={notif.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                          {formatDate(notif.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${categoryMeta.bg}`}>
                            <CategoryIcon size={12} />
                            {categoryMeta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-950">{notif.targetDriverName}</div>
                          {notif.targetDriverPhone && (
                            <div className="text-xs text-slate-400 mt-0.5 font-mono">{notif.targetDriverPhone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <div className="font-bold text-slate-950">{notif.title}</div>
                          <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-wrap">{notif.message}</p>
                          {notif.offer && (
                            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-100">
                              <Ticket size={12} />
                              <span className="font-mono">{notif.offer.code}</span>
                              <span>•</span>
                              <span>
                                {notif.offer.benefitType === 'fee_discount'
                                  ? `${notif.offer.benefitValue}% Fee Discount`
                                  : `₹ ${notif.offer.benefitValue} Credit`}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => deleteCompanyNotification(notif.id)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete log"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
