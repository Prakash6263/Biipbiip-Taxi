import { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const AddCancelReasons = ({ editReason, onCancel, setActivePage }) => {
  const { addCancelReason, updateCancelReason, toggleCancelReasonStatus } = useApp();
  const [reasonText, setReasonText] = useState('');
  const [reasonTextPt, setReasonTextPt] = useState('');
  const [status, setStatus] = useState('Active');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editReason) {
      setReasonText(editReason.reasonText || '');
      setReasonTextPt(editReason.reasonTextPt || '');
      setStatus(editReason.status || 'Active');
    } else {
      setReasonText('');
      setReasonTextPt('');
      setStatus('Active');
    }
    setSuccess(false);
    setErrors({});
  }, [editReason]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tempErrors = {};
    if (!reasonText.trim()) {
      tempErrors.reasonText = 'Reason Text is required.';
    }
    if (!reasonTextPt.trim()) {
      tempErrors.reasonTextPt = 'Reason Text (Portugal) is required.';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    if (editReason) {
      updateCancelReason(editReason.id, reasonText, reasonTextPt);
      if (editReason.status !== status) {
        toggleCancelReasonStatus(editReason.id);
      }
    } else {
      addCancelReason(reasonText, reasonTextPt);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      if (onCancel) {
        onCancel();
      } else if (setActivePage) {
        setActivePage('display-cancel-reasons');
      }
    }, 1200);
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else if (setActivePage) {
      setActivePage('display-cancel-reasons');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: '#00D6CC' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Cancel Reasons</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            {editReason ? 'Edit Cancel Reason' : 'Add Cancel Reason'}
          </h2>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="text-sm font-semibold">
            {editReason ? 'Reason updated successfully! Redirecting…' : 'Reason added successfully! Redirecting…'}
          </span>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-100" style={{ backgroundColor: '#002E5B' }}>
          <h3 className="text-base font-bold text-white tracking-wide uppercase">
            {editReason ? 'EDIT CANCEL REASONS' : 'ADD CANCEL REASONS'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              {/* Reason Text English */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                  Reason Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter reason in English..."
                  value={reasonText}
                  onChange={(e) => { setReasonText(e.target.value); setErrors(prev => ({ ...prev, reasonText: '' })); }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#00D6CC'}
                  onBlur={e => e.target.style.borderColor = errors.reasonText ? '#ef4444' : '#e2e8f0'}
                />
                {errors.reasonText && <p className="text-xs font-semibold text-rose-500">{errors.reasonText}</p>}
              </div>

              {/* Reason Text Portugal */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                  Reason Text (Portugal) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter reason in Portuguese..."
                  value={reasonTextPt}
                  onChange={(e) => { setReasonTextPt(e.target.value); setErrors(prev => ({ ...prev, reasonTextPt: '' })); }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#00D6CC'}
                  onBlur={e => e.target.style.borderColor = errors.reasonTextPt ? '#ef4444' : '#e2e8f0'}
                />
                {errors.reasonTextPt && <p className="text-xs font-semibold text-rose-500">{errors.reasonTextPt}</p>}
              </div>
            </div>

            {/* Right Column: Status */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Status</label>
              <div className="flex gap-3">
                {['Active', 'Deactive'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className="rounded-xl px-5 py-2 text-sm font-bold capitalize transition"
                    style={
                      status === s
                        ? { backgroundColor: '#00D6CC', color: '#fff' }
                        : { backgroundColor: '#f1f5f9', color: '#64748b' }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 uppercase tracking-wide"
              style={{ backgroundColor: '#002E5B', boxShadow: '0 4px 14px rgba(0, 46, 91, 0.2)' }}
            >
              {editReason ? 'UPDATE CANCEL REASONS' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCancelReasons;
