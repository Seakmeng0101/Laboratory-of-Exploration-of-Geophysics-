import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

const skipRoutes = [
  '/auth/login',
  '/auth/refresh',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/members',
  '/teams',
  '/services',
  '/projects',
  '/equipments',
  '/team-contacts',
  '/contact',
];

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

export const login = (email: string, password: string) =>
  API.post('/auth/login', { email, password });

export const verifyOtp = (otp: string) =>
  API.post('/auth/verify-otp', { otp });

export const logout = (refreshToken: string) =>
  API.post('/auth/logout', { refreshToken });

export const getMe = () =>
  API.get('/auth/me');

export const forgotPassword = (email: string) =>
  API.post('/auth/forgot-password', { email });

export const resetPassword = (email: string, password: string, confirmPassword: string) =>
  API.post('/auth/reset-password', { email, password, confirmPassword });

export const resendOtp = (email: string) =>
  API.post('/auth/resend-otp', { email });