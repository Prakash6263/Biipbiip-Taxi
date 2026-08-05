import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedState } from '../data/mockData';
import { loadState, saveState, uid } from '../utils/storage';
import { registerCompanyApi, loginCompanyApi, fetchCompanyCarsApi, loginSuperAdminApi, fetchAllDriversApi, updateDriverStatusApi, fetchAllCompaniesApi, updateCompanyStatusApi, fetchAllCompanyCarsApi, updateCompanyCarStatusApi } from '../utils/api';

const AppContext = createContext(null);

const initialState = () => {
  const loaded = loadState();
  if (!loaded) {
    return {
      ...seedState,
      driverNotifications: [],
      userNotifications: [],
      companyNotifications: [],
      coupons: seedState.coupons || [],
      allCompanyCars: seedState.allCompanyCars || [],
    };
  }
  return {
    ...seedState,
    ...loaded,
    verificationRequests: loaded.verificationRequests || seedState.verificationRequests || [],
    driverNotifications: loaded.driverNotifications || [],
    userNotifications: loaded.userNotifications || [],
    companyNotifications: loaded.companyNotifications || [],
    coupons: loaded.coupons || seedState.coupons || [],
    allCompanyCars: loaded.allCompanyCars || seedState.allCompanyCars || [],
  };
};

