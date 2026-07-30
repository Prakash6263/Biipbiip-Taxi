const API_BASE_URL = 'https://node.aitechnotech.in/biip/api/v1';

export const registerCompanyApi = async (data) => {
  try {
    const formData = new FormData();
    formData.append('adminName', data.adminName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('companyName', data.companyName);
    formData.append('ownerName', data.ownerName);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('gstNumber', data.gstNumber || '');

    if (data.documents) {
      // If documents is a FileList or array of File objects
      const filesArray = Array.from(data.documents);
      filesArray.forEach((file) => {
        formData.append('documents', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/company/register`, {
      method: 'POST',
      body: formData,
    });

    const resJson = await response.json();

    if (!response.ok || !resJson.success) {
      return {
        success: false,
        message: resJson.message || 'Registration failed from server',
      };
    }

    return {
      success: true,
      company: resJson.data.company,
      message: resJson.message,
    };
  } catch (error) {
    console.error('API Error in registerCompanyApi:', error);
    return {
      success: false,
      message: error.message || 'Network error occurred during registration.',
    };
  }
};

export const loginCompanyApi = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/login`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const resJson = await response.json();

    if (!response.ok || !resJson.success) {
      return {
        success: false,
        message: resJson.message || 'Login failed from server',
      };
    }

    return {
      success: true,
      companyData: resJson.data.companyData,
      message: resJson.message,
    };
  } catch (error) {
    console.error('API Error in loginCompanyApi:', error);
    return {
      success: false,
      message: error.message || 'Network error occurred during login.',
    };
  }
};

export const addCarApi = async (data, token) => {
  try {
    const formData = new FormData();
    formData.append('carName', data.carName);
    formData.append('vehicleBrand', data.vehicleBrand);
    formData.append('vehicleModel', data.vehicleModel);
    formData.append('manufacturingYear', data.manufacturingYear);
    formData.append('color', data.color);
    formData.append('vinNumber', data.vinNumber || '');
    formData.append('registrationNo', data.registrationNo);
    formData.append('perDayCharge', data.perDayCharge);
    formData.append('fuelType', data.fuelType);
    formData.append('transmission', data.transmission);
    formData.append('noOfSeats', data.noOfSeats);
    formData.append('noOfDoors', data.noOfDoors);
    formData.append('mileage', data.mileage || '');
    formData.append('airConditioning', String(data.airConditioning));
    formData.append('bluetooth', 'true');
    formData.append('usb', 'true');
    formData.append('gps', 'true');
    formData.append('description', data.description || '');

    if (data.vehiclePhotos && data.vehiclePhotos.length > 0) {
      data.vehiclePhotos.forEach((file) => {
        formData.append('vehiclePhotos', file);
      });
    }

    if (data.insuranceInvoice) {
      formData.append('insuranceInvoice', data.insuranceInvoice);
    }
    if (data.registrationCardImage) {
      formData.append('registrationCardImage', data.registrationCardImage);
    }

    const response = await fetch(`${API_BASE_URL}/company/car`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const resJson = await response.json();

    if (!response.ok || !resJson.success) {
      return {
        success: false,
        message: resJson.message || 'Adding car failed from server',
      };
    }

    return {
      success: true,
      car: resJson.data.car,
      message: resJson.message,
    };
  } catch (error) {
    console.error('API Error in addCarApi:', error);
    return {
      success: false,
      message: error.message || 'Network error occurred during adding car.',
    };
  }
};

export const fetchCompanyCarsApi = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/cars`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
    });

    const resJson = await response.json();

    if (!response.ok || !resJson.success) {
      return {
        success: false,
        message: resJson.message || 'Fetching cars failed from server',
      };
    }

    return {
      success: true,
      cars: resJson.data.cars,
      message: resJson.message,
    };
  } catch (error) {
    console.error('API Error in fetchCompanyCarsApi:', error);
    return {
      success: false,
      message: error.message || 'Network error occurred during fetching cars.',
    };
  }
};

export const updateCarApi = async (data, token) => {
  try {
    const formData = new FormData();
    formData.append('carId', data.carId);
    formData.append('carName', data.carName);
    formData.append('vehicleBrand', data.vehicleBrand);
    formData.append('vehicleModel', data.vehicleModel);
    formData.append('manufacturingYear', data.manufacturingYear);
    formData.append('color', data.color);
    formData.append('vinNumber', data.vinNumber || '');
    formData.append('registrationNo', data.registrationNo);
    formData.append('perDayCharge', data.perDayCharge);
    formData.append('fuelType', data.fuelType);
    formData.append('transmission', data.transmission);
    formData.append('noOfSeats', data.noOfSeats);
    formData.append('noOfDoors', data.noOfDoors);
    formData.append('mileage', data.mileage || '');
    formData.append('airConditioning', String(data.airConditioning));
    formData.append('bluetooth', 'true');
    formData.append('usb', 'true');
    formData.append('gps', 'true');
    formData.append('description', data.description || '');

    if (data.vehiclePhotos && data.vehiclePhotos.length > 0) {
      data.vehiclePhotos.forEach((file) => {
        if (file instanceof File) {
          formData.append('vehiclePhotos', file);
        }
      });
    } else {
      formData.append('vehiclePhotos', 'string');
    }

    if (data.insuranceInvoice) {
      formData.append('insuranceInvoice', data.insuranceInvoice);
    }
    if (data.registrationCardImage) {
      formData.append('registrationCardImage', data.registrationCardImage);
    }

    const response = await fetch(`${API_BASE_URL}/company/car`, {
      method: 'PATCH',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const resJson = await response.json();

    if (!response.ok || !resJson.success) {
      return {
        success: false,
        message: resJson.message || 'Updating car failed from server',
      };
    }

    return {
      success: true,
      car: resJson.data.car,
      message: resJson.message,
    };
  } catch (error) {
    console.error('API Error in updateCarApi:', error);
    return {
      success: false,
      message: error.message || 'Network error occurred during updating car.',
    };
  }
};



