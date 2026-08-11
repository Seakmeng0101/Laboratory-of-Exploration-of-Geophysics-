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

export const getAllEquipments = () => API.get('/equipments');
export const getEquipmentById = (id: string) => API.get(`/equipments/${id}`);
export const createEquipment = (data: FormData) => API.post('/equipments', data);
export const updateEquipment = (id: string, data: FormData) => API.put(`/equipments/${id}`, data);
export const deleteEquipment = (id: string) => API.delete(`/equipments/${id}`);