import { Building2, Car, ClipboardList, Home, LogOut, Menu, RefreshCcw, ShieldCheck, UserPlus, X, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

const navConfig = {
  super_admin: [
    { key: 'super-dashboard', label: 'Dashboard', icon: Home },
    {
      key: 'company-group',
      label: 'Company',
      icon: Building2,
      submenu: [
        { key: 'companies-list', label: 'Companies' },
        { key: 'companies-verification', label: 'Document & Verification' },
      ],
    },
    {
      key: 'driver-group',
      label: 'Driver',
      icon: Users,
      submenu: [
        { key: 'drivers-list', label: 'Drivers' },
        { key: 'drivers-verification', label: 'Document & Verification' },
      ],
    },
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
  const [expanded, setExpanded] = useState({});

  const toggleGroup = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full flex-col text-white" style={{ backgroundColor: '#031E3C' }}>
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="BIIPBIIP Logo" className="h-8 w-25 rounded-xl object-cover shadow-sm" />
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {items.map((item) => {
          if (item.submenu) {
            const Icon = item.icon;
            const hasActiveSub = item.submenu.some(
              (sub) =>
                activePage === sub.key ||
                (sub.key === 'drivers-verification' && activePage === 'verification-detail') ||
                (sub.key === 'companies-verification' && activePage === 'company-verification-detail')
            );
            const isOpen = expanded[item.key] ?? hasActiveSub;

            return (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.key)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isOpen && (
                  <div className="pl-4 space-y-1 border-l border-white/10 ml-6">
                    {item.submenu.map((sub) => {
                      const subActive =
                        activePage === sub.key ||
                        (sub.key === 'drivers-verification' && activePage === 'verification-detail') ||
                        (sub.key === 'companies-verification' && activePage === 'company-verification-detail');
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setActivePage(sub.key);
                            closeMobile?.();
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-xs font-semibold transition ${
                            subActive ? '' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                          style={subActive ? { backgroundColor: '#00D6CC', color: '#ffffff' } : {}}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          const active = activePage === item.key || 
            (item.key === 'verification-requests' && activePage === 'verification-detail') ||
            (item.key === 'cars' && activePage === 'car-detail');
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
              <div className="flex items-center gap-2 bg-[#031E3C] px-3 py-1 rounded-xl shadow-sm">
                <img src="/logo.png" alt="BIIPBIIP Logo" className="h-6 object-contain" />
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
