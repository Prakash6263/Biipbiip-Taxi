import { Building2, Car, ClipboardList, Home, LogOut, Menu, RefreshCcw, ShieldCheck, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

const navConfig = {
  super_admin: [
    { key: 'super-dashboard', label: 'Dashboard', icon: Home },
    { key: 'companies', label: 'Company Verification', icon: ShieldCheck },
    { key: 'verification-requests', label: 'Car & Doc Verification', icon: ShieldCheck },
  ],
  admin: [
    { key: 'admin-dashboard', label: 'Dashboard', icon: Home },
    { key: 'cars', label: 'Cars', icon: Car },
    { key: 'requests', label: 'Rent Requests', icon: ClipboardList },
    { key: 'company-profile', label: 'Company Profile', icon: Building2 },
  ],
  public: [
    { key: 'login', label: 'Login', icon: ShieldCheck },
  ],
};

const SidebarContent = ({ items, activePage, setActivePage, closeMobile }) => {
  const { currentUser, logout, resetDemoData } = useApp();

  return (
    <div className="flex h-full flex-col text-white" style={{ backgroundColor: '#031E3C' }}>
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="BIIPBIIP Logo" className="h-11 w-11 rounded-xl object-cover shadow-sm" />
          <div>
            <h1 className="text-lg font-bold">biip-biip</h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setActivePage(item.key);
                closeMobile?.();
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${active ? '' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              style={active ? { backgroundColor: '#00D6CC', color: '#ffffff' } : {}}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        {currentUser ? (
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-sm font-semibold text-white">{currentUser.name}</p>
            <p className="truncate text-xs text-slate-400">{currentUser.email}</p>
          </div>
        ) : null}
        {currentUser ? (
          <button
            onClick={() => {
              logout();
              setActivePage('login');
              closeMobile?.();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <LogOut size={16} /> Logout
          </button>
        ) : null}
      </div>
    </div>
  );
};

const Layout = ({ activePage, setActivePage, children }) => {
  const { currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const role = currentUser?.role || 'public';

  const items = useMemo(() => navConfig[role] || navConfig.public, [role]);
  const showSidebar = !!currentUser;

  if (!currentUser) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-white lg:flex">
      {showSidebar && (
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="fixed inset-y-0 w-72">
            <SidebarContent items={items} activePage={activePage} setActivePage={setActivePage} />
          </div>
        </aside>
      )}

      {showSidebar && open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-80 max-w-[85vw]">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-slate-950">
              <X size={18} />
            </button>
            <SidebarContent items={items} activePage={activePage} setActivePage={setActivePage} closeMobile={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 flex-1">
        {showSidebar && (
          <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur lg:hidden" style={{ borderBottomColor: '#00D6CC', borderBottomWidth: '2px' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-700">
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="BIIPBIIP Logo" className="h-7 w-7 rounded-lg object-cover" />
                <p className="font-bold text-slate-950">BIIPBIIP</p>
              </div>
              <span className="w-9" />
            </div>
          </header>
        )}
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
