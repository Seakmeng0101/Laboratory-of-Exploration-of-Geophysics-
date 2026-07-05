import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

const skipRoutes = ['/auth/login', '/auth/refresh', '/auth/verify-otp', '/auth/resend-otp', '/auth/forgot-password', '/auth/reset-password'];

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isSkipped = skipRoutes.some(route => originalRequest.url?.includes(route));

    if (error.response?.status === 401 && !originalRequest._retry && !isSkipped) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          sessionStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        const res = await axios.post('http://localhost:4000/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getAllServices = () => API.get('/services');
export const getServiceById = (id: string) => API.get(`/services/${id}`);
export const createService = (data: FormData) => API.post('/services', data);
export const updateService = (id: string, data: FormData) => API.put(`/services/${id}`, data);
export const deleteService = (id: string) => API.delete(`/services/${id}`);