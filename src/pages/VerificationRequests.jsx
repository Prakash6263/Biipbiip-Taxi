import { useState } from 'react';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import FilePreview from '../components/FilePreview';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';
import { ShieldCheck, User, Car, FileText, Phone, Mail } from 'lucide-react';

const VerificationRequests = () => {
  const { state, approveVerificationRequest, rejectVerificationRequest } = useApp();
  const [reason, setReason] = useState({});
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const requests = (state.verificationRequests || []).filter(
    (req) => (filter === 'all' ? true : req.status === filter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Car & Doc Verification</h2>
          <p className="text-sm text-slate-500 mt-1">Review uploaded user documents and car images to approve or reject them.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'verified', 'rejected'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              filter === item
                ? 'bg-[#00D6CC] text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
            }`}
          >
            {item === 'all' ? 'All Requests' : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {requests.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="px-6 py-4">User / Driver</th>
                      <th className="px-6 py-4">Car Details</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                          selectedRequest?.id === req.id ? 'bg-slate-50' : ''
                        }`}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-950">{req.userName}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{req.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                              <Car size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{req.carName}</p>
                              <p className="font-mono text-xs text-slate-400 mt-0.5">{req.registrationNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={req.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(req);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Details Sidebar Panel */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6 sticky top-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-950">Verification Detail</h3>
                  <Badge status={selectedRequest.status} />
                </div>

                <div className="space-y-4">
                  {/* Driver Info */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Driver Contact</h4>
                    <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-slate-400" />
                        <span className="font-semibold">{selectedRequest.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-slate-400" />
                        <span>{selectedRequest.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="text-slate-400" />
                        <span>{selectedRequest.userPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* ID Proof */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Submitted ID Proof</h4>
                    {selectedRequest.document ? (
                      <FilePreview files={[selectedRequest.document]} />
                    ) : (
                      <p className="text-xs text-slate-500 italic">No document uploaded</p>
                    )}
                  </div>

                  {/* Car Images */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Car Images</h4>
                    {selectedRequest.carImages && selectedRequest.carImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedRequest.carImages.map((img, i) => (
                          <div key={i} className="aspect-video w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img
                              src={img.url}
                              alt={`Car preview ${i + 1}`}
                              className="h-full w-full object-cover hover:scale-105 transition duration-200"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No car images uploaded</p>
                    )}
                  </div>

                  {/* Reject / Status Info */}
                  {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                    <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-700">
                      <b>Rejection Reason:</b> {selectedRequest.rejectionReason}
                    </div>
                  )}

                  {/* Actions for Pending Requests */}
                  {selectedRequest.status === 'pending' && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <textarea
                        value={reason[selectedRequest.id] || ''}
                        onChange={(e) => setReason({ ...reason, [selectedRequest.id]: e.target.value })}
                        placeholder="Provide rejection reason..."
                        className="w-full min-h-16 rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#00D6CC] transition-all"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            approveVerificationRequest(selectedRequest.id);
                            setSelectedRequest({ ...selectedRequest, status: 'verified' });
                          }}
                          className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            rejectVerificationRequest(selectedRequest.id, reason[selectedRequest.id]);
                            setSelectedRequest({
                              ...selectedRequest,
                              status: 'rejected',
                              rejectionReason: reason[selectedRequest.id] || 'Documents not clear.',
                            });
                          }}
                          className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-slate-400">
                <ShieldCheck size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">Select a Request</p>
                <p className="text-xs text-slate-400 mt-1">Review detail view by clicking on any table row.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState title="No verification requests found" message="Kuch bhi requests is filter ke liye available nahi hai." />
      )}
    </div>
  );
};

export default VerificationRequests;
