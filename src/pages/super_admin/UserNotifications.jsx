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
  Pencil
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';

const UserNotifications = () => {
  const { state, sendUserNotification, deleteUserNotification, updateUserNotification } = useApp();

  // Form state
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('offer'); // announcement, offer, alert
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachOffer, setAttachOffer] = useState(false);
  const [editingNotifId, setEditingNotifId] = useState(null);

  // Offer settings
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [benefitType, setBenefitType] = useState('rental_discount'); // rental_discount, wallet_cashback, free_day, custom
  const [benefitValue, setBenefitValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Feedbacks
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEditClick = (notif) => {
    setEditingNotifId(notif.id);
    setCategory(notif.category);
    setTitle(notif.title);
    setMessage(notif.message);
    setTargetType(notif.targetType);
    if (notif.targetUserId) {
      if (Array.isArray(notif.targetUserId)) {
        setSelectedUserIds(notif.targetUserId);
      } else {
        setSelectedUserIds([notif.targetUserId]);
      }
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotifId(null);
    setTitle('');
    setMessage('');
    setCategory('offer');
    setTargetType('all');
    setSelectedUserIds([]);
    setSearchTerm('');
    setSuccessMsg('');
    setErrorMsg('');
  };

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

  // Calculate statistics
  const notifications = state.userNotifications || [];
  const totalSent = notifications.length;

  const activeOffers = notifications.filter(n => {
    if (!n.offer) return false;
    if (!n.offer.expiryDate) return true;
    return new Date(n.offer.expiryDate) >= new Date();
  }).length;

  const totalUsersAvailable = uniqueCustomers.length;

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

    if (editingNotifId) {
      const res = updateUserNotification(editingNotifId, payload);
      if (res.ok) {
        setSuccessMsg('Retail user notification updated successfully!');
        setSelectedUserIds([]);
        setSearchTerm('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg('Failed to update user notification.');
      }
    } else {
      const res = sendUserNotification(payload);
      if (res.ok) {
        setSuccessMsg('Retail user notification broadcasted successfully!');
        setTitle('');
        setMessage('');
        setAttachOffer(false);
        setOfferTitle('');
        setOfferCode('');
        setBenefitValue('');
        setExpiryDate('');
        setSelectedUserIds([]);
        setSearchTerm('');
        setTimeout(() => setSuccessMsg(''), 4000);
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

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'announcement':
        return {
          label: 'Broadcast Update',
          bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
          icon: Megaphone,
          iconColor: 'text-blue-500'
        };
      case 'offer':
        return {
          label: 'Special Offer',
          bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
          icon: Ticket,
          iconColor: 'text-emerald-500'
        };
      case 'alert':
        return {
          label: 'System Alert',
          bg: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10',
          icon: AlertTriangle,
          iconColor: 'text-rose-500'
        };
      default:
        return {
          label: 'General Notification',
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
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">User Notifications & Offers</h2>
      </div>

      {/* Main Dashboard (Form) */}
      <div className="w-full">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#00D6CC]/10 p-2 text-[#00D6CC]">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingNotifId ? 'Edit Retail Broadcast' : 'Create Retail Broadcast'}
            </h3>
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

            {/* Target Type */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('all');
                  setSelectedUserIds([]);
                  setSearchTerm('');
                }}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${targetType === 'all'
                  ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                All App Users
              </button>
              <button
                type="button"
                onClick={() => setTargetType('specific')}
                className={`rounded-2xl py-3 px-4 text-sm font-bold border transition ${targetType === 'specific'
                  ? 'border-[#00D6CC] bg-[#00D6CC]/5 text-[#00D6CC]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                Specific Customers
              </button>
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
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer text-xs font-semibold ${isChecked
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


            {/* Submit */}
            {editingNotifId ? (
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white py-3.5 px-6 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Send size={16} /> Update Notification
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-2xl bg-slate-100 text-slate-600 py-3.5 px-6 font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00D6CC] text-white py-3.5 px-6 font-bold shadow-md hover:bg-[#00c2b9] hover:shadow-lg transition-all"
              >
                <Send size={16} /> Send Push Notification
              </button>
            )}
          </form>
        </div>
      </div>

      {/* History Log */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">User Notification History</h3>
            <p className="text-xs text-slate-500">History log of notifications and vouchers pushed to renters</p>
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
                    <th scope="col" className="px-6 py-4 font-bold">Recipient</th>
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
                                {notif.offer.benefitType === 'rental_discount'
                                  ? `${notif.offer.benefitValue}% Off`
                                  : notif.offer.benefitType === 'wallet_cashback'
                                    ? `₹ ${notif.offer.benefitValue}`
                                    : `${notif.offer.benefitValue} Day Free`}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditClick(notif)}
                              className="rounded-xl p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              title="Edit notification"
                              type="button"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteUserNotification(notif.id)}
                              className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete log"
                              type="button"
                            >
                              <Trash2 size={16} />
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
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
            <Bell className="mx-auto text-slate-300 mb-3" size={32} />
            <h4 className="text-sm font-bold text-slate-900">No broadcasts sent</h4>
            <p className="text-xs text-slate-400 mt-1">Sent customer notifications will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserNotifications;
