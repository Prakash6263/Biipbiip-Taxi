import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Ticket
} from 'lucide-react';
import { useApp } from '../../../../context/AppContext';

const CreateDriverNotification = ({ setActivePage, selectedNotificationId }) => {
  const { state, sendDriverNotification, updateDriverNotification } = useApp();

  // Form state
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('announcement'); // announcement, offer, alert, incentive
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachOffer, setAttachOffer] = useState(false);

  // Offer/Incentive sub-form state
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [benefitType, setBenefitType] = useState('commission_discount'); // commission_discount, cash_bonus, custom
  const [benefitValue, setBenefitValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Status/feedback state
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const notifications = state.driverNotifications || [];

  // Extract verified drivers for targeting
  const driversList = state.verificationRequests || [];
  const verifiedDrivers = driversList.filter(d => d.status === 'verified');

  // Handle initialization/editing state
  useEffect(() => {
    if (selectedNotificationId) {
      const notif = notifications.find(n => n.id === selectedNotificationId);
      if (notif) {
        setTitle(notif.title || '');
        setMessage(notif.message || '');
        setCategory(notif.category || 'announcement');
        setTargetType(notif.targetType || 'all');

        if (notif.targetDriverId) {
          setSelectedDriverIds(Array.isArray(notif.targetDriverId) ? notif.targetDriverId : [notif.targetDriverId]);
        } else {
          setSelectedDriverIds([]);
        }

        if (notif.offer) {
          setAttachOffer(true);
          setOfferTitle(notif.offer.title || '');
          setOfferCode(notif.offer.code || '');
          setBenefitType(notif.offer.benefitType || 'commission_discount');
          setBenefitValue(notif.offer.benefitValue !== undefined ? String(notif.offer.benefitValue) : '');
          setExpiryDate(notif.offer.expiryDate || '');
        } else {
          setAttachOffer(false);
          setOfferTitle('');
          setOfferCode('');
          setBenefitType('commission_discount');
          setBenefitValue('');
          setExpiryDate('');
        }
      }
    }
  }, [selectedNotificationId, notifications]);

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
  const handleSubmit = (e) => {
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
    if (targetType === 'specific' && selectedDriverIds.length === 0) {
      setErrorMsg('Please select at least one specific driver.');
      return;
    }

    let targetDriverName = 'All Drivers';
    let targetDriverPhone = '';

    if (targetType === 'specific') {
      const selectedDrivers = verifiedDrivers.filter(d => selectedDriverIds.includes(d.id));
      if (selectedDrivers.length > 0) {
        targetDriverName = selectedDrivers.map(d => d.userName).join(', ');
        targetDriverPhone = selectedDrivers.map(d => d.userPhone || d.userEmail || '').filter(Boolean).join(', ');
      } else {
        setErrorMsg('Selected driver(s) not found.');
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
      targetDriverId: targetType === 'specific' ? selectedDriverIds : null,
      targetDriverName,
      targetDriverPhone,
      offer: offerDetails
    };

    if (selectedNotificationId) {
      const res = updateDriverNotification(selectedNotificationId, payload);
      if (res.ok) {
        setSuccessMsg('Driver notification updated successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('driver-notifications');
        }, 1500);
      } else {
        setErrorMsg('Failed to update driver notification.');
      }
    } else {
      const res = sendDriverNotification(payload);
      if (res.ok) {
        setSuccessMsg('Driver notification sent and broadcasted successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('driver-notifications');
        }, 1500);
      } else {
        setErrorMsg('Failed to broadcast driver notification.');
      }
    }
  };

  const filteredDrivers = verifiedDrivers.filter(d =>
    d.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.userPhone && d.userPhone.includes(searchTerm)) ||
    (d.userEmail && d.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setActivePage('driver-notifications')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold"
        type="button"
      >
        <ArrowLeft size={16} /> Back to Driver Notifications
      </button>

      {/* Main Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#00D6CC]/10 p-2 text-[#00D6CC]">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {selectedNotificationId ? 'Edit Driver Broadcast' : 'Compose New Driver Broadcast'}
          </h3>
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

          {/* Target Type selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('all');
                  setSelectedDriverIds([]);
                  setSearchTerm('');
                }}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${
                  targetType === 'all'
                    ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                Broadcast to All Drivers
              </button>
              <button
                type="button"
                onClick={() => setTargetType('specific')}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${
                  targetType === 'specific'
                    ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                Target Specific Drivers
              </button>
            </div>
          </div>

          {/* Driver drop down if specific is chosen */}
          {targetType === 'specific' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Drivers ({selectedDriverIds.length} selected)</label>
                {selectedDriverIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDriverIds([])}
                    className="text-xs font-bold text-[#00D6CC] hover:underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Search drivers by name, phone or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              />

              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/30 p-3 space-y-1.5">
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((d) => {
                    const isChecked = selectedDriverIds.includes(d.id);
                    return (
                      <label
                        key={d.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                          isChecked
                            ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-slate-900'
                            : 'border-transparent hover:bg-slate-100/50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedDriverIds(prev =>
                              prev.includes(d.id)
                                ? prev.filter(id => id !== d.id)
                                : [...prev, d.id]
                            );
                          }}
                          className="rounded border-slate-300 text-[#00D6CC] focus:ring-[#00D6CC] h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-slate-800">{d.userName}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{d.userPhone || d.userEmail || d.id}</p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400">No verified drivers found matching search.</div>
                )}
              </div>
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
                <option value="offer">Promo & Offer</option>
                <option value="alert">System Alert</option>
                <option value="incentive">Incentive / Bonus</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Heading</label>
              <input
                type="text"
                placeholder="e.g. Incentive Program Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Description</label>
            <textarea
              rows={4}
              placeholder="Describe your notification details here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition resize-none"
            />
          </div>

          {/* Attach Promo Offer Block */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={attachOffer}
                onChange={(e) => setAttachOffer(e.target.checked)}
                className="rounded border-slate-300 text-[#00D6CC] focus:ring-[#00D6CC] h-4.5 w-4.5"
              />
              <div>
                <span className="text-sm font-bold text-slate-800">Attach Incentive / Bonus Offer</span>
                <p className="text-xs text-slate-400">Include a commission reduction or bonus credit with this notification</p>
              </div>
            </label>

            {attachOffer && (
              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-slate-200/60 transition-all duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offer Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 5% Commission reduction"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offer Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BIIP-DR5"
                      value={offerCode}
                      onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] transition uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 font-bold transition text-xs shrink-0 whitespace-nowrap border border-slate-200"
                    >
                      Generate Code
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Benefit Type & Value</label>
                  <div className="flex gap-2">
                    <select
                      value={benefitType}
                      onChange={(e) => setBenefitType(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] transition shrink-0"
                    >
                      <option value="commission_discount">Commission Reduction (%)</option>
                      <option value="cash_bonus">Cash Bonus (₹)</option>
                      <option value="custom">Custom</option>
                    </select>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={benefitValue}
                      onChange={(e) => setBenefitValue(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#00D6CC] text-white py-3.5 px-6 font-bold shadow-md hover:bg-[#00c2b9] hover:shadow-lg transition-all"
            >
              <Send size={16} /> {selectedNotificationId ? 'Update Broadcast' : 'Send Push Notification'}
            </button>
            <button
              type="button"
              onClick={() => setActivePage('driver-notifications')}
              className="rounded-2xl bg-slate-100 text-slate-600 py-3.5 px-6 font-bold hover:bg-slate-200 transition-all border border-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDriverNotification;
