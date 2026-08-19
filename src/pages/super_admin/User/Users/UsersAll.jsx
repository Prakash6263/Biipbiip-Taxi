import { useState, useMemo, useEffect } from 'react';
import EmptyState from '../../../../components/EmptyState';
import { useApp } from '../../../../context/AppContext';
import { Search, User, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

const UsersAll = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Demo data
  const demoUsers = [
    { id: 'USR001', name: 'Rahul Sharma', email: 'rahul.sharma@email.com', role: 'user' },
    { id: 'USR002', name: 'Priya Patel', email: 'priya.patel@email.com', role: 'user' },
    { id: 'USR003', name: 'Amit Kumar', email: 'amit.kumar@email.com', role: 'user' },
    { id: 'USR004', name: 'Sneha Reddy', email: 'sneha.reddy@email.com', role: 'user' },
    { id: 'USR005', name: 'Vikram Singh', email: 'vikram.singh@email.com', role: 'user' },
    { id: 'USR006', name: 'Anjali Mehta', email: 'anjali.mehta@email.com', role: 'user' },
    { id: 'USR007', name: 'Rajesh Gupta', email: 'rajesh.gupta@email.com', role: 'user' },
    { id: 'USR008', name: 'Kavita Joshi', email: 'kavita.joshi@email.com', role: 'user' },
  ];

  const normalUsers = useMemo(() => {
    const users = demoUsers;
    return users.filter(
      (u) => u.role !== 'admin' && u.role !== 'super_admin'
    );
  }, [state.users]);

  const filteredUsers = useMemo(() => {
    return normalUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [normalUsers, search]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="breadcrumb-label">Management</p>
        <h2>All Users</h2>
        <p>Manage passenger accounts registered on the platform.</p>
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
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00D6CC] transition"
            onFocus={(e) => e.target.style.borderColor = '#00D6CC'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {filteredUsers.length ? (
        <div className="card card-table p-2">
          <div className="card-body table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th className="font-bold text-slate-400">User</th>
                  <th className="font-bold text-slate-400">Email</th>
                  <th className="font-bold text-slate-400 text-center">Role</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* USER column */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm uppercase text-white"
                          style={{ backgroundColor: '#031E3C' }}
                        >
                          {u.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL column */}
                    <td>
                      <div className="text-sm text-slate-700">{u.email}</div>
                    </td>

                    {/* ROLE column */}
                    <td className="text-center">
                      <span
                        className="inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-bold capitalize"
                        style={{ color: '#031E3C', borderColor: 'rgba(3, 30, 60, 0.2)', backgroundColor: 'rgba(3, 30, 60, 0.04)' }}
                      >
                        {u.role || 'user'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {filteredUsers.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-4 px-6 bg-slate-50/20 text-xs font-medium text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
              </span>
              <div className="flex items-center gap-1.5 self-end">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 disabled:hover:bg-white transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages || 1 }).map((_, index) => {
                  const pageNum = index + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      style={isActive ? { backgroundColor: '#00D6CC', borderColor: '#00D6CC' } : {}}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                  disabled={currentPage === (totalPages || 1)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-300 disabled:hover:bg-white transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No users found" message="No normal users match the search criteria." />
      )}
    </div>
  );
};

export default UsersAll;