export const mapBackendCar = (backendCar) => {
  if (!backendCar) return null;
  const doc = backendCar._doc || backendCar;

  const rawPhotos = backendCar.vehiclePhotos || doc.vehiclePhotos || [];
  const formattedPhotos = rawPhotos.map((photo) => {
    if (typeof photo !== 'string') return '';
    return photo.startsWith('http') || photo.startsWith('data:') ? photo : `https://node.aitechnotech.in/biip/api/v1/uploads/company-car/${photo}`;
  });

  const formatDocUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `https://node.aitechnotech.in/biip/api/v1/uploads/company-car/${url}`;
  };

  const companyId = doc.companyId?._id || doc.companyId || backendCar.companyId || '';

  return {
    id: doc._id || backendCar._id || uid('car'),
    companyId,
    name: doc.carName || backendCar.carName || '',
    brand: doc.vehicleBrand || backendCar.vehicleBrand || '',
    model: doc.vehicleModel || backendCar.vehicleModel || '',
    year: doc.manufacturingYear || backendCar.manufacturingYear || new Date().getFullYear(),
    registrationNo: doc.registrationNo || backendCar.registrationNo || '',
    fuelType: doc.fuelType || backendCar.fuelType || 'Petrol',
    transmission: doc.transmission || backendCar.transmission || 'Manual',
    seats: doc.noOfSeats || backendCar.noOfSeats || 5,
    doors: doc.noOfDoors || backendCar.noOfDoors || 4,
    pricePerDay: doc.perDayCharge || backendCar.perDayCharge || 0,
    mileage: doc.mileage || backendCar.mileage || '',
    color: doc.color || backendCar.color || '',
    vinNumber: doc.vinNumber || backendCar.vinNumber || '',
    ac: doc.airConditioning !== undefined ? doc.airConditioning : (backendCar.airConditioning !== undefined ? backendCar.airConditioning : true),
    description: doc.description || backendCar.description || '',
    status: doc.status || backendCar.status || 'available',
    image: formattedPhotos[0] || '',
    photos: formattedPhotos,
    insuranceInvoice: formatDocUrl(backendCar.insuranceInvoice || doc.insuranceInvoice),
    registrationCardImage: formatDocUrl(backendCar.registrationCardImage || doc.registrationCardImage),
    createdAt: doc.createdAt || backendCar.createdAt || new Date().toISOString(),
  };
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem('car_rental_current_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('car_rental_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('car_rental_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && currentUser.token) {
      syncCompanyCars(currentUser.token);
    }
  }, [currentUser?.token]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.token) {
      syncAllDrivers(currentUser.token);
      syncAllCompanies(currentUser.token);
      syncAllCompanyCars(currentUser.token);
    }
  }, [currentUser?.token, currentUser?.role]);

  const login = async ({ email, password }) => {
    // 1. Try Super Admin Login first
    const superAdminResult = await loginSuperAdminApi(email, password);
    if (superAdminResult.success) {
      const userData = superAdminResult.userData;
      const superAdminUser = {
        id: userData._id,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: 'super_admin',
        token: userData.token
      };

      setState((prev) => {
        const nextUsers = prev.users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
        return {
          ...prev,
          users: [...nextUsers, superAdminUser],
        };
      });

      setCurrentUser(superAdminUser);
      syncAllDrivers(userData.token);
      syncAllCompanies(userData.token);
      return { ok: true, role: 'super_admin' };
    }

    // 2. Try Admin (Company) Login
    const companyResult = await loginCompanyApi(email, password);
    if (companyResult.success) {
      const companyData = companyResult.companyData;
      const adminId = companyData._id;
      const companyId = companyData._id;

      const newAdmin = {
        id: adminId,
        name: companyData.adminName,
        email: companyData.email,
        password,
        role: 'admin',
        companyId,
        token: companyData.token
      };

      const formattedDocs = (companyData.documents || []).map((doc) => {
        if (typeof doc === 'string') {
          return {
            name: doc.split('/').pop() || doc,
            url: doc.startsWith('http') ? doc : `https://node.aitechnotech.in/biip/uploads/${doc}`,
            uploadedAt: new Date().toISOString(),
          };
        }
        return doc;
      });

      const newCompany = {
        id: companyId,
        adminId,
        companyName: companyData.companyName,
        ownerName: companyData.ownerName,
        email: companyData.email,
        phone: companyData.phoneNumber,
        address: companyData.address,
        city: companyData.city || '',
        gstNumber: companyData.gstNumber,
        status: companyData.isVerified ? 'verified' : 'pending',
        rejectionReason: '',
        documents: formattedDocs,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => {
        const nextUsers = prev.users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
        const nextCompanies = prev.companies.filter((c) => c.id !== companyId);
        return {
          ...prev,
          users: [...nextUsers, newAdmin],
          companies: [...nextCompanies, newCompany],
        };
      });

      setCurrentUser(newAdmin);
      syncCompanyCars(companyData.token);
      return { ok: true, role: 'admin' };
    }

    // 3. Fallback to mock users check
    const mockUser = state.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );
    if (mockUser) {
      setCurrentUser(mockUser);
      return { ok: true, role: mockUser.role };
    }

    // If both backend logins and mock login fail, return the error message
    const combinedMessage = companyResult.message || superAdminResult.message || 'Invalid credentials or incorrect role.';
    return { ok: false, message: combinedMessage };
  };

  const logout = () => setCurrentUser(null);

  const registerCompany = async ({ adminName, email, password, company, rawDocuments }) => {
    const existing = state.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (existing) return { ok: false, message: 'This email is already registered.' };

    const apiResult = await registerCompanyApi({
      adminName,
      email,
      password,
      companyName: company.companyName,
      ownerName: company.ownerName,
      phoneNumber: company.phone,
      address: company.address,
      city: company.city,
      gstNumber: company.gstNumber,
      documents: rawDocuments,
    });

    if (!apiResult.success) {
      return { ok: false, message: apiResult.message };
    }

    const backendCompany = apiResult.company;

    const adminId = uid('admin');
    const companyId = backendCompany._id || uid('company');
    const newAdmin = {
      id: adminId,
      name: backendCompany.adminName || adminName,
      email: backendCompany.email || email,
      password,
      role: 'admin',
      companyId,
    };

    const formattedDocs = (backendCompany.documents || []).map((doc) => {
      if (typeof doc === 'string') {
        return {
          name: doc,
          url: doc.startsWith('http') ? doc : `https://node.aitechnotech.in/biip/uploads/${doc}`,
          uploadedAt: backendCompany.createdAt || new Date().toISOString(),
        };
      }
      return doc;
    });

    const newCompany = {
      id: companyId,
      adminId,
      companyName: backendCompany.companyName,
      ownerName: backendCompany.ownerName,
      email: backendCompany.email,
      phone: backendCompany.phoneNumber,
      address: backendCompany.address,
      city: backendCompany.city,
      gstNumber: backendCompany.gstNumber,
      status: backendCompany.isVerified ? 'verified' : 'pending',
      rejectionReason: '',
      documents: formattedDocs,
      createdAt: backendCompany.createdAt || new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      users: [...prev.users, newAdmin],
      companies: [...prev.companies, newCompany],
    }));

    setCurrentUser(newAdmin);
    return { ok: true };
  };

  const verifyCompany = async (companyId) => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.token) {
      const apiResult = await updateCompanyStatusApi(companyId, 'APPROVED', currentUser.token);
      if (apiResult.success) {
        await syncAllCompanies(currentUser.token);
        return;
      }
      console.error('Failed to verify company on backend:', apiResult.message);
    }

    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((company) =>
        company.id === companyId ? { ...company, status: 'verified', rejectionReason: '' } : company,
      ),
    }));
  };

  const rejectCompany = async (companyId, reason) => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.token) {
      const apiResult = await updateCompanyStatusApi(companyId, 'REJECTED', currentUser.token);
      if (apiResult.success) {
        await syncAllCompanies(currentUser.token);
        return;
      }
      console.error('Failed to reject company on backend:', apiResult.message);
    }

    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((company) =>
        company.id === companyId ? { ...company, status: 'rejected', rejectionReason: reason || 'Documents not approved.' } : company,
      ),
    }));
  };

  const syncCompanyCars = async (token) => {
    const apiResult = await fetchCompanyCarsApi(token);
    if (!apiResult.success) {
      console.error('Failed to sync cars from backend:', apiResult.message);
      return;
    }

    const backendCars = apiResult.cars || [];
    const formattedCars = backendCars.map(mapBackendCar).filter(Boolean);

    setState((prev) => {
      const companyId = currentUser?.companyId;
      const otherCars = prev.cars.filter((car) => car.companyId !== companyId);
      return {
        ...prev,
        cars: [...formattedCars, ...otherCars],
      };
    });
  };

  const syncAllDrivers = async (token) => {
    const apiResult = await fetchAllDriversApi(token);
    if (!apiResult.success) {
      console.error('Failed to sync drivers from backend:', apiResult.message);
      return;
    }

    const backendDrivers = apiResult.drivers || [];
    const formattedRequests = backendDrivers.map((driver) => {
      const userName = driver.user ? `${driver.user.firstName || ''} ${driver.user.lastName || ''}`.trim() : 'Unnamed Driver';
      const userEmail = driver.user?.email || '';
      const userPhone = driver.user ? `${driver.user.countryCode || ''} ${driver.user.phoneNumber || ''}`.trim() : '';

      const mapDocument = (url, defaultName, key = '') => {
        if (!url) return null;
        let formattedUrl = url;
        if (typeof url === 'string' && !url.startsWith('http')) {
          formattedUrl = `https://node.aitechnotech.in/biip/api/v1/uploads/driver/${url}`;
        }

        let docStatus = 'pending';
        let docReason = '';
        const currentReq = state?.verificationRequests?.find(r => r.id === driver._id);
        if (currentReq) {
          let localDoc = null;
          if (key === 'nationalId_front') localDoc = currentReq.nationalId?.front;
          else if (key === 'nationalId_back') localDoc = currentReq.nationalId?.back;
          else if (key === 'driverLicense_front') localDoc = currentReq.driverLicense?.front;
          else if (key === 'driverLicense_back') localDoc = currentReq.driverLicense?.back;
          else if (key === 'vehicleRegistration') localDoc = currentReq.vehicleRegistration;
          else if (key === 'vehicleRegistrationBack') localDoc = currentReq.vehicleRegistrationBack;

          if (localDoc && localDoc.status) {
            docStatus = localDoc.status;
            docReason = localDoc.rejectionReason || '';
          }
        } else {
          if (driver.verificationStatus) {
            const s = String(driver.verificationStatus).toUpperCase();
            if (s === 'APPROVED' || s === 'VERIFIED') {
              docStatus = 'approved';
            } else if (s === 'REJECTED') {
              docStatus = 'rejected';
            }
          }
        }

        return {
          name: typeof url === 'string' ? url.split('/').pop() : defaultName,
          url: formattedUrl,
          uploadedAt: driver.createdAt || new Date().toISOString(),
          status: docStatus,
          rejectionReason: docReason,
        };
      };

      const nationalId = {
        front: mapDocument(driver.nationalIdFront, 'national_id_front.jpg', 'nationalId_front'),
        back: mapDocument(driver.nationalIdBack, 'national_id_back.jpg', 'nationalId_back'),
      };

      const driverLicense = {
        front: mapDocument(driver.driverLicenseFront, 'driver_license_front.jpg', 'driverLicense_front'),
        back: mapDocument(driver.driverLicenseBack, 'driver_license_back.jpg', 'driverLicense_back'),
      };

      const vehicleRegistration = mapDocument(driver.vehicleRegistrationFront, 'vehicle_registration_front.jpg', 'vehicleRegistration');
      const vehicleRegistrationBack = mapDocument(driver.vehicleRegistrationBack, 'vehicle_registration_back.jpg', 'vehicleRegistrationBack');

      let status = 'pending';
      const backendStatus = String(driver.verificationStatus || '').toUpperCase();
      if (backendStatus === 'APPROVED' || backendStatus === 'VERIFIED') {
        status = 'verified';
      } else if (backendStatus === 'REJECTED') {
        status = 'rejected';
      }

      const carImages = (driver.vehiclePhotos || []).map((photo) => {
        let formattedPhotoUrl = photo;
        if (typeof photo === 'string' && !photo.startsWith('http')) {
          formattedPhotoUrl = `https://node.aitechnotech.in/biip/api/v1/uploads/driver/${photo}`;
        }
        return { url: formattedPhotoUrl };
      });

      return {
        id: driver._id,
        companyId: driver.companyId || '',
        userName,
        userEmail,
        userPhone,
        nationalId,
        driverLicense,
        vehicleRegistration,
        vehicleRegistrationBack,
        carName: `${driver.brand || ''} ${driver.vehicleName || ''}`.trim() || 'Unknown Vehicle',
        registrationNo: driver.vehicleRegistrationNumber || '',
        carImages,
        status,
        rejectionReason: driver.rejectionReason || '',
        createdAt: driver.createdAt || new Date().toISOString(),
      };
    });

    setState((prev) => ({
      ...prev,
      verificationRequests: formattedRequests,
    }));
  };

  const syncAllCompanies = async (token) => {
    const apiResult = await fetchAllCompaniesApi(token);
    if (!apiResult.success) {
      console.error('Failed to sync companies from backend:', apiResult.message);
      return;
    }

    const backendCompanies = apiResult.companies || [];
    const formattedCompanies = backendCompanies.map((company) => {
      const formattedDocs = (company.documents || []).map((doc, idx) => {
        if (typeof doc === 'string') {
          return {
            name: doc.split('/').pop() || `document_${idx + 1}.png`,
            url: doc.startsWith('http') ? doc : `https://node.aitechnotech.in/biip/api/v1/uploads/company/${doc}`,
            uploadedAt: company.createdAt || new Date().toISOString(),
          };
        }
        return doc;
      });

      let status = 'pending';
      if (company.isVerified) {
        status = 'verified';
      } else if (company.rejectionReason) {
        status = 'rejected';
      }

      return {
        id: company._id,
        adminId: company._id,
        companyName: company.companyName || 'Unnamed Company',
        ownerName: company.ownerName || 'Unnamed Owner',
        email: company.email || '',
        phone: company.phoneNumber || '',
        address: company.address || '',
        city: company.city || '',
        gstNumber: company.gstNumber || '',
        status,
        rejectionReason: company.rejectionReason || '',
        documents: formattedDocs,
        createdAt: company.createdAt || new Date().toISOString(),
      };
    });

    setState((prev) => ({
      ...prev,
      companies: formattedCompanies,
    }));
  };

  const syncAllCompanyCars = async (token) => {
    const apiResult = await fetchAllCompanyCarsApi(token);
    if (!apiResult.success) {
      console.error('Failed to sync company cars from backend:', apiResult.message);
      // Fallback to demo data if API fails
      if (seedState.allCompanyCars && seedState.allCompanyCars.length > 0) {
        setState((prev) => ({
          ...prev,
          allCompanyCars: seedState.allCompanyCars,
        }));
      }
      return;
    }

    const backendCars = apiResult.cars || [];
    if (backendCars.length === 0 && seedState.allCompanyCars && seedState.allCompanyCars.length > 0) {
      // Use demo data if backend returns empty
      setState((prev) => ({
        ...prev,
        allCompanyCars: seedState.allCompanyCars,
      }));
      return;
    }

    const formattedCars = backendCars.map((car) => {
      const company = state.companies.find(c => c.id === (car.companyId?._id || car.companyId));
      const companyName = company?.companyName || 'Unknown Company';

      const rawPhotos = car.vehiclePhotos || [];
      const formattedPhotos = rawPhotos.map((photo) => {
        if (typeof photo !== 'string') return '';
        return photo.startsWith('http') || photo.startsWith('data:') ? photo : `https://node.aitechnotech.in/biip/api/v1/uploads/company-car/${photo}`;
      });

      const formatDocUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `https://node.aitechnotech.in/biip/api/v1/uploads/company-car/${url}`;
      };

      let status = 'pending';
      const backendStatus = String(car.verificationStatus || car.status || '').toUpperCase();
      if (backendStatus === 'APPROVED' || backendStatus === 'VERIFIED') {
        status = 'verified';
      } else if (backendStatus === 'REJECTED') {
        status = 'rejected';
      }

      return {
        id: car._id,
        companyId: car.companyId?._id || car.companyId || '',
        companyName,
        name: car.carName || '',
        brand: car.vehicleBrand || '',
        model: car.vehicleModel || '',
        year: car.manufacturingYear || new Date().getFullYear(),
        registrationNo: car.registrationNo || '',
        fuelType: car.fuelType || 'Petrol',
        transmission: car.transmission || 'Manual',
        seats: car.noOfSeats || 5,
        doors: car.noOfDoors || 4,
        pricePerDay: car.perDayCharge || 0,
        mileage: car.mileage || '',
        color: car.color || '',
        vinNumber: car.vinNumber || '',
        ac: car.airConditioning !== undefined ? car.airConditioning : true,
        description: car.description || '',
        status,
        rejectionReason: car.rejectionReason || '',
        image: formattedPhotos[0] || '',
        photos: formattedPhotos,
        insuranceInvoice: formatDocUrl(car.insuranceInvoice),
        registrationCardImage: formatDocUrl(car.registrationCardImage),
        createdAt: car.createdAt || new Date().toISOString(),
      };
    });

    setState((prev) => ({
      ...prev,
      allCompanyCars: formattedCars,
    }));
  };

  const addCar = (backendCar) => {
    const newCar = mapBackendCar(backendCar);
    if (newCar) {
      setState((prev) => ({ ...prev, cars: [newCar, ...prev.cars] }));
    }
  };

  const updateCar = (backendCar) => {
    const updated = mapBackendCar(backendCar);
    if (updated) {
      setState((prev) => ({
        ...prev,
        cars: prev.cars.map((car) => (car.id === updated.id ? updated : car)),
      }));
    }
  };

  const updateCarStatus = (carId, status) => {
    setState((prev) => ({
      ...prev,
      cars: prev.cars.map((car) => (car.id === carId ? { ...car, status } : car)),
    }));
  };

  const deleteCar = (carId) => {
    setState((prev) => ({
      ...prev,
      cars: prev.cars.filter((car) => car.id !== carId),
      rentalRequests: prev.rentalRequests.filter((request) => request.carId !== carId),
    }));
  };

  const createRentalRequest = (request) => {
    const car = state.cars.find((item) => item.id === request.carId);
    const newRequest = {
      id: uid('req'),
      companyId: car?.companyId,
      ...request,
      status: 'pending',
      adminNotes: '',
      userDocuments: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, rentalRequests: [newRequest, ...prev.rentalRequests] }));
    return { ok: true };
  };

  const uploadUserDocuments = ({ requestId, documents, adminNotes }) => {
    setState((prev) => ({
      ...prev,
      rentalRequests: prev.rentalRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              userDocuments: [...(request.userDocuments || []), ...documents],
              adminNotes: adminNotes || request.adminNotes,
            }
          : request,
      ),
    }));
  };

  const approveRentalRequest = (requestId) => {
    setState((prev) => {
      const request = prev.rentalRequests.find((item) => item.id === requestId);
      return {
        ...prev,
        rentalRequests: prev.rentalRequests.map((item) =>
          item.id === requestId ? { ...item, status: 'active' } : item,
        ),
        cars: prev.cars.map((car) => (car.id === request?.carId ? { ...car, status: 'booked' } : car)),
      };
    });
  };

  const rejectRentalRequest = (requestId, notes) => {
    setState((prev) => ({
      ...prev,
      rentalRequests: prev.rentalRequests.map((item) =>
        item.id === requestId ? { ...item, status: 'rejected', adminNotes: notes || item.adminNotes } : item,
      ),
    }));
  };

  const markReturned = (requestId) => {
    setState((prev) => {
      const request = prev.rentalRequests.find((item) => item.id === requestId);
      return {
        ...prev,
        rentalRequests: prev.rentalRequests.map((item) =>
          item.id === requestId ? { ...item, status: 'returned' } : item,
        ),
        cars: prev.cars.map((car) => (car.id === request?.carId ? { ...car, status: 'available' } : car)),
      };
    });
  };

  const approveVerificationRequest = async (requestId) => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.token) {
      const apiResult = await updateDriverStatusApi(requestId, 'APPROVED', currentUser.token);
      if (!apiResult.success) {
        console.error('Failed to approve driver on backend:', apiResult.message);
        return;
      }
      await syncAllDrivers(currentUser.token);
      return;
    }

    setState((prev) => ({
      ...prev,
      verificationRequests: (prev.verificationRequests || []).map((req) =>
        req.id === requestId ? { ...req, status: 'verified', rejectionReason: '' } : req
      ),
    }));
  };

  const rejectVerificationRequest = async (requestId, reason) => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.token) {
      const apiResult = await updateDriverStatusApi(requestId, 'REJECTED', currentUser.token);
      if (!apiResult.success) {
        console.error('Failed to reject driver on backend:', apiResult.message);
        return;
      }
      await syncAllDrivers(currentUser.token);
      return;
    }

    setState((prev) => ({
      ...prev,
      verificationRequests: (prev.verificationRequests || []).map((req) =>
        req.id === requestId ? { ...req, status: 'rejected', rejectionReason: reason || 'Documents not clear.' } : req
      ),
    }));
  };

  const updateDocumentVerificationStatus = (requestId, docKey, status, reason = '') => {
    setState((prev) => {
      const updatedRequests = (prev.verificationRequests || []).map((req) => {
        if (req.id !== requestId) return req;

        const updatedReq = { ...req };
        
        if (docKey === 'nationalId_front' && updatedReq.nationalId?.front) {
          updatedReq.nationalId = {
            ...updatedReq.nationalId,
            front: { ...updatedReq.nationalId.front, status, rejectionReason: reason }
          };
        } else if (docKey === 'nationalId_back' && updatedReq.nationalId?.back) {
          updatedReq.nationalId = {
            ...updatedReq.nationalId,
            back: { ...updatedReq.nationalId.back, status, rejectionReason: reason }
          };
        } else if (docKey === 'driverLicense_front' && updatedReq.driverLicense?.front) {
          updatedReq.driverLicense = {
            ...updatedReq.driverLicense,
            front: { ...updatedReq.driverLicense.front, status, rejectionReason: reason }
          };
        } else if (docKey === 'driverLicense_back' && updatedReq.driverLicense?.back) {
          updatedReq.driverLicense = {
            ...updatedReq.driverLicense,
            back: { ...updatedReq.driverLicense.back, status, rejectionReason: reason }
          };
        } else if (docKey === 'vehicleRegistration' && updatedReq.vehicleRegistration) {
          updatedReq.vehicleRegistration = {
            ...updatedReq.vehicleRegistration,
            status,
            rejectionReason: reason
          };
        } else if (docKey === 'vehicleRegistrationBack' && updatedReq.vehicleRegistrationBack) {
          updatedReq.vehicleRegistrationBack = {
            ...updatedReq.vehicleRegistrationBack,
            status,
            rejectionReason: reason
          };
        }

        // Re-calculate overall status
        const docs = [];
        if (updatedReq.nationalId?.front) docs.push(updatedReq.nationalId.front);
        if (updatedReq.nationalId?.back) docs.push(updatedReq.nationalId.back);
        if (updatedReq.driverLicense?.front) docs.push(updatedReq.driverLicense.front);
        if (updatedReq.driverLicense?.back) docs.push(updatedReq.driverLicense.back);
        if (updatedReq.vehicleRegistration) docs.push(updatedReq.vehicleRegistration);
        if (updatedReq.vehicleRegistrationBack) docs.push(updatedReq.vehicleRegistrationBack);

        const allApproved = docs.every(d => d && d.status === 'approved');
        const anyRejected = docs.some(d => d && d.status === 'rejected');

        if (allApproved) {
          updatedReq.status = 'verified';
          updatedReq.rejectionReason = '';
        } else if (anyRejected) {
          updatedReq.status = 'rejected';
          const rejectedReasons = docs
            .filter(d => d && d.status === 'rejected' && d.rejectionReason)
            .map(d => d.rejectionReason);
          updatedReq.rejectionReason = rejectedReasons.join('; ') || 'Some documents were rejected.';
        } else {
          updatedReq.status = 'pending';
        }

        return updatedReq;
      });

      return {
        ...prev,
        verificationRequests: updatedRequests,
      };
    });
  };

  const uploadDriverDocument = (requestId, docKey, fileObj) => {
    setState((prev) => {
      const updatedRequests = (prev.verificationRequests || []).map((req) => {
        if (req.id !== requestId) return req;

        const updatedReq = { ...req };
        const newDoc = {
          name: fileObj.name,
          type: fileObj.type,
          size: fileObj.size,
          url: fileObj.url,
          uploadedAt: new Date().toISOString(),
          status: 'pending',
          rejectionReason: ''
        };

        if (docKey === 'nationalId_front') {
          updatedReq.nationalId = {
            ...updatedReq.nationalId,
            front: newDoc
          };
        } else if (docKey === 'nationalId_back') {
          updatedReq.nationalId = {
            ...updatedReq.nationalId,
            back: newDoc
          };
        } else if (docKey === 'driverLicense_front') {
          updatedReq.driverLicense = {
            ...updatedReq.driverLicense,
            front: newDoc
          };
        } else if (docKey === 'driverLicense_back') {
          updatedReq.driverLicense = {
            ...updatedReq.driverLicense,
            back: newDoc
          };
        } else if (docKey === 'vehicleRegistration') {
          updatedReq.vehicleRegistration = newDoc;
        } else if (docKey === 'vehicleRegistrationBack') {
          updatedReq.vehicleRegistrationBack = newDoc;
        }

        // Re-calculate overall status
        const docs = [];
        if (updatedReq.nationalId?.front) docs.push(updatedReq.nationalId.front);
        if (updatedReq.nationalId?.back) docs.push(updatedReq.nationalId.back);
        if (updatedReq.driverLicense?.front) docs.push(updatedReq.driverLicense.front);
        if (updatedReq.driverLicense?.back) docs.push(updatedReq.driverLicense.back);
        if (updatedReq.vehicleRegistration) docs.push(updatedReq.vehicleRegistration);
        if (updatedReq.vehicleRegistrationBack) docs.push(updatedReq.vehicleRegistrationBack);

        const allApproved = docs.every(d => d && d.status === 'approved');
        const anyRejected = docs.some(d => d && d.status === 'rejected');

        if (allApproved) {
          updatedReq.status = 'verified';
          updatedReq.rejectionReason = '';
        } else if (anyRejected) {
          updatedReq.status = 'rejected';
          const rejectedReasons = docs
            .filter(d => d && d.status === 'rejected' && d.rejectionReason)
            .map(d => d.rejectionReason);
          updatedReq.rejectionReason = rejectedReasons.join('; ') || 'Some documents were rejected.';
        } else {
          updatedReq.status = 'pending';
        }

        return updatedReq;
      });

      return {
        ...prev,
        verificationRequests: updatedRequests,
      };
    });
  };

  const sendDriverNotification = (notificationData) => {
    const newNotification = {
      id: uid('notif'),
      ...notificationData,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      driverNotifications: [newNotification, ...(prev.driverNotifications || [])],
    }));
    return { ok: true };
  };

  const deleteDriverNotification = (notificationId) => {
    setState((prev) => ({
      ...prev,
      driverNotifications: (prev.driverNotifications || []).filter((n) => n.id !== notificationId),
    }));
  };

  const updateDriverNotification = (notificationId, updatedData) => {
    setState((prev) => ({
      ...prev,
      driverNotifications: (prev.driverNotifications || []).map((n) =>
        n.id === notificationId ? { ...n, ...updatedData } : n
      ),
    }));
    return { ok: true };
  };


  const sendUserNotification = (notificationData) => {
    const newNotification = {
      id: uid('notif'),
      ...notificationData,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      userNotifications: [newNotification, ...(prev.userNotifications || [])],
    }));
    return { ok: true };
  };

  const deleteUserNotification = (notificationId) => {
    setState((prev) => ({
      ...prev,
      userNotifications: (prev.userNotifications || []).filter((n) => n.id !== notificationId),
    }));
  };

  const updateUserNotification = (notificationId, updatedData) => {
    setState((prev) => ({
      ...prev,
      userNotifications: (prev.userNotifications || []).map((n) =>
        n.id === notificationId ? { ...n, ...updatedData } : n
      ),
    }));
    return { ok: true };
  };


  const sendCompanyNotification = (notificationData) => {
    const newNotification = {
      id: uid('notif'),
      ...notificationData,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      companyNotifications: [newNotification, ...(prev.companyNotifications || [])],
    }));
    return { ok: true };
  };

  const deleteCompanyNotification = (notificationId) => {
    setState((prev) => ({
      ...prev,
      companyNotifications: (prev.companyNotifications || []).filter((n) => n.id !== notificationId),
    }));
  };

  const updateCompanyNotification = (notificationId, updatedData) => {
    setState((prev) => ({
      ...prev,
      companyNotifications: (prev.companyNotifications || []).map((n) =>
        n.id === notificationId ? { ...n, ...updatedData } : n
      ),
    }));
    return { ok: true };
  };


  const createCoupon = (couponData) => {
    const newCoupon = {
      id: uid('coupon'),
      ...couponData,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      coupons: [newCoupon, ...(prev.coupons || [])],
    }));
    return { ok: true };
  };

  const deleteCoupon = (couponId) => {
    setState((prev) => ({
      ...prev,
      coupons: (prev.coupons || []).filter((c) => c.id !== couponId),
    }));
  };

  const toggleCouponStatus = (couponId) => {
    setState((prev) => ({
      ...prev,
      coupons: (prev.coupons || []).map((c) => {
        if (c.id === couponId) {
          const nextStatus = c.status === 'active' ? 'inactive' : 'active';
          return { ...c, status: nextStatus };
        }
        return c;
      }),
    }));
  };

  const verifyCompanyCar = async (carId) => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.token) {
      const apiResult = await updateCompanyCarStatusApi(carId, 'APPROVED', currentUser.token);
      if (apiResult.success) {
        await syncAllCompanyCars(currentUser.token);
        return;
      }
      console.error('Failed to verify company car on backend:', apiResult.message);
    }

    setState((prev) => ({
      ...prev,
      allCompanyCars: prev.allCompanyCars.map((car) =>
        car.id === carId ? { ...car, status: 'verified', rejectionReason: '' } : car,
      ),
    }));
  };

  const rejectCompanyCar = async (carId, reason) => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.token) {
      const apiResult = await updateCompanyCarStatusApi(carId, 'REJECTED', currentUser.token);
      if (apiResult.success) {
        await syncAllCompanyCars(currentUser.token);
        return;
      }
      console.error('Failed to reject company car on backend:', apiResult.message);
    }

    setState((prev) => ({
      ...prev,
      allCompanyCars: prev.allCompanyCars.map((car) =>
        car.id === carId ? { ...car, status: 'rejected', rejectionReason: reason || 'Documents not approved.' } : car,
      ),
    }));
  };

  const resetDemoData = () => {
    setState({
      ...seedState,
      driverNotifications: [],
      userNotifications: [],
      companyNotifications: [],
      coupons: seedState.coupons || [],
    });
    setCurrentUser(null);
    localStorage.removeItem('car_rental_current_user');
  };

  const value = useMemo(
    () => ({
      state,
      currentUser,
      login,
      logout,
      registerCompany,
      verifyCompany,
      rejectCompany,
      addCar,
      updateCar,
      syncCompanyCars,
      updateCarStatus,
      deleteCar,
      createRentalRequest,
      uploadUserDocuments,
      approveRentalRequest,
      rejectRentalRequest,
      markReturned,
      approveVerificationRequest,
      rejectVerificationRequest,
      updateDocumentVerificationStatus,
      uploadDriverDocument,
      sendDriverNotification,
      deleteDriverNotification,
      updateDriverNotification,
      sendUserNotification,
      deleteUserNotification,
      updateUserNotification,
      sendCompanyNotification,
      deleteCompanyNotification,
      updateCompanyNotification,
      createCoupon,
      deleteCoupon,
      toggleCouponStatus,
      resetDemoData,
      verifyCompanyCar,
      rejectCompanyCar,
    }),
    [state, currentUser],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
