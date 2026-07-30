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

