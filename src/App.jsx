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
import CompanyList from './pages/super_admin/Company/Companies/CompanyList';
import CompanyCars from './pages/super_admin/Company/Companies/CompanyCars';
import CompanyVerification from './pages/super_admin/Company/CompanyVerification/CompanyVerification';
import CompanyVerificationDetail from './pages/super_admin/Company/CompanyVerification/CompanyVerificationDetail';
import DriverList from './pages/super_admin/Driver/Drivers/DriverList';
import SuperAdminDashboard from './pages/super_admin/SuperAdminDashboard';
import VerificationRequestDetail from './pages/super_admin/Driver/DriverVerification/VerificationRequestDetail';
import VerificationRequests from './pages/super_admin/Driver/DriverVerification/VerificationRequests';
import DriverRides from './pages/super_admin/Driver/Drivers/DriverRides';
import DriverNotifications from './pages/super_admin/Driver/DriverNotifications/DriverNotifications';
import UserNotifications from './pages/super_admin/User/UserNotifications/UserNotifications';
import CompanyNotifications from './pages/super_admin/Company/Companies/CompanyNotifications';
import Coupons from './pages/super_admin/Coupons/Coupons';
import CreateCoupon from './pages/super_admin/Coupons/CreateCoupon';
import CreateRetailBroadcast from './pages/super_admin/User/UserNotifications/CreateRetailBroadcast';
import CreateDriverNotification from './pages/super_admin/Driver/DriverNotifications/CreateDriverNotification';
import CreateCompanyNotification from './pages/super_admin/Company/Companies/CreateCompanyNotification';
import UserBookings from './pages/super_admin/User/UserBookings/UserBookings';
import UsersAll from './pages/super_admin/User/Users/UsersAll';
import RentalBookings from './pages/super_admin/User/UserBookings/RentalBookings';
import TaxiBookings from './pages/super_admin/User/UserBookings/TaxiBookings';
import CompanyCarVerification from './pages/super_admin/Company/CarVerification/CompanyCarVerification';
import CompanyCarDetail from './pages/super_admin/Company/Companies/CompanyCarDetail';
import EarningReports from './pages/super_admin/EarningReports/EarningReports';
import { MakeModelsProvider } from './pages/super_admin/MakeAndModels/MakeModelsContext';
import MakersList from './pages/super_admin/MakeAndModels/MakersList';
import AddNewMaker from './pages/super_admin/MakeAndModels/AddNewMaker';
import ModelList from './pages/super_admin/MakeAndModels/ModelList';
import AddNewModel from './pages/super_admin/MakeAndModels/AddNewModel';

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
      'company-cars',
      'company-car-verification',
      'company-car-detail',
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
      'driver-payment-reports',
      'company-payment-reports',
      'makers-list',
      'add-new-maker',
      'model-list',
      'add-new-model',
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
  const [selectedCompanyCarId, setSelectedCompanyCarId] = useState(null);
  const [selectedCompanyCarReturnPage, setSelectedCompanyCarReturnPage] = useState('company-car-verification');

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

  const handleShowCompanyCars = useCallback(
    (companyId) => {
      setSelectedCompanyId(companyId);
      setActivePage('company-cars');
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

  const handleShowCompanyCarDetail = useCallback(
    (carId, returnPage = 'company-car-verification') => {
      setSelectedCompanyCarId(carId);
      setSelectedCompanyCarReturnPage(returnPage);
      setActivePage('company-car-detail');
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
          onShowCars={handleShowCompanyCars}
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
      'company-cars': (
        <CompanyCars
          companyId={selectedCompanyId}
          setActivePage={setActivePage}
          onShowDetail={handleShowCompanyCarDetail}
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
      'company-car-verification': (
        <CompanyCarVerification
          onShowDetail={handleShowCompanyCarDetail}
        />
      ),
      'company-car-detail': (
        <CompanyCarDetail
          carId={selectedCompanyCarId}
          setActivePage={setActivePage}
          returnPage={selectedCompanyCarReturnPage}
        />
      ),
      'earning-reports': (
        <EarningReports />
      ),
      'driver-payment-reports': (
        <EarningReports defaultTab="driver" />
      ),
      'company-payment-reports': (
        <EarningReports defaultTab="company" />
      ),
      'makers-list':    <MakersList   setActivePage={setActivePage} />,
      'add-new-maker':  <AddNewMaker  setActivePage={setActivePage} />,
      'model-list':     <ModelList    setActivePage={setActivePage} />,
      'add-new-model':  <AddNewModel  setActivePage={setActivePage} />,
    };

    return pages[activePage] ?? pages[roleConfig.defaultPage];
  }, [
    activePage,
    handleShowVerificationDetail,
    handleShowCompanyDetail,
    handleShowCarDetail,
    handleShowDriverRides,
    handleShowCompanyCarDetail,
    roleConfig.defaultPage,
    selectedVerificationId,
    selectedCompanyId,
    selectedCarId,
    selectedCarEditId,
    selectedDriverRidesId,
    selectedNotificationId,
    selectedCompanyCarId,
  ]);

  return (
    <MakeModelsProvider>
      <Layout
        activePage={activePage}
        setActivePage={setActivePage}
      >
        {page}
      </Layout>
    </MakeModelsProvider>
  );
};

export default App;