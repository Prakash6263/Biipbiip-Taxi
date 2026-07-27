import { useCallback, useEffect, useMemo, useState } from 'react';

import Layout from './components/Layout';
import { useApp } from './context/AppContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import CarManagement from './pages/admin/CarManagement';
import CompanyProfile from './pages/admin/CompanyProfile';
import RentRequests from './pages/admin/RentRequests';
import CompanyList from './pages/super_admin/CompanyList';
import CompanyVerification from './pages/super_admin/CompanyVerification';
import CompanyVerificationDetail from './pages/super_admin/CompanyVerificationDetail';
import DriverList from './pages/super_admin/DriverList';
import SuperAdminDashboard from './pages/super_admin/SuperAdminDashboard';
import VerificationRequestDetail from './pages/super_admin/VerificationRequestDetail';
import VerificationRequests from './pages/super_admin/VerificationRequests';

const ROLE_CONFIG = {
  public: {
    defaultPage: 'login',
    allowedPages: ['login'],
  },

  admin: {
    defaultPage: 'admin-dashboard',
    allowedPages: [
      'admin-dashboard',
      'cars',
      'requests',
      'company-profile',
    ],
  },

  super_admin: {
    defaultPage: 'super-dashboard',
    allowedPages: [
      'super-dashboard',
      'companies',
      'companies-list',
      'companies-verification',
      'company-verification-detail',
      'drivers-list',
      'drivers-verification',
      'verification-requests',
      'verification-detail',
    ],
  },
};

const getUserRole = (currentUser) => {
  const role = currentUser?.role;

  return ROLE_CONFIG[role] ? role : 'public';
};

const App = () => {
  const { currentUser } = useApp();

  const role = getUserRole(currentUser);
  const roleConfig = ROLE_CONFIG[role];

  const [activePage, setActivePage] = useState(
    roleConfig.defaultPage
  );

  const [selectedVerificationId, setSelectedVerificationId] =
    useState(null);

  const [selectedCompanyId, setSelectedCompanyId] =
    useState(null);

  useEffect(() => {
    const hasAccess = roleConfig.allowedPages.includes(activePage);

    if (!hasAccess) {
      setActivePage(roleConfig.defaultPage);
    }
  }, [activePage, roleConfig]);

  const handleShowVerificationDetail = useCallback(
    (verificationId) => {
      setSelectedVerificationId(verificationId);
      setActivePage('verification-detail');
    },
    []
  );

  const handleShowCompanyDetail = useCallback(
    (companyId) => {
      setSelectedCompanyId(companyId);
      setActivePage('company-verification-detail');
    },
    []
  );

  const page = useMemo(() => {
    const pages = {
      login: (
        <Login setActivePage={setActivePage} />
      ),

      // Admin pages
      'admin-dashboard': (
        <AdminDashboard setActivePage={setActivePage} />
      ),
      cars: <CarManagement />,
      requests: <RentRequests />,
      'company-profile': <CompanyProfile />,

      // Super-admin pages
      'super-dashboard': (
        <SuperAdminDashboard setActivePage={setActivePage} />
      ),
      companies: (
        <CompanyVerification
          onShowDetail={handleShowCompanyDetail}
        />
      ),
      'companies-list': <CompanyList />,
      'companies-verification': (
        <CompanyVerification
          onShowDetail={handleShowCompanyDetail}
        />
      ),
      'company-verification-detail': (
        <CompanyVerificationDetail
          companyId={selectedCompanyId}
          setActivePage={setActivePage}
        />
      ),
      'drivers-list': <DriverList />,
      'drivers-verification': (
        <VerificationRequests
          onShowDetail={handleShowVerificationDetail}
        />
      ),
      'verification-requests': (
        <VerificationRequests
          onShowDetail={handleShowVerificationDetail}
        />
      ),
      'verification-detail': (
        <VerificationRequestDetail
          verificationId={selectedVerificationId}
          setActivePage={setActivePage}
        />
      ),
    };

    return pages[activePage] ?? pages[roleConfig.defaultPage];
  }, [
    activePage,
    handleShowVerificationDetail,
    handleShowCompanyDetail,
    roleConfig.defaultPage,
    selectedVerificationId,
    selectedCompanyId,
  ]);

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >
      {page}
    </Layout>
  );
};

export default App;