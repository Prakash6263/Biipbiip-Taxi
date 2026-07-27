import { useState } from 'react';
import Badge from '../../components/Badge';
import FilePreview from '../../components/FilePreview';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { Building2, Phone, Mail, ArrowLeft, ShieldAlert, MapPin } from 'lucide-react';

const CompanyVerificationDetail = ({ companyId, setActivePage }) => {
  const { state, verifyCompany, rejectCompany } = useApp();
  const [reason, setReason] = useState('');

  const company = (state.companies || []).find((c) => c.id === companyId);

  if (!company) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 max-w-lg mx-auto mt-12">
        <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-950">Company Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">The company verification request you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => setActivePage('companies-verification')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#00D6CC] px-5 py-2.5 font-bold text-white hover:opacity-90 transition"
        >
          <ArrowLeft size={16} /> Back to Verification List
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
            onClick={() => setActivePage('companies-verification')}
            className="group flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            title="Go Back"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Company Verification Detail</span>
              <Badge status={company.status} />
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              {company.companyName}
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Submitted: {formatDate(company.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Company & Owner Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Company Information Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-[#00D6CC]" /> Company Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Company Name</p>
                <p className="text-sm font-semibold text-slate-950">{company.companyName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">GST Number</p>
                <p className="text-sm font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded w-max">
                  {company.gstNumber || '—'}
                </p>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs text-slate-400 font-medium">Address</p>
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{company.address || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Info Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-[#00D6CC]" /> Owner Contact Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Owner Name</p>
                <p className="text-sm font-semibold text-slate-950">{company.ownerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail size={14} className="text-slate-400" />
                  <span>{company.email}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone size={14} className="text-slate-400" />
                  <span>{company.phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Documents Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft space-y-6">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
              Submitted Documents
            </h3>
            {company.documents && company.documents.length > 0 ? (
              <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:border-slate-200 transition">
                <FilePreview files={company.documents} />
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                No documents uploaded.
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
              <Badge status={company.status} />
            </div>

            {/* Rejection Details */}
            {company.status === 'rejected' && company.rejectionReason && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-700">
                <p className="font-bold">Rejection Reason:</p>
                <p className="mt-1">{company.rejectionReason}</p>
              </div>
            )}

            {/* Actions for Pending Verification */}
            {company.status === 'pending' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">
                    REJECTION REASON (OPTIONAL)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="E.g., GST document is not matching, blurry details..."
                    className="w-full min-h-24 rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-[#00D6CC] transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      verifyCompany(company.id);
                    }}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    Verify Company
                  </button>
                  <button
                    onClick={() => {
                      rejectCompany(company.id, reason);
                    }}
                    className="w-full rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition shadow-sm"
                  >
                    Reject Company
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-medium">
                No pending actions. This request is already {company.status}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyVerificationDetail;
