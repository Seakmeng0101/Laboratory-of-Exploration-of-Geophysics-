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

export const getAllTeamContacts = () => API.get('/team-contacts');
export const createTeamContact = (data: FormData) => API.post('/team-contacts', data);
export const updateTeamContact = (id: string, data: FormData) => API.put(`/team-contacts/${id}`, data);
export const deleteTeamContact = (id: string) => API.delete(`/team-contacts/${id}`);