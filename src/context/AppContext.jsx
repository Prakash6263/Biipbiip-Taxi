import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedState } from '../data/mockData';
import { loadState, saveState, uid } from '../utils/storage';

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

  const login = ({ email, password, role }) => {
    const user = state.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password && item.role === role,
    );
    if (!user) return { ok: false, message: 'Invalid credentials ya role galat hai.' };
    setCurrentUser(user);
    return { ok: true };
  };

  const logout = () => setCurrentUser(null);

  const registerCompany = ({ adminName, email, password, company }) => {
    const existing = state.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (existing) return { ok: false, message: 'Is email se account already exist karta hai.' };

    const adminId = uid('admin');
    const companyId = uid('company');
    const newAdmin = {
      id: adminId,
      name: adminName,
      email,
      password,
      role: 'admin',
      companyId,
    };

    const newCompany = {
      id: companyId,
      adminId,
      ...company,
      status: 'pending',
      rejectionReason: '',
      createdAt: new Date().toISOString(),
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

  const addCar = (car) => {
    const newCar = {
      id: uid('car'),
      ...car,
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, cars: [newCar, ...prev.cars] }));
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
