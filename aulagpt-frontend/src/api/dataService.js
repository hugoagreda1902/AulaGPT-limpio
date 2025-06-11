import API from './axiosConfig';

// Registro de usuario
export const registerUser = (user) =>
  API.post('/users/register/', user).then(res => res.data);

// Login: simplejwt
export const loginUser = (creds) =>
  API.post('/token/', creds).then(res => res.data);

// Listar asignaturas (antes classes)
export const getSubjects = () =>
  API.get('/subjects/').then(res => res.data);

// Chat / Resumen
export const askQuestion = (question, subjectId, action = 'answer') =>
  API.post('/ask/', { question, subject_id: subjectId, action }).then(res => res.data);

// Subida de documento
export const uploadDocument = (file, subjectId) => {
  const form = new FormData();
  form.append('file', file);

  // Si el backend espera el campo "subject" (no class_id)
  if (subjectId) form.append('subject', subjectId);

  return API.post('/documents/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};
