import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useMakeModels } from './MakeModelsContext';

const AddNewMaker = ({ setActivePage }) => {
  const { addMaker } = useMakeModels();
  const [brandName, setBrandName] = useState('');
  const [status, setStatus]       = useState('active');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setError('Brand name is required.');
      return;
    }
    addMaker(brandName.trim(), status);
    setSuccess(true);
    setBrandName('');
    setError('');
    setTimeout(() => {
      setSuccess(false);
      setActivePage('makers-list');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActivePage('makers-list')}
          className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: '#00D6CC' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Make And Models</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Add New Maker</h2>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="text-sm font-semibold">Maker added successfully! Redirecting…</span>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-100" style={{ backgroundColor: '#002E5B' }}>
          <h3 className="text-base font-bold text-white tracking-wide uppercase">ADD NEW BRAND</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Brand Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={brandName}
              onChange={e => { setBrandName(e.target.value); setError(''); }}
              placeholder="e.g. Toyota"
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition"
              onFocus={e => e.target.style.borderColor = '#00D6CC'}
              onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0'}
            />
            {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
            <div className="flex gap-3">
              {['active', 'inactive'].map(s => (
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
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#002E5B', boxShadow: '0 4px 14px rgba(0, 46, 91, 0.2)' }}
            >
              ADD NEW BRAND
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewMaker;
