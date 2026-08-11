import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const getAllServices = () => API.get('/services');
export const getServiceById = (id: string) => API.get(`/services/${id}`);
export const createService = (data: FormData) => API.post('/services', data);
export const updateService = (id: string, data: FormData) => API.put(`/services/${id}`, data);
export const deleteService = (id: string) => API.delete(`/services/${id}`);