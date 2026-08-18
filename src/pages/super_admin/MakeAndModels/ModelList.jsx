import { useState, useMemo, useEffect } from 'react';
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react';
import { useMakeModels } from './MakeModelsContext';

const ModelList = ({ setActivePage }) => {
  const { makers, models, updateModel, deleteModel } = useMakeModels();
  const [search, setSearch]             = useState('');
  const [filterMaker, setFilterMaker]   = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const [editingId, setEditingId]       = useState(null);
  const [editName, setEditName]         = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => { setCurrentPage(1); }, [search, filterMaker]);

  const filtered = useMemo(() =>
    models.filter(m => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.makerName.toLowerCase().includes(search.toLowerCase());
      const matchMaker = filterMaker === 'all' || m.makerId === filterMaker;
      return matchSearch && matchMaker;
    }),
    [models, search, filterMaker]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (model) => {
    setEditingId(model.id);
    setEditName(model.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) updateModel(editingId, { name: editName.trim() });
    setEditingId(null);
    setEditName('');
  };

  const handleToggleStatus = (model) => {
    updateModel(model.id, { status: model.status === 'active' ? 'inactive' : 'active' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Make And Models</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Model List</h2>
        </div>
        <button
          onClick={() => setActivePage('add-new-model')}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: '#00D6CC', boxShadow: '0 4px 14px rgba(0,214,204,0.3)' }}
        >
          <Plus size={16} /> Add New Model
        </button>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4 flex-wrap">
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search model / brand..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-56 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition"
                onFocus={e => e.target.style.borderColor = '#00D6CC'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            {/* Maker filter */}
            <select
              value={filterMaker}
              onChange={e => setFilterMaker(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none transition"
              onFocus={e => e.target.style.borderColor = '#00D6CC'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            >
              <option value="all">All Makers</option>
              {makers.map(mk => (
                <option key={mk.id} value={mk.id}>{mk.name}</option>
              ))}
            </select>
          </div>
          <span className="text-xs font-medium text-slate-400">{filtered.length} models found</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">#</th>
                <th className="px-6 py-4 font-bold">Brand Name</th>
                <th className="px-6 py-4 font-bold">Model Name</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((model, idx) => (
                <tr key={model.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-semibold text-xs">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>

                  {/* Brand Name */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700">{model.makerName}</span>
                  </td>

                  {/* Model Name — inline edit */}
                  <td className="px-6 py-4">
                    {editingId === model.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                        className="rounded-xl border px-3 py-1.5 text-sm outline-none w-40"
                        style={{ borderColor: '#00D6CC' }}
                      />
                    ) : (
                      <span className="font-semibold text-slate-900">{model.name}</span>
                    )}
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(model)}
                      className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition"
                      style={
                        model.status === 'active'
                          ? { backgroundColor: '#031E3C', color: '#00D6CC' }
                          : { backgroundColor: '#f1f5f9', color: '#94a3b8' }
                      }
                    >
                      {model.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {deleteConfirmId === model.id ? (
                      <div className="inline-flex items-center gap-2">
                        <span className="text-xs text-slate-500">Delete?</span>
                        <button
                          onClick={() => { deleteModel(model.id); setDeleteConfirmId(null); }}
                          className="rounded-lg bg-rose-500 p-1.5 text-white hover:bg-rose-600 transition"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded-lg bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : editingId === model.id ? (
                      <div className="inline-flex items-center gap-2">
                        <button onClick={handleSaveEdit} className="rounded-lg p-1.5 text-white transition" style={{ backgroundColor: '#00D6CC' }}>
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="rounded-lg bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300 transition">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(model)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-[#00D6CC] transition"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(model.id)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-6 py-4">
          <span className="text-xs font-medium text-slate-500">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs transition"
                  style={
                    currentPage === p
                      ? { backgroundColor: '#00D6CC', color: '#fff' }
                      : { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569' }
                  }
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && <span className="text-slate-400 text-xs">…{totalPages}</span>}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelList;
