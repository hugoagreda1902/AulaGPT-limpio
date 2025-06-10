// src/api/dataService.js
import API from './axiosConfig';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Importa la URL base de la API desde las variables de entorno

// Añadir un usuario
export const addUser = async (user) => {
  try {
    const response = await API.post('/users/', user);
    return response.data;  // Lo que devuelva tu backend (por ejemplo, ID o usuario creado)
  } catch (error) {
    console.error("Error adding user: ", error);
    throw error; // Para manejarlo donde llames la función
  }
};

// Obtener usuarios
export const getUsers = async () => {
  try {
    const response = await API.get('/users');
    return response.data;  // Lista de usuarios que devuelve el backend
  } catch (error) {
    console.error("Error getting users: ", error);
    throw error;
  }
};

// Preguntar a la IA
export const askQuestion = async (question) => {
  try {
    const response = await API.post(`${API_BASE_URL}/ask/`, { question }); // Usa la URL base de la API
    return response.data;
  } catch (error) {
    console.error("Error asking question: ", error);
    throw error;
  }
};
