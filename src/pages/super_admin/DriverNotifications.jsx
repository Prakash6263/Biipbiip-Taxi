import { useState } from 'react';
import {
  Bell,
  Send,
  Trash2,
  Users,
  Award,
  Megaphone,
  AlertTriangle,
  Calendar,
  Ticket,
  Sparkles,
  CheckCircle2,
  Clock,
  Info,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import Badge from '../../components/Badge';

const DriverNotifications = () => {
  const { state, sendDriverNotification, deleteDriverNotification } = useApp();

  // Form state
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [category, setCategory] = useState('announcement'); // announcement, offer, alert, incentive
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachOffer, setAttachOffer] = useState(false);

  // Offer sub-form state
  const [offerCode, setOfferCode] = useState('');
  const [benefitType, setBenefitType] = useState('commission_discount'); // commission_discount, cash_bonus, custom
  const [benefitValue, setBenefitValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [offerTitle, setOfferTitle] = useState('');

  // Status/feedback state
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract verified drivers for targeting
  const driversList = state.verificationRequests || [];
  const verifiedDrivers = driversList.filter(d => d.status === 'verified');

  // Calculate statistics
  const notifications = state.driverNotifications || [];
  const totalSent = notifications.length;

  const activeOffers = notifications.filter(n => {
    if (!n.offer) return false;
    if (!n.offer.expiryDate) return true;
    return new Date(n.offer.expiryDate) >= new Date();
  }).length;

  const totalDriversTargeted = verifiedDrivers.length;

  // Generate random promo code
  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'BIIP-';
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
      setErrorMsg('Please enter the message body.');
      return;
    }
    if (targetType === 'specific' && !selectedDriverId) {
      setErrorMsg('Please select a specific driver.');
      return;
    }

    let targetDriverName = 'All Drivers';
    let targetDriverPhone = '';

    if (targetType === 'specific') {
      const selectedDriver = verifiedDrivers.find(d => d.id === selectedDriverId);
      if (selectedDriver) {
        targetDriverName = selectedDriver.userName;
        targetDriverPhone = selectedDriver.userPhone;
      } else {
        setErrorMsg('Selected driver not found.');
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
        setErrorMsg('Please select an expiry date for this offer.');
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
      targetDriverId: targetType === 'specific' ? selectedDriverId : null,
      targetDriverName,
      targetDriverPhone,
      offer: offerDetails
    };

    const res = sendDriverNotification(payload);
    if (res.ok) {
      setSuccessMsg('Notification sent and broadcasted successfully!');
      // Reset form fields
      setTitle('');
      setMessage('');
      setAttachOffer(false);
      setOfferTitle('');
      setOfferCode('');
      setBenefitValue('');
      setExpiryDate('');
      setSelectedDriverId('');

      // Auto clear success msg after 4 seconds
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg('An error occurred while broadcasting.');
    }
  };

  // Get category badge style & icon
  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'announcement':
        return {
          label: 'Announcement',
          bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
          icon: Megaphone,
          iconColor: 'text-blue-500'
        };
      case 'offer':
        return {
          label: 'Offer & Promo',
          bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
          icon: Ticket,
          iconColor: 'text-emerald-500'
        };
      case 'alert':
        return {
          label: 'System Alert',
          bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
          icon: AlertTriangle,
          iconColor: 'text-amber-500'
        };
      case 'incentive':
        return {
          label: 'Incentive/Bonus',
          bg: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/10',
          icon: Award,
          iconColor: 'text-purple-500'
        };
      default:
        return {
          label: 'General',
          bg: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/10',
          icon: Bell,
          iconColor: 'text-slate-500'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Driver Notifications & Offers</h2>
        </div>
      </div>

      {/* KPI statistics cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sent Broadcasts</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{totalSent}</h4>
              <p className="mt-2 text-xs text-slate-500">Historical notifications logged</p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Bell size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Attached Offers</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{activeOffers}</h4>
              <p className="mt-2 text-xs text-slate-500">Promotions not yet expired</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Ticket size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Targetable Drivers</p>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-950">{totalDriversTargeted}</h4>
              <p className="mt-2 text-xs text-slate-500">Verified & approved system drivers</p>
            </div>
            <div className="rounded-2xl bg-[#00D6CC]/10 p-3 text-[#00D6CC]">
              <Users size={24} />
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
            <h3 className="text-lg font-bold text-slate-900">Compose New Broadcast</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Form Feedback */}
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

            {/* Target Type selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('all');
                  setSelectedDriverId('');
                }}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${targetType === 'all'
                  ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                Broadcast to All Drivers
              </button>
              <button
                type="button"
                onClick={() => setTargetType('specific')}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${targetType === 'specific'
                  ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                Target Specific Driver
              </button>
            </div>

            {/* Driver drop down if specific is chosen */}
            {targetType === 'specific' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
                >
                  <option value="">-- Choose verified driver --</option>
                  {verifiedDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.userName} ({d.userPhone || d.userEmail || d.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category and Title */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
                >
                  <option value="announcement">Announcement</option>
                  <option value="offer">Promo & Offer</option>
                  <option value="alert">System Alert</option>
                  <option value="incentive">Incentive / Bonus</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Heading</label>
                <input
                  type="text"
                  placeholder="Enter short title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Description</label>
              <textarea
                rows={4}
                placeholder="Type the message detail you want to send..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition resize-none"
              />
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00D6CC] text-white py-3.5 px-6 font-bold shadow-md hover:bg-[#00c2b9] hover:shadow-lg transition-all transform active:scale-[0.99]"
            >
              <Send size={16} /> Broadcast to Drivers
            </button>
          </form>
        </div>
      </div>

      {/* Historical Logs List */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Broadcast Log History</h3>
            <p className="text-xs text-slate-500">View and manage sent notifications and offer vouchers</p>
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
                    <th scope="col" className="px-6 py-4 font-bold">Recipient Driver</th>
                    <th scope="col" className="px-6 py-4 font-bold">Message Details</th>
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
                                {notif.offer.benefitType === 'commission_discount'
                                  ? `${notif.offer.benefitValue}% Off Commission`
                                  : `₹ ${notif.offer.benefitValue} Cash Bonus`}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => deleteDriverNotification(notif.id)}
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
            <Bell className="mx-auto text-slate-300 mb-3" size={32} />
            <h4 className="text-sm font-bold text-slate-900">No broadcasts recorded</h4>
            <p className="text-xs text-slate-400 mt-1">Sent push notifications and promos will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DriverNotifications;
