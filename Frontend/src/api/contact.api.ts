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

// Message — public (no auth needed)
export const submitMessage = (data: { name: string; email: string; subject: string; message: string }) =>
  axios.post('http://localhost:4000/api/contact', data);
// Team Contacts — CRUD
export const getAllTeamContacts = () => API.get('/contact/team');
export const createTeamContact = (data: FormData) => API.post('/contact/team', data);
export const updateTeamContact = (id: string, data: FormData) => API.put(`/contact/team/${id}`, data);
export const deleteTeamContact = (id: string) => API.delete(`/contact/team/${id}`);