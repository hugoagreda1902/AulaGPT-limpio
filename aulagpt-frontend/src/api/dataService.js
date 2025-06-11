// src/api/dataService.js
import API from './axiosConfig';

// Registro de usuario
export const registerUser = (user) =>
  API.post('/users/register/', user).then(res => res.data);

// Login: simplejwt
export const loginUser = (creds) =>
  API.post('/token/', creds).then(res => res.data);

// Listar clases
export const getClasses = () =>
  API.get('/classes/').then(res => res.data);

// Chat / Resumen
export const askQuestion = (question, subject_id, action='answer') =>
  API.post('/ask/', { question, subject_id, action }).then(res => res.data);

// Subida de documento
export const uploadDocument = (file, subject_id) => {
  const form = new FormData();
  form.append('file', file);
  form.append('class_id', subject_id);
  form.append('subject', subject_id);
  return API.post('/documents/', form, {
    headers: {'Content-Type':'multipart/form-data'}
  }).then(res => res.data);
};
