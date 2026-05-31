import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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