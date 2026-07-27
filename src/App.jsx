import { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout';
import { useApp } from './context/AppContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import CarManagement from './pages/admin/CarManagement';
import CompanyProfile from './pages/admin/CompanyProfile';
import CompanyVerification from './pages/super_admin/CompanyVerification';
import Login from './pages/Login';
import RentRequests from './pages/admin/RentRequests';
import SuperAdminDashboard from './pages/super_admin/SuperAdminDashboard';
import VerificationRequests from './pages/super_admin/VerificationRequests';
import VerificationRequestDetail from './pages/super_admin/VerificationRequestDetail';
import CompanyList from './pages/super_admin/CompanyList';
import DriverList from './pages/super_admin/DriverList';

const allowedPages = {
  public: ['login'],
  super_admin: ['super-dashboard', 'companies', 'companies-list', 'companies-verification', 'drivers-list', 'drivers-verification', 'verification-requests', 'verification-detail'],
  admin: ['admin-dashboard', 'cars', 'requests', 'company-profile'],
};

const defaultPage = {
  public: 'login',
  super_admin: 'super-dashboard',
  admin: 'admin-dashboard',
};

const App = () => {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState(() => (currentUser ? defaultPage[currentUser.role] : 'login'));
  const [selectedVerificationId, setSelectedVerificationId] = useState(null);
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
      case 'companies-list':
        return <CompanyList />;
      case 'companies-verification':
      case 'companies':
        return <CompanyVerification />;
      case 'drivers-list':
        return <DriverList />;
      case 'drivers-verification':
      case 'verification-requests':
        return (
          <VerificationRequests
            onShowDetail={(id) => {
              setSelectedVerificationId(id);
              setActivePage('verification-detail');
            }}
          />
        );
      case 'verification-detail':
        return (
          <VerificationRequestDetail
            verificationId={selectedVerificationId}
            setActivePage={setActivePage}
          />
        );
      case 'admin-dashboard':
        return <AdminDashboard setActivePage={setActivePage} />;
      case 'cars':
        return <CarManagement />;
      case 'requests':
        return <RentRequests />;
      case 'company-profile':
        return <CompanyProfile />;
    }
  }, [activePage, selectedVerificationId]);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {page}
    </Layout>
  );
};

export default App;
