// src/api/dataService.js
import API from './axiosConfig';

// Registro de usuario
export const registerUser = (user) =>
  API.post('/users/register/', user).then(res => res.data);

// 🔐 Login (token JWT desde SimpleJWT)
export const loginUser = (credentials) =>
  API.post('/token/', credentials).then(res => res.data);

// 🧠 Pregunta a la IA
export const askQuestion = (question, subject, action = 'answer') => {
  const token = localStorage.getItem("token");

  if (!token) {
    return Promise.reject(new Error("❌ No hay token en localStorage"));
  }

  return API.post('/ask/', { question, subject, action }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.data)
    .catch(err => {
      if (err.response?.data) return err.response.data;
      throw err;
    });
};

// 📤 Subida de documento
export const uploadDocument = (file, subject) => {
  const form = new FormData();
  form.append('file', file);
  form.append('subject', subject);

  const token = localStorage.getItem("token");

  if (!token) {
    return Promise.reject(new Error("❌ No hay token en localStorage"));
  }

  return API.post('/documents/', form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data)
    .catch(err => {
      console.error("Error al subir documento:", err);
      throw err;
    });
};

// 🧪 Envío de respuestas de test
export const submitTest = (subject, answers) =>
  API.post('/tests/submit/', { subject, answers })
    .then(res => res.data)
    .catch(err => {
      if (err.response?.data) return err.response.data;
      throw err;
    });
