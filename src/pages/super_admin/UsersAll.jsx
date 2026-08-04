import { useState, useMemo } from 'react';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { Search, User, Mail } from 'lucide-react';

const UsersAll = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const normalUsers = useMemo(() => {
    return (state.users || []).filter(
      (u) => u.role !== 'admin' && u.role !== 'super_admin'
    );
  }, [state.users]);

  const filteredUsers = normalUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">All Users</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" />
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] focus:ring-1 focus:ring-[#00D6CC] transition"
          />
        </div>
      </div>

      {filteredUsers.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-[#00D6CC]/10 p-2.5 text-[#00D6CC]">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-950">{u.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={13} className="text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 capitalize">
                        {u.role || 'user'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No users found" message="No normal users match the search criteria." />
      )}
    </div>
  );
};

export default UsersAll;
