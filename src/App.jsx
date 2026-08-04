import { useCallback, useEffect, useMemo, useState } from 'react';

import Layout from './components/Layout';
import { useApp } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import CarManagement from './pages/admin/CarManagement';
import CarDetail from './pages/admin/CarDetail';
import CompanyProfile from './pages/admin/CompanyProfile';
import RentRequests from './pages/admin/RentRequests';
import CompanyList from './pages/super_admin/CompanyList';
import CompanyVerification from './pages/super_admin/CompanyVerification';
import CompanyVerificationDetail from './pages/super_admin/CompanyVerificationDetail';
import DriverList from './pages/super_admin/DriverList';
import SuperAdminDashboard from './pages/super_admin/SuperAdminDashboard';
import VerificationRequestDetail from './pages/super_admin/VerificationRequestDetail';
import VerificationRequests from './pages/super_admin/VerificationRequests';
import DriverRides from './pages/super_admin/DriverRides';
import DriverNotifications from './pages/super_admin/DriverNotifications';
import UserNotifications from './pages/super_admin/UserNotifications';
import CompanyNotifications from './pages/super_admin/CompanyNotifications';
import Coupons from './pages/super_admin/Coupons';
import CreateCoupon from './pages/super_admin/CreateCoupon';
import CreateRetailBroadcast from './pages/super_admin/CreateRetailBroadcast';
import CreateDriverNotification from './pages/super_admin/CreateDriverNotification';
import CreateCompanyNotification from './pages/super_admin/CreateCompanyNotification';
import UserBookings from './pages/super_admin/UserBookings';
import UsersAll from './pages/super_admin/UsersAll';
import RentalBookings from './pages/super_admin/RentalBookings';
import TaxiBookings from './pages/super_admin/TaxiBookings';

const ROLE_CONFIG = {
  public: {
    defaultPage: 'login',
    allowedPages: ['login', 'register'],
  },

  admin: {
    defaultPage: 'admin-dashboard',
    allowedPages: [
      'admin-dashboard',
      'cars',
      'car-detail',
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
      'driver-rides',
      'driver-notifications',
      'user-notifications',
      'create-retail-broadcast',
      'create-driver-notification',
      'create-company-notification',
      'company-notifications',
      'coupons',
      'create-coupon',
      'user-bookings',
      'users-all',
      'rental-bookings',
      'taxi-bookings',
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

  const [selectedCarId, setSelectedCarId] = useState(null);
  const [selectedCarEditId, setSelectedCarEditId] = useState(null);
  const [selectedDriverRidesId, setSelectedDriverRidesId] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

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

  const handleShowCarDetail = useCallback(
    (carId) => {
      setSelectedCarId(carId);
      setActivePage('car-detail');
    },
    []
  );

  const handleShowDriverRides = useCallback(
    (driverId) => {
      setSelectedDriverRidesId(driverId);
      setActivePage('driver-rides');
    },
    []
  );

  const page = useMemo(() => {
    const pages = {
      login: (
        <Login setActivePage={setActivePage} />
      ),
      register: (
        <Register setActivePage={setActivePage} />
      ),

      // Admin pages
      'admin-dashboard': (
        <AdminDashboard setActivePage={setActivePage} />
      ),
      cars: (
        <CarManagement
          onShowDetail={handleShowCarDetail}
          editCarId={selectedCarEditId}
          clearEditCarId={() => setSelectedCarEditId(null)}
        />
      ),
      'car-detail': (
        <CarDetail
          carId={selectedCarId}
          setActivePage={setActivePage}
          onStartEdit={(carId) => {
            setSelectedCarEditId(carId);
            setActivePage('cars');
          }}
        />
      ),
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
      'companies-list': (
        <CompanyList
          onShowDetail={handleShowCompanyDetail}
        />
      ),
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
      'drivers-list': (
        <DriverList
          onShowDetail={handleShowVerificationDetail}
          onShowRides={handleShowDriverRides}
        />
      ),
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
      'driver-rides': (
        <DriverRides
          selectedDriverId={selectedDriverRidesId}
          setSelectedDriverId={setSelectedDriverRidesId}
        />
      ),
      'driver-notifications': (
        <DriverNotifications
          setActivePage={setActivePage}
          setSelectedNotificationId={setSelectedNotificationId}
        />
      ),
      'create-driver-notification': (
        <CreateDriverNotification
          setActivePage={setActivePage}
          selectedNotificationId={selectedNotificationId}
        />
      ),
      'user-notifications': (
        <UserNotifications
          setActivePage={setActivePage}
          setSelectedNotificationId={setSelectedNotificationId}
        />
      ),
      'create-retail-broadcast': (
        <CreateRetailBroadcast
          setActivePage={setActivePage}
          selectedNotificationId={selectedNotificationId}
        />
      ),
      'company-notifications': (
        <CompanyNotifications
          setActivePage={setActivePage}
          setSelectedNotificationId={setSelectedNotificationId}
        />
      ),
      'create-company-notification': (
        <CreateCompanyNotification
          setActivePage={setActivePage}
          selectedNotificationId={selectedNotificationId}
        />
      ),
      coupons: (
        <Coupons setActivePage={setActivePage} />
      ),
      'create-coupon': (
        <CreateCoupon setActivePage={setActivePage} />
      ),
      'user-bookings': (
        <UserBookings />
      ),
      'users-all': (
        <UsersAll />
      ),
      'rental-bookings': (
        <RentalBookings />
      ),
      'taxi-bookings': (
        <TaxiBookings />
      ),
    };

    return pages[activePage] ?? pages[roleConfig.defaultPage];
  }, [
    activePage,
    handleShowVerificationDetail,
    handleShowCompanyDetail,
    handleShowCarDetail,
    handleShowDriverRides,
    roleConfig.defaultPage,
    selectedVerificationId,
    selectedCompanyId,
    selectedCarId,
    selectedCarEditId,
    selectedDriverRidesId,
    selectedNotificationId,
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