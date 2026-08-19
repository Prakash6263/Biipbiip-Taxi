import { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ClipboardList, ArrowLeft } from 'lucide-react';

const AddCancelReasons = ({ editReason, onCancel, setActivePage }) => {
  const { addCancelReason, updateCancelReason, toggleCancelReasonStatus } = useApp();
  const [reasonText, setReasonText] = useState('');
  const [reasonTextPt, setReasonTextPt] = useState('');
  const [status, setStatus] = useState('Active');
  const [error, setError] = useState('');

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
    setError('');
  }, [editReason]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reasonText.trim() || !reasonTextPt.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    if (editReason) {
      updateCancelReason(editReason.id, reasonText, reasonTextPt);
      // If status changed in UI from previous value
      if (editReason.status !== status) {
        toggleCancelReasonStatus(editReason.id);
      }
    } else {
      addCancelReason(reasonText, reasonTextPt);
    }

    if (onCancel) {
      onCancel();
    } else if (setActivePage) {
      setActivePage('display-cancel-reasons');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="page-header">
        <p className="breadcrumb-label">CANCEL REASONS</p>
        <h2>{editReason ? 'Edit Cancel Reasons' : 'Add Cancel Reasons'}</h2>
        <p>Create or update trip cancellation reasons with translation details.</p>
      </div>

      {/* Form Container Card */}
      <div className="card overflow-hidden shadow-sm border border-slate-200" style={{ borderRadius: '16px' }}>
        
        {/* Banner Title */}
        <div className="bg-[#0b132b] text-white px-6 py-4 flex items-center gap-3">
          <ClipboardList size={18} className="text-[#00D6CC]" />
          <span className="font-bold text-sm tracking-wider uppercase">Cancel Reasons</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Reason Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter reason in English..."
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-[#00D6CC] text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Reason Text (Portugal) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter reason in Portuguese..."
                  value={reasonTextPt}
                  onChange={(e) => setReasonTextPt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-[#00D6CC] text-slate-800"
                />
              </div>
            </div>

            {/* Right Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Status
              </label>
              
              <div>
                <button
                  type="button"
                  onClick={() => setStatus(status === 'Active' ? 'Deactive' : 'Active')}
                  className="px-6 py-2.5 rounded-lg text-xs font-extrabold text-white transition focus:outline-none tracking-wider uppercase"
                  style={{
                    background: status === 'Active' 
                      ? 'linear-gradient(135deg, #00A7E1 0%, #00D6CC 100%)' 
                      : 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)'
                  }}
                >
                  {status}
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (onCancel) {
                  onCancel();
                } else if (setActivePage) {
                  setActivePage('display-cancel-reasons');
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
            >
              <ArrowLeft size={12} /> Back
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0b132b] hover:bg-black text-[#00D6CC] rounded-xl text-xs font-extrabold transition shadow-sm uppercase tracking-wider"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCancelReasons;
