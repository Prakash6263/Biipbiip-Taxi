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

const CreateCompanyNotification = ({ setActivePage, selectedNotificationId }) => {
  const { state, sendCompanyNotification, updateCompanyNotification } = useApp();

  // Form state
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const notifications = state.companyNotifications || [];
  const companiesList = state.companies || [];

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
          setSelectedCompanyIds(Array.isArray(notif.targetDriverId) ? notif.targetDriverId : [notif.targetDriverId]);
        } else {
          setSelectedCompanyIds([]);
        }

        if (notif.offer) {
          setAttachOffer(true);
          setOfferTitle(notif.offer.title || '');
          setOfferCode(notif.offer.code || '');
          setBenefitType(notif.offer.benefitType || 'fee_discount');
          setBenefitValue(notif.offer.benefitValue !== undefined ? String(notif.offer.benefitValue) : '');
          setExpiryDate(notif.offer.expiryDate || '');
        } else {
          setAttachOffer(false);
          setOfferTitle('');
          setOfferCode('');
          setBenefitType('fee_discount');
          setBenefitValue('');
          setExpiryDate('');
        }
      }
    }
  }, [selectedNotificationId, notifications]);

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
  const handleSubmit = (e) => {
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
    if (targetType === 'specific' && selectedCompanyIds.length === 0) {
      setErrorMsg('Please select at least one target company.');
      return;
    }

    let targetCompanyName = 'All Registered Companies';
    let targetCompanyContact = '';

    if (targetType === 'specific') {
      const selectedCompanies = companiesList.filter(c => selectedCompanyIds.includes(c.id));
      if (selectedCompanies.length > 0) {
        targetCompanyName = selectedCompanies.map(c => c.companyName).join(', ');
        targetCompanyContact = selectedCompanies.map(c => c.email).filter(Boolean).join(', ');
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
      targetDriverId: targetType === 'specific' ? selectedCompanyIds : null,
      targetDriverName: targetCompanyName,
      targetDriverPhone: targetCompanyContact,
      offer: offerDetails
    };

    if (selectedNotificationId) {
      const res = updateCompanyNotification(selectedNotificationId, payload);
      if (res.ok) {
        setSuccessMsg('Company portal notice updated successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('company-notifications');
        }, 1500);
      } else {
        setErrorMsg('Failed to update company notification.');
      }
    } else {
      const res = sendCompanyNotification(payload);
      if (res.ok) {
        setSuccessMsg('Company portal notice broadcasted successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('company-notifications');
        }, 1500);
      } else {
        setErrorMsg('Failed to send company notification.');
      }
    }
  };

  const filteredCompanies = companiesList.filter(c =>
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.ownerName && c.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setActivePage('company-notifications')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold"
        type="button"
      >
        <ArrowLeft size={16} /> Back to Company Notifications
      </button>

      {/* Main Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#00D6CC]/10 p-2 text-[#00D6CC]">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {selectedNotificationId ? 'Edit Company Notice' : 'Compose Company Notice'}
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

          {/* Target Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('all');
                  setSelectedCompanyIds([]);
                  setSearchTerm('');
                }}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${
                  targetType === 'all'
                    ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                All Companies
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
                Specific Agencies
              </button>
            </div>
          </div>

          {/* Company dropdown if specific */}
          {targetType === 'specific' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Companies ({selectedCompanyIds.length} selected)</label>
                {selectedCompanyIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCompanyIds([])}
                    className="text-xs font-bold text-[#00D6CC] hover:underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Search companies by name, owner or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              />

              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/30 p-3 space-y-1.5">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((c) => {
                    const isChecked = selectedCompanyIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
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
                            setSelectedCompanyIds(prev =>
                              prev.includes(c.id)
                                ? prev.filter(id => id !== c.id)
                                : [...prev, c.id]
                            );
                          }}
                          className="rounded border-slate-300 text-[#00D6CC] focus:ring-[#00D6CC] h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-slate-800">{c.companyName}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.ownerName} ({c.email})</p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400">No companies found matching your search.</div>
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
                <span className="text-sm font-bold text-slate-800">Attach Broker Incentive / Discount</span>
                <p className="text-xs text-slate-400">Include a subscription discount or credit reward with this broadcast notice</p>
              </div>
            </label>

            {attachOffer && (
              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-slate-200/60 transition-all duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offer Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 10% Discount on platform fee"
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
                      placeholder="e.g. COMP-OFF10"
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
                      <option value="fee_discount">Fee Discount (%)</option>
                      <option value="account_credit">Account Credit (₹)</option>
                      <option value="custom">Custom</option>
                    </select>
                    <input
                      type="text"
                      placeholder="e.g. 10"
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
              <Send size={16} /> {selectedNotificationId ? 'Update Notice' : 'Broadcast to Portals'}
            </button>
            <button
              type="button"
              onClick={() => setActivePage('company-notifications')}
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

export default CreateCompanyNotification;
