import { Fragment, useState } from 'react';
import { UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import FilePreview from '../../components/FilePreview';
import { useApp } from '../../context/AppContext';
import { currency, formatDate, readFileAsDataUrl } from '../../utils/storage';

const RentRequests = () => {
  const { state, currentUser, uploadUserDocuments, approveRentalRequest, rejectRentalRequest, markReturned } = useApp();
  const company = state.companies.find((item) => item.id === currentUser?.companyId);
  const requests = state.rentalRequests.filter((request) => request.companyId === company?.id);
  const [docs, setDocs] = useState({});
  const [notes, setNotes] = useState({});
  const [filter, setFilter] = useState('all');
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  const filteredRequests = requests.filter((request) => (filter === 'all' ? true : request.status === filter));

  const uploadDocs = async (requestId) => {
    const files = docs[requestId];
    if (!files?.length) return;
    const uploadedDocs = await Promise.all(Array.from(files).map(readFileAsDataUrl));
    uploadUserDocuments({ requestId, documents: uploadedDocs.filter(Boolean), adminNotes: notes[requestId] });
    setDocs({ ...docs, [requestId]: null });
  };

  const toggleExpand = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Admin</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Rent Requests</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'active', 'returned', 'rejected'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              filter === item
                ? 'text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
            style={filter === item ? { backgroundColor: '#00D6CC', boxShadow: '0 4px 12px rgba(0, 214, 204, 0.2)' } : {}}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredRequests.length ? (
        /* TABLE VIEW ONLY */
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-600 font-semibold">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Car</th>
                  <th className="px-6 py-4">Rental Duration</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => {
                  const car = state.cars.find((item) => item.id === request.carId);
                  const days = Math.max(1, Math.ceil((new Date(request.returnDate) - new Date(request.pickupDate)) / 86400000));
                  const amount = Number(car?.pricePerDay || 0) * days;
                  const isExpanded = expandedRequestId === request.id;

                  return (
                    <Fragment key={request.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-950">{request.customerName}</div>
                          <div className="text-xs text-slate-500">{request.customerEmail}</div>
                          <div className="text-xs text-slate-400">{request.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">{car?.name || 'Deleted car'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{days} {days === 1 ? 'day' : 'days'}</div>
                          <div className="text-xs text-slate-500">{request.pickupDate} to {request.returnDate}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-950">
                          {currency(amount)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={request.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === 'active' && (
                              <button
                                onClick={() => markReturned(request.id)}
                                className="rounded-xl bg-[#00D6CC] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition"
                              >
                                Mark Returned
                              </button>
                            )}
                            <button
                              onClick={() => toggleExpand(request.id)}
                              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${isExpanded
                                  ? 'bg-slate-100 text-slate-800'
                                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300'
                                }`}
                            >
                              <span>{isExpanded ? 'Hide Details' : 'Manage Docs'}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan="6" className="px-6 py-5 border-t border-slate-100">
                            <div className="max-w-4xl space-y-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pickup Details</h4>
                                  <p className="mt-1 text-sm font-semibold text-slate-950">{request.pickupLocation}</p>
                                  <p className="text-xs text-slate-500">Requested at: {formatDate(request.createdAt)}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">User Documents</h4>
                                  <div className="mt-1">
                                    <FilePreview files={request.userDocuments} />
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <h4 className="font-bold text-slate-950 text-sm">Upload documents after office verification</h4>
                                <p className="mt-1 text-xs text-slate-500">Upload documents such as Driving License, Aadhaar, and Address Proof.</p>
                                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                                  <input
                                    type="file"
                                    multiple
                                    onChange={(event) => setDocs({ ...docs, [request.id]: event.target.files })}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-950 bg-slate-50"
                                  />
                                  <button
                                    onClick={() => uploadDocs(request.id)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00D6CC] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition"
                                  >
                                    <UploadCloud size={14} /> Upload
                                  </button>
                                </div>
                                <textarea
                                  value={notes[request.id] || request.adminNotes || ''}
                                  onChange={(event) => setNotes({ ...notes, [request.id]: event.target.value })}
                                  placeholder="Admin notes"
                                  className="mt-3 min-h-16 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-950"
                                />
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                  onClick={() => approveRentalRequest(request.id)}
                                  disabled={request.status !== 'pending' || !request.userDocuments?.length}
                                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 transition"
                                >
                                  Approve & Rent Car
                                </button>
                                <button
                                  onClick={() => rejectRentalRequest(request.id, notes[request.id])}
                                  disabled={request.status !== 'pending'}
                                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300 transition"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => markReturned(request.id)}
                                  disabled={request.status !== 'active'}
                                  className="rounded-xl bg-[#00D6CC] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 transition"
                                >
                                  Mark Returned
                                </button>
                                {!request.userDocuments?.length && request.status === 'pending' && (
                                  <span className="text-xs font-semibold text-amber-700 self-center">
                                    The approve button will be enabled after documents are uploaded.
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No requests found" message="Try changing the filters or submit a new request." />
      )}
    </div>
  );
};

export default RentRequests;
