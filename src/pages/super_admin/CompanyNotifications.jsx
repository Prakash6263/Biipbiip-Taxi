import {
  Bell,
  Trash2,
  Megaphone,
  AlertTriangle,
  Ticket,
  Pencil,
  Plus,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';

const CompanyNotifications = ({ setActivePage, setSelectedNotificationId }) => {
  const { state, deleteCompanyNotification } = useApp();
  const notifications = state.companyNotifications || [];

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Company Notifications & Offers</h2>
        </div>
        <button
          onClick={() => {
            setSelectedNotificationId(null);
            setActivePage('create-company-notification');
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#00D6CC] text-white py-3 px-5 font-bold shadow-md hover:bg-[#00c2b9] hover:shadow-lg transition-all text-sm self-start sm:self-center"
          type="button"
        >
          <Plus size={16} /> Create Company Broadcast
        </button>
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedNotificationId(notif.id);
                                setActivePage('create-company-notification');
                              }}
                              className="rounded-xl p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              title="Edit notification"
                              type="button"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteCompanyNotification(notif.id)}
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
