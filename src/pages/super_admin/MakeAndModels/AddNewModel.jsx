import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useMakeModels } from './MakeModelsContext';

const AddNewModel = ({ setActivePage }) => {
  const { makers, addModel } = useMakeModels();
  const [makerId, setMakerId]     = useState('');
  const [modelName, setModelName] = useState('');
  const [status, setStatus]       = useState('active');
  const [errors, setErrors]       = useState({});
  const [success, setSuccess]     = useState(false);

  const validate = () => {
    const e = {};
    if (!makerId)          e.maker     = 'Please select a maker.';
    if (!modelName.trim()) e.modelName = 'Model name is required.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    const maker = makers.find(m => m.id === makerId);
    addModel(makerId, maker.name, modelName.trim(), status);
    setSuccess(true);
    setMakerId('');
    setModelName('');
    setErrors({});
    setTimeout(() => {
      setSuccess(false);
      setActivePage('model-list');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActivePage('model-list')}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Make And Models</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Add New Model</h2>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="text-sm font-semibold">Model added successfully! Redirecting…</span>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-100" style={{ backgroundColor: '#031E3C' }}>
          <h3 className="text-base font-bold text-white tracking-wide uppercase">ADD NEW MODEL</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Maker Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Maker <span className="text-rose-500">*</span>
            </label>
            <select
              value={makerId}
              onChange={e => { setMakerId(e.target.value); setErrors(prev => ({ ...prev, maker: '' })); }}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition appearance-none"
              onFocus={e => e.target.style.borderColor = '#00D6CC'}
              onBlur={e => e.target.style.borderColor = errors.maker ? '#ef4444' : '#e2e8f0'}
            >
              <option value="">Select Maker</option>
              {makers
                .filter(m => m.status === 'active')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(maker => (
                  <option key={maker.id} value={maker.id}>{maker.name}</option>
                ))
              }
            </select>
            {errors.maker && <p className="text-xs font-semibold text-rose-500">{errors.maker}</p>}
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Model Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={modelName}
              onChange={e => { setModelName(e.target.value); setErrors(prev => ({ ...prev, modelName: '' })); }}
              placeholder="e.g. Camry"
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition"
              onFocus={e => e.target.style.borderColor = '#00D6CC'}
              onBlur={e => e.target.style.borderColor = errors.modelName ? '#ef4444' : '#e2e8f0'}
            />
            {errors.modelName && <p className="text-xs font-semibold text-rose-500">{errors.modelName}</p>}
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
                      ? { background: 'linear-gradient(135deg, #FFA447, #EB93C6)', color: '#fff' }
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
              className="rounded-2xl px-10 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#031E3C', boxShadow: '0 4px 14px rgba(3,30,60,0.3)' }}
            >
              ADD NEW MODEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewModel;
