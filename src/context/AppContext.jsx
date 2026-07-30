import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedState } from '../data/mockData';
import { loadState, saveState, uid } from '../utils/storage';
import { registerCompanyApi, loginCompanyApi, fetchCompanyCarsApi } from '../utils/api';

const AppContext = createContext(null);

const initialState = () => {
  const loaded = loadState();
  if (!loaded) return seedState;
  return {
    ...seedState,
    ...loaded,
    verificationRequests: loaded.verificationRequests || seedState.verificationRequests || [],
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

  const login = async ({ email, password, role }) => {
    if (role === 'admin') {
      const apiResult = await loginCompanyApi(email, password);
      if (!apiResult.success) {
        return { ok: false, message: apiResult.message };
      }

      const companyData = apiResult.companyData;
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
      return { ok: true };
    }

    const user = state.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password && item.role === role,
    );
    if (!user) return { ok: false, message: 'Invalid credentials or incorrect role.' };
    setCurrentUser(user);
    return { ok: true };
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

  const verifyCompany = (companyId) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((company) =>
        company.id === companyId ? { ...company, status: 'verified', rejectionReason: '' } : company,
      ),
    }));
  };

  const rejectCompany = (companyId, reason) => {
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
    const formattedCars = backendCars.map((backendCar) => {
      const formattedPhotos = (backendCar.vehiclePhotos || []).map((photo) =>
        photo.startsWith('http') ? photo : `https://node.aitechnotech.in/biip/uploads/company-car/${photo}`
      );

      return {
        id: backendCar._id || uid('car'),
        companyId: backendCar.companyId,
        name: backendCar.carName,
        brand: backendCar.vehicleBrand,
        model: backendCar.vehicleModel,
        year: backendCar.manufacturingYear,
        registrationNo: backendCar.registrationNo,
        fuelType: backendCar.fuelType,
        transmission: backendCar.transmission,
        seats: backendCar.noOfSeats,
        doors: backendCar.noOfDoors,
        pricePerDay: backendCar.perDayCharge,
        mileage: backendCar.mileage,
        color: backendCar.color,
        vinNumber: backendCar.vinNumber,
        ac: backendCar.airConditioning,
        description: backendCar.description,
        status: 'available',
        image: formattedPhotos[0] || '',
        photos: formattedPhotos,
        insuranceInvoice: backendCar.insuranceInvoice,
        registrationCardImage: backendCar.registrationCardImage,
        createdAt: backendCar.createdAt || new Date().toISOString(),
      };
    });

    setState((prev) => {
      const companyId = currentUser?.companyId;
      const otherCars = prev.cars.filter((car) => car.companyId !== companyId);
      return {
        ...prev,
        cars: [...formattedCars, ...otherCars],
      };
    });
  };

  const addCar = (backendCar) => {
    const formattedPhotos = (backendCar.vehiclePhotos || []).map((photo) =>
      photo.startsWith('http') ? photo : `https://node.aitechnotech.in/biip/uploads/company-car/${photo}`
    );

    const newCar = {
      id: backendCar._id || uid('car'),
      companyId: backendCar.companyId,
      name: backendCar.carName,
      brand: backendCar.vehicleBrand,
      model: backendCar.vehicleModel,
      year: backendCar.manufacturingYear,
      registrationNo: backendCar.registrationNo,
      fuelType: backendCar.fuelType,
      transmission: backendCar.transmission,
      seats: backendCar.noOfSeats,
      doors: backendCar.noOfDoors,
      pricePerDay: backendCar.perDayCharge,
      mileage: backendCar.mileage,
      color: backendCar.color,
      vinNumber: backendCar.vinNumber,
      ac: backendCar.airConditioning,
      description: backendCar.description,
      status: 'available',
      image: formattedPhotos[0] || '',
      photos: formattedPhotos,
      insuranceInvoice: backendCar.insuranceInvoice,
      registrationCardImage: backendCar.registrationCardImage,
      createdAt: backendCar.createdAt || new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, cars: [newCar, ...prev.cars] }));
  };

  const updateCar = (backendCar) => {
    const formattedPhotos = (backendCar.vehiclePhotos || []).map((photo) =>
      photo.startsWith('http') ? photo : `https://node.aitechnotech.in/biip/uploads/company-car/${photo}`
    );

    const updated = {
      id: backendCar._id || uid('car'),
      companyId: backendCar.companyId,
      name: backendCar.carName,
      brand: backendCar.vehicleBrand,
      model: backendCar.vehicleModel,
      year: backendCar.manufacturingYear,
      registrationNo: backendCar.registrationNo,
      fuelType: backendCar.fuelType,
      transmission: backendCar.transmission,
      seats: backendCar.noOfSeats,
      doors: backendCar.noOfDoors,
      pricePerDay: backendCar.perDayCharge,
      mileage: backendCar.mileage,
      color: backendCar.color,
      vinNumber: backendCar.vinNumber,
      ac: backendCar.airConditioning,
      description: backendCar.description,
      status: backendCar.status || 'available',
      image: formattedPhotos[0] || '',
      photos: formattedPhotos,
      insuranceInvoice: backendCar.insuranceInvoice,
      registrationCardImage: backendCar.registrationCardImage,
      createdAt: backendCar.createdAt || new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      cars: prev.cars.map((car) => (car.id === updated.id ? updated : car)),
    }));
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

  const approveVerificationRequest = (requestId) => {
    setState((prev) => ({
      ...prev,
      verificationRequests: (prev.verificationRequests || []).map((req) =>
        req.id === requestId ? { ...req, status: 'verified', rejectionReason: '' } : req
      ),
    }));
  };

  const rejectVerificationRequest = (requestId, reason) => {
    setState((prev) => ({
      ...prev,
      verificationRequests: (prev.verificationRequests || []).map((req) =>
        req.id === requestId ? { ...req, status: 'rejected', rejectionReason: reason || 'Documents not clear.' } : req
      ),
    }));
  };

  const resetDemoData = () => {
    setState(seedState);
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
      resetDemoData,
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
