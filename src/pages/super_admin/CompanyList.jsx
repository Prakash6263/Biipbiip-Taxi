import { useState } from 'react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';
import { Search, Building2, MapPin, Phone, Mail } from 'lucide-react';

const CompanyList = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredCompanies = state.companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(search.toLowerCase()) ||
      company.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      company.email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' ? true : company.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Super Admin</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Companies</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'verified', 'pending', 'rejected'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                filter === item
                  ? 'bg-[#00D6CC] text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {filteredCompanies.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Company</th>
                  <th scope="col" className="px-6 py-4 font-bold">Owner Details</th>
                  <th scope="col" className="px-6 py-4 font-bold">Contact & Address</th>
                  <th scope="col" className="px-6 py-4 font-bold">GST Number</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-950">{company.companyName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Reg: {formatDate(company.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{company.ownerName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={13} className="text-slate-400" />
                          <span>{company.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={13} className="text-slate-400" />
                          <span>{company.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={company.address}>
                            {company.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 rounded-lg px-2.5 py-1">
                        {company.gstNumber || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={company.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No companies found" message="Koi company filter and search details se match nahi hui." />
      )}
    </div>
  );
};

export default CompanyList;
