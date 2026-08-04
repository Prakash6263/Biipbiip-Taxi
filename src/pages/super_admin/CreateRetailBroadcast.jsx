import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Ticket
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const CreateRetailBroadcast = ({ setActivePage, selectedNotificationId }) => {
  const { state, sendUserNotification, updateUserNotification } = useApp();

  // Form state
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('offer'); // announcement, offer, alert
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachOffer, setAttachOffer] = useState(false);

  // Offer settings
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [benefitType, setBenefitType] = useState('rental_discount'); // rental_discount, wallet_cashback, free_day
  const [benefitValue, setBenefitValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Feedbacks
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const notifications = state.userNotifications || [];

  // Extract unique customers from rental requests to use as select targets
  const rentalRequests = state.rentalRequests || [];
  const uniqueCustomers = [];
  const emailsSeen = new Set();

  rentalRequests.forEach(req => {
    if (req.customerEmail && !emailsSeen.has(req.customerEmail.toLowerCase())) {
      emailsSeen.add(req.customerEmail.toLowerCase());
      uniqueCustomers.push({
        id: req.id || req.customerEmail,
        name: req.customerName || 'Unnamed Customer',
        email: req.customerEmail,
        phone: req.customerPhone || ''
      });
    }
  });

  // Add dummy default users if empty to ensure the admin has choices
  if (uniqueCustomers.length === 0) {
    uniqueCustomers.push(
      { id: 'usr_mock_1', name: 'Neha Gupta', email: 'neha@example.com', phone: '+91 91234 56789' },
      { id: 'usr_mock_2', name: 'Amit Singh', email: 'amit.singh@demo.com', phone: '+91 98888 77777' },
      { id: 'usr_mock_3', name: 'Priya Nair', email: 'priya@nair.com', phone: '+91 80123 45678' }
    );
  }

  // Handle initialization/editing state
  useEffect(() => {
    if (selectedNotificationId) {
      const notif = notifications.find(n => n.id === selectedNotificationId);
      if (notif) {
        setTitle(notif.title || '');
        setMessage(notif.message || '');
        setCategory(notif.category || 'offer');
        setTargetType(notif.targetType || 'all');
        
        if (notif.targetUserId) {
          setSelectedUserIds(Array.isArray(notif.targetUserId) ? notif.targetUserId : [notif.targetUserId]);
        } else {
          setSelectedUserIds([]);
        }

        if (notif.offer) {
          setAttachOffer(true);
          setOfferTitle(notif.offer.title || '');
          setOfferCode(notif.offer.code || '');
          setBenefitType(notif.offer.benefitType || 'rental_discount');
          setBenefitValue(notif.offer.benefitValue !== undefined ? String(notif.offer.benefitValue) : '');
          setExpiryDate(notif.offer.expiryDate || '');
        } else {
          setAttachOffer(false);
          setOfferTitle('');
          setOfferCode('');
          setBenefitType('rental_discount');
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
      setErrorMsg('Please enter the message description.');
      return;
    }
    if (targetType === 'specific' && selectedUserIds.length === 0) {
      setErrorMsg('Please select at least one recipient user.');
      return;
    }

    let targetUserName = 'All Retail Users';
    let targetUserContact = '';

    if (targetType === 'specific') {
      const selectedUsers = uniqueCustomers.filter(u => selectedUserIds.includes(u.id));
      if (selectedUsers.length > 0) {
        targetUserName = selectedUsers.map(u => u.name).join(', ');
        targetUserContact = selectedUsers.map(u => u.email || u.phone).filter(Boolean).join(', ');
      } else {
        setErrorMsg('Selected user(s) not found.');
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
        setErrorMsg('Please specify a promo code.');
        return;
      }
      if (!benefitValue.trim() || isNaN(benefitValue)) {
        setErrorMsg('Please enter a valid benefit numeric value.');
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
      targetUserId: targetType === 'specific' ? selectedUserIds : null,
      targetDriverName: targetUserName, // map targetDriverName for unified parsing in state
      targetDriverPhone: targetUserContact,
      offer: offerDetails
    };

    if (selectedNotificationId) {
      const res = updateUserNotification(selectedNotificationId, payload);
      if (res.ok) {
        setSuccessMsg('Retail user notification updated successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('user-notifications');
        }, 1500);
      } else {
        setErrorMsg('Failed to update user notification.');
      }
    } else {
      const res = sendUserNotification(payload);
      if (res.ok) {
        setSuccessMsg('Retail user notification broadcasted successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('user-notifications');
        }, 1500);
      } else {
        setErrorMsg('Failed to broadcast user notification.');
      }
    }
  };

  const filteredCustomers = uniqueCustomers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.phone && u.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setActivePage('user-notifications')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold"
        type="button"
      >
        <ArrowLeft size={16} /> Back to User Notifications
      </button>

      {/* Main Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#00D6CC]/10 p-2 text-[#00D6CC]">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {selectedNotificationId ? 'Edit Retail Broadcast' : 'Create Retail Broadcast'}
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

          {/* Target Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('all');
                  setSelectedUserIds([]);
                  setSearchTerm('');
                }}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${
                  targetType === 'all'
                    ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                All App Users
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
                Specific Customers
              </button>
            </div>
          </div>

          {/* Specific user drop down / search checkbox list */}
          {targetType === 'specific' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Renters ({selectedUserIds.length} selected)</label>
                {selectedUserIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedUserIds([])}
                    className="text-xs font-bold text-[#00D6CC] hover:underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Search renters by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] focus:bg-white transition"
              />

              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/30 p-3 space-y-1.5">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((u) => {
                    const isChecked = selectedUserIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
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
                            setSelectedUserIds(prev =>
                              prev.includes(u.id)
                                ? prev.filter(id => id !== u.id)
                                : [...prev, u.id]
                            );
                          }}
                          className="rounded border-slate-300 text-[#00D6CC] focus:ring-[#00D6CC] h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{u.email || u.phone}</p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400">No renters found matching your search.</div>
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
                <option value="offer">Promo & Offer</option>
                <option value="announcement">Announcement</option>
                <option value="alert">System Alert</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Heading</label>
              <input
                type="text"
                placeholder="e.g. Weekend Flash Rental Sale!"
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
                <span className="text-sm font-bold text-slate-800">Attach Promo Voucher / Offer</span>
                <p className="text-xs text-slate-400">Include a discount code or reward voucher with this notification</p>
              </div>
            </label>

            {attachOffer && (
              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-slate-200/60 transition-all duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offer Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 15% off next ride"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#00D6CC] transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BIIP-FL15"
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
                      <option value="rental_discount">Percent Off (%)</option>
                      <option value="wallet_cashback">Cashback (₹)</option>
                      <option value="free_day">Free Day(s)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="e.g. 15"
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
              onClick={() => setActivePage('user-notifications')}
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

export default CreateRetailBroadcast;
