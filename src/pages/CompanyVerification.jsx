import { useState } from 'react';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import FilePreview from '../components/FilePreview';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';

const CompanyVerification = () => {
  const { state, verifyCompany, rejectCompany } = useApp();
  const [reason, setReason] = useState({});
  const [filter, setFilter] = useState('all');

  const companies = state.companies.filter((company) => (filter === 'all' ? true : company.status === filter));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Company Verification</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'verified', 'rejected'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === item ? 'bg-[#00D6CC] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
          >
            {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {companies.length ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Company</th>
                <th scope="col" className="px-6 py-4 font-bold">Contact Details</th>
                <th scope="col" className="px-6 py-4 font-bold">GST & Address</th>
                <th scope="col" className="px-6 py-4 font-bold">Documents</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="font-bold text-slate-950">{company.companyName}</div>
                    <div className="text-xs text-slate-400 mt-1">Reg: {formatDate(company.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-slate-800">{company.ownerName}</div>
                    <div className="text-xs text-slate-500 mt-1">{company.phone}</div>
                    <div className="text-xs text-slate-400">{company.email}</div>
                  </td>
                  <td className="px-6 py-4 align-top max-w-xs">
                    <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 rounded-lg px-2 py-1 inline-block mb-2">
                      GST: {company.gstNumber || '—'}
                    </div>
                    <div className="text-xs text-slate-500 break-words leading-relaxed">
                      {company.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top min-w-[200px] max-w-[250px]">
                    <FilePreview files={company.documents} />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge status={company.status} />
                      {company.status === 'rejected' && company.rejectionReason && (
                        <div className="mt-2 text-xs font-medium text-rose-700 bg-rose-50 rounded-xl p-2.5 border border-rose-100 max-w-[200px] break-words">
                          <b>Reason:</b> {company.rejectionReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-2 w-full max-w-[240px]">
                      {company.status === 'pending' ? (
                        <>
                          <textarea
                            value={reason[company.id] || ''}
                            onChange={(event) => setReason({ ...reason, [company.id]: event.target.value })}
                            placeholder="Reject reason / internal note"
                            className="min-h-12 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-950 transition-all"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => verifyCompany(company.id)}
                              className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => rejectCompany(company.id, reason[company.id])}
                              className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No actions available</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No companies found" message="Selected filter ke liye koi company nahi mili." />
      )}
    </div>
  );
};

export default CompanyVerification;
