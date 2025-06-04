import API from './axiosConfig';

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
