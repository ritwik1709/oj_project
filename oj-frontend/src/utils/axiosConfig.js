import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      hasToken: !!token
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing session...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use navigate instead of window.location for a smoother transition
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 