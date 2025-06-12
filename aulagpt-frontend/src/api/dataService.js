import API from './axiosConfig';

// Registro de usuario
export const registerUser = (user) =>
  API.post('/users/register/', user).then(res => res.data);

// Login: simplejwt
export const loginUser = (creds) =>
  API.post('/token/', creds).then(res => res.data);

// Chat / Resumen
export const askQuestion = (question, subject, action = 'answer') =>
  API.post('/ask/', { question, subject, action }).then(res => res.data);

// Subida de documento
export const uploadDocument = (file, subject) => {
  const form = new FormData();
  form.append('file', file);

  // Si el backend espera el campo "subject"
  if (subject) form.append('subject', subject);

  return API.post('/documents/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};
