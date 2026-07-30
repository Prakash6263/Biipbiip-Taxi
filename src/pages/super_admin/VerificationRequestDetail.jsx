import { useState } from 'react';
import Badge from '../../components/Badge';
import FilePreview from '../../components/FilePreview';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { User, Car, Phone, Mail, ArrowLeft, ShieldAlert } from 'lucide-react';

const VerificationRequestDetail = ({ verificationId, setActivePage }) => {
  const { state, approveVerificationRequest, rejectVerificationRequest } = useApp();
  const [reason, setReason] = useState('');

  const req = (state.verificationRequests || []).find((r) => r.id === verificationId);

  if (!req) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 max-w-lg mx-auto mt-12">
        <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-950">Request Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">The verification request you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => setActivePage('verification-requests')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#00D6CC] px-5 py-2.5 font-bold text-white hover:opacity-90 transition"
        >
          <ArrowLeft size={16} /> Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header / Back Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActivePage('verification-requests')}
            className="group flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            title="Go Back"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Verification Detail</span>
              <Badge status={req.status} />
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              Request from {req.userName}
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Submitted: {formatDate(req.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Driver Contact & Submitted Documents Info */}
        <div className="md:col-span-2 space-y-6">
          {/* User Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User size={18} className="text-[#00D6CC]" /> Driver Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Full Name</p>
                <p className="text-sm font-semibold text-slate-950">{req.userName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail size={14} className="text-slate-400" />
                  <span>{req.userEmail}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone size={14} className="text-slate-400" />
                  <span>{req.userPhone}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Associated Company ID</p>
                <p className="text-sm font-mono text-slate-600">{req.companyId || '—'}</p>
              </div>
            </div>
          </div>

          {/* Submitted Documents Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
              Submitted Documents
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {/* National ID */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:border-slate-200 transition space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
                      <User size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">National ID</span>
                  </div>
                  
                  {req.nationalId?.front || req.nationalId?.back ? (
                    <div className="space-y-4">
                      {req.nationalId.front && (
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Front Side</span>
                          <p className="text-sm font-semibold text-slate-850 truncate">{req.nationalId.front.name}</p>
                          <FilePreview files={[req.nationalId.front]} />
                        </div>
                      )}
                      {req.nationalId.back && (
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Back Side</span>
                          <p className="text-sm font-semibold text-slate-850 truncate">{req.nationalId.back.name}</p>
                          <FilePreview files={[req.nationalId.back]} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Not Uploaded</p>
                  )}
                </div>
              </div>

              {/* Driver License */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:border-slate-200 transition space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                      <ShieldAlert size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Driver License</span>
                  </div>
                  
                  {req.driverLicense?.front || req.driverLicense?.back || req.document ? (
                    <div className="space-y-4">
                      {(req.driverLicense?.front || req.document) && (
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Front Side</span>
                          <p className="text-sm font-semibold text-slate-850 truncate">{(req.driverLicense?.front || req.document).name}</p>
                          <FilePreview files={[req.driverLicense?.front || req.document]} />
                        </div>
                      )}
                      {req.driverLicense?.back && (
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Back Side</span>
                          <p className="text-sm font-semibold text-slate-850 truncate">{req.driverLicense.back.name}</p>
                          <FilePreview files={[req.driverLicense.back]} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Not Uploaded</p>
                  )}
                </div>
              </div>

              {/* Vehicle Registration */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:border-slate-200 transition space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                      <Car size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Registration</span>
                  </div>
                  {req.vehicleRegistration || req.vehicleRegistrationBack ? (
                    <div className="space-y-4">
                      {req.vehicleRegistration && (
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Front Side</span>
                          <p className="text-sm font-semibold text-slate-850 truncate">{req.vehicleRegistration.name}</p>
                          <FilePreview files={[req.vehicleRegistration]} />
                        </div>
                      )}
                      {req.vehicleRegistrationBack && (
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Back Side</span>
                          <p className="text-sm font-semibold text-slate-850 truncate">{req.vehicleRegistrationBack.name}</p>
                          <FilePreview files={[req.vehicleRegistrationBack]} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Not Uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Car Specifications Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Car size={18} className="text-[#00D6CC]" /> Car Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Car Name / Model</p>
                <p className="text-sm font-semibold text-slate-950">{req.carName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Registration Number</p>
                <p className="text-sm font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded w-max">
                  {req.registrationNo}
                </p>
              </div>
            </div>
            {req.carImages && req.carImages.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs text-slate-400 font-medium mb-2">Car Images</p>
                <div className="grid grid-cols-2 gap-4">
                  {req.carImages.map((img, i) => (
                    <div key={i} className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                      <img
                        src={img.url}
                        alt={`Car Preview ${i + 1}`}
                        className="h-full w-full object-cover hover:scale-105 transition duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                No car images uploaded.
              </div>
            )}
          </div>
        </div>

        {/* Action Panel Column */}
        <div className="md:col-span-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6 sticky top-6">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
              Status & Actions
            </h3>

            {/* Status Information */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span className="text-sm text-slate-500 font-medium">Current Status</span>
              <Badge status={req.status} />
            </div>

            {/* Rejection Details */}
            {req.status === 'rejected' && req.rejectionReason && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-700">
                <p className="font-bold">Rejection Reason:</p>
                <p className="mt-1">{req.rejectionReason}</p>
              </div>
            )}

            {/* Actions for Pending Verification */}
            {req.status === 'pending' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">
                    REJECTION REASON (OPTIONAL)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="E.g., Document details are blurry, incorrect registration number..."
                    className="w-full min-h-24 rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-[#00D6CC] transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      approveVerificationRequest(req.id);
                    }}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      rejectVerificationRequest(req.id, reason);
                    }}
                    className="w-full rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition shadow-sm"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-medium">
                No pending actions. This request is already {req.status}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestDetail;
