import { useMemo, useState, useEffect } from 'react';
import { 
  Building2, Car, ClipboardList, Home, LogOut, Menu, ShieldCheck, 
  X, ChevronDown, ChevronUp, Users, User, Bell, Ticket, 
  TrendingUp, Wrench, Search, Sun, Moon 
} from 'lucide-react';
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
        { key: 'companies-verification', label: 'Company Verification' },
        { key: 'company-car-verification', label: 'Car Verification' },
      ],
    },
    {
      key: 'driver-group',
      label: 'Driver',
      icon: Users,
      submenu: [
        { key: 'drivers-list', label: 'Drivers' },
        { key: 'drivers-verification', label: 'Document & Verification' },
        { key: 'driver-rides', label: 'Driver Rides' },
      ],
    },
    {
      key: 'user-group',
      label: 'User',
      icon: User,
      submenu: [
        { key: 'users-all', label: 'Users All' },
        { key: 'rental-bookings', label: 'Rental Booking' },
        { key: 'taxi-bookings', label: 'Taxi Booking' },
      ],
    },
    {
      key: 'notifications-group',
      label: 'Notification',
      icon: Bell,
      submenu: [
        { key: 'user-notifications', label: 'User' },
        { key: 'driver-notifications', label: 'Driver' },
        { key: 'company-notifications', label: 'Company' },
      ],
    },
    { key: 'coupons', label: 'Coupons', icon: Ticket },
    {
      key: 'earning-group',
      label: 'Earning Reports',
      icon: TrendingUp,
      submenu: [
        { key: 'driver-payment-reports', label: 'Driver Payment Reports' },
        { key: 'company-payment-reports', label: 'Company Payment Reports' },
      ],
    },
    {
      key: 'make-models-group',
      label: 'Make And Models',
      icon: Wrench,
      submenu: [
        { key: 'makers-list',    label: 'Makers List'    },
        { key: 'add-new-maker', label: 'Add New Maker'  },
        { key: 'model-list',    label: 'Model List'     },
        { key: 'add-new-model', label: 'Add New Model'  },
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

const SidebarContent = ({ items, activePage, setActivePage, themeMode, closeMobile }) => {
  const { logout } = useApp();
  const [expanded, setExpanded] = useState({});
  const isDark = themeMode === 'dark';

  const toggleGroup = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full flex-col text-white" style={{ backgroundColor: isDark ? '#111A2E' : '#002E5B' }}>
      
      {/* Sidebar Header Brand Title */}
      <div className="px-6 py-4 border-b border-white/10 shrink-0 flex items-center justify-start">
        <img src="/logo.png" alt="BIIPBIIP Logo" className="h-8 object-contain" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 py-4 overflow-y-auto">
        {items.map((item) => {
          if (item.submenu) {
            const Icon = item.icon;
            const hasActiveSub = item.submenu.some(
              (sub) =>
                activePage === sub.key ||
                (sub.key === 'drivers-verification' && activePage === 'verification-detail') ||
                (sub.key === 'companies-verification' && activePage === 'company-verification-detail') ||
                (sub.key === 'company-car-verification' && activePage === 'company-car-detail')
            );
            const isOpen = expanded[item.key] ?? hasActiveSub;

            return (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.key)}
                  className="flex w-full items-center justify-between px-6 py-3 text-left text-sm font-semibold transition hover:bg-white/10 text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-white" />
                    <span>{item.label}</span>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-white" /> : <ChevronDown size={16} className="text-white" />}
                </button>

                {isOpen && (
                  <div className="pl-4 space-y-1 ml-6 border-l border-white/15">
                    {item.submenu.map((sub) => {
                      const subActive =
                        activePage === sub.key ||
                        (sub.key === 'drivers-verification' && activePage === 'verification-detail') ||
                        (sub.key === 'companies-verification' && activePage === 'company-verification-detail') ||
                        (sub.key === 'company-car-verification' && activePage === 'company-car-detail');
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setActivePage(sub.key);
                            closeMobile?.();
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-xs font-semibold transition ${
                            subActive ? 'text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                          style={subActive ? { backgroundColor: '#00D6CC' } : {}}
                        >
                          <span>{sub.label}</span>
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
            <div key={item.key} className="px-3">
              <button
                onClick={() => {
                  setActivePage(item.key);
                  closeMobile?.();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active ? 'text-white shadow-md' : 'text-white hover:bg-white/10'
                }`}
                style={active ? { backgroundColor: '#00D6CC' } : {}}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-white" />
                  <span>{item.label}</span>
                </div>
              </button>
            </div>
          );
        })}

        {/* Manual Logout menu item at the bottom of sidebar list */}
        <div className="px-3 pt-4 border-t border-white/10 mt-4">
          <button
            onClick={() => {
              logout();
              setActivePage('login');
              closeMobile?.();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition text-white hover:bg-white/10"
          >
            <LogOut size={18} className="text-white" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

const Layout = ({ activePage, setActivePage, children }) => {
  const { currentUser, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return sessionStorage.getItem('data-layout-mode') || 'light';
  });
  const role = currentUser?.role || 'public';

  // Synchronize layout mode attribute on the root HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-layout-mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-layout-mode', nextMode);
    sessionStorage.setItem('data-layout-mode', nextMode);
    setThemeMode(nextMode);
  };

  const items = useMemo(() => navConfig[role] || navConfig.public, [role]);
  const showSidebar = !!currentUser;
  const isDark = themeMode === 'dark';

  if (!currentUser) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* ── Desktop Sidebar (Goes all the way to the top of screen) ── */}
      {showSidebar && (
        <aside 
          className="hidden lg:block w-64 fixed inset-y-0 left-0 z-30 border-r-2"
          style={{ borderColor: isDark ? '#1E293B' : '#00D6CC' }}
        >
          <SidebarContent items={items} activePage={activePage} setActivePage={setActivePage} themeMode={themeMode} />
        </aside>
      )}

      {/* ── Top Header bar (Pushed next to sidebar on desktop, matches layout exactly) ── */}
      <header 
        className="h-16 fixed top-0 right-0 left-0 lg:left-64 z-20 flex items-center justify-between px-4 lg:px-6 shadow-sm border-b-2"
        style={{ backgroundColor: isDark ? '#111A2E' : '#002E5B', borderBottomColor: isDark ? '#1E293B' : '#00D6CC' }}
      >
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle button */}
          <button 
            onClick={() => setOpen(true)} 
            className="lg:hidden p-2 rounded-xl border border-white/20 hover:bg-white/10 transition text-white"
          >
            <Menu size={20} />
          </button>

          {/* Clean Portal Title in header */}
          <span className="font-extrabold text-white text-sm sm:text-base tracking-wide uppercase">
            Admin Portal
          </span>
        </div>

        {/* Header Right Side Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Dark mode toggle icon - horizontally aligned next to avatar */}
          <button 
            onClick={toggleTheme}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition hidden sm:inline-flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User profile section matching exact styling */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-xl transition text-left"
            >
              <div className="h-9 w-9 rounded-full bg-white text-[#002E5B] flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                {currentUser.name ? currentUser.name.slice(0, 2) : 'AD'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-white leading-none">{currentUser.name || 'Administrator'}</div>
                <div className="text-[10px] text-white/70 font-semibold capitalize mt-1">{currentUser.role || 'Super Admin'}</div>
              </div>
              <ChevronDown size={14} className="text-white/70 hidden md:block" />
            </button>

            {userDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setActivePage('login');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main container wrapper */}
      <div className="flex flex-1 pt-16">
        
        {/* ── Mobile Sidebar Drawer ───────────────────────────── */}
        {showSidebar && open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setOpen(false)} 
            />
            <div 
              className="relative h-full w-72 flex flex-col z-50 shadow-2xl animate-in slide-in-from-left"
              style={{ backgroundColor: isDark ? '#111A2E' : '#002E5B' }}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <img src="/logo.png" alt="BIIPBIIP Logo" className="h-8 object-contain" />
                <button 
                  onClick={() => setOpen(false)} 
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent 
                  items={items} 
                  activePage={activePage} 
                  setActivePage={setActivePage} 
                  themeMode={themeMode}
                  closeMobile={() => setOpen(false)} 
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area (Shifted right next to sidebar) ── */}
        <main className="flex-1 min-w-0 lg:pl-64 min-h-[calc(100vh-64px)]">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default Layout;
