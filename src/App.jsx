import { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout';
import { useApp } from './context/AppContext';
import AdminDashboard from './pages/AdminDashboard';
import CarManagement from './pages/CarManagement';
import CompanyProfile from './pages/CompanyProfile';
import CompanyVerification from './pages/CompanyVerification';
import Login from './pages/Login';
import RentRequests from './pages/RentRequests';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

const allowedPages = {
  public: ['request-car', 'login'],
  super_admin: ['super-dashboard', 'companies'],
  admin: ['admin-dashboard', 'cars', 'requests', 'company-profile'],
};

const defaultPage = {
  public: 'request-car',
  super_admin: 'super-dashboard',
  admin: 'admin-dashboard',
};

const App = () => {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState(() => (currentUser ? defaultPage[currentUser.role] : 'request-car'));
  const role = currentUser?.role || 'public';

  useEffect(() => {
    if (!allowedPages[role].includes(activePage)) {
      setActivePage(defaultPage[role]);
    }
  }, [role, activePage]);

  const page = useMemo(() => {
    switch (activePage) {
      case 'login':
        return <Login setActivePage={setActivePage} />;
      case 'super-dashboard':
        return <SuperAdminDashboard setActivePage={setActivePage} />;
      case 'companies':
        return <CompanyVerification />;
      case 'admin-dashboard':
        return <AdminDashboard setActivePage={setActivePage} />;
      case 'cars':
        return <CarManagement />;
      case 'requests':
        return <RentRequests />;
      case 'company-profile':
        return <CompanyProfile />;
      case 'request-car':
    }
  }, [activePage]);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {page}
    </Layout>
  );
};

export default App;
