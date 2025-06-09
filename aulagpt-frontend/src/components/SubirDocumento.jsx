import React, { useState } from 'react';
import axios from 'axios';

function SubirDocumento() {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [classId, setClassId] = useState('');  // Nuevo estado para clase
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const materias = [
    'Matemáticas',
    'Lengua',
    'Ciencias',
    'Historia',
    'Inglés',
    'Física',
    'Química',
  ];

  // Aquí pones tus clases. Si las tienes dinámicas, tendrás que traerlas de la API.
  const clases = [
    { id: 1, nombre: 'Provisional' },
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMensaje('');
    setError('');
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setMensaje('');
    setError('');
  };

  const handleClassChange = (e) => {
    setClassId(e.target.value);
    setMensaje('');
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor, selecciona un archivo.');
      setMensaje('');
      return;
    }

    if (!subject) {
      setError('Por favor, selecciona una materia.');
      setMensaje('');
      return;
    }

    if (!classId) {
      setError('Por favor, selecciona una clase.');
      setMensaje('');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('class_id', classId);  // Se envía class_id al backend

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No se encontró el token. Por favor inicia sesión.');
        return;
      }

      const response = await axios.post(
        'https://aulagpt.onrender.com/api/documents/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensaje('Documento subido correctamente.');
      setError('');
      setFile(null);
      setSubject('');
      setClassId('');
      e.target.reset();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('No autorizado. Por favor inicia sesión de nuevo.');
      } else {
        setError('Error al subir el documento.');
      }
      setMensaje('');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Subir Documento</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <br /><br />

        <select value={subject} onChange={handleSubjectChange}>
          <option value="">-- Selecciona una materia --</option>
          {materias.map((mat, i) => (
            <option key={i} value={mat}>
              {mat}
            </option>
          ))}
        </select>
        <br /><br />

        <select value={classId} onChange={handleClassChange}>
          <option value="">-- Selecciona una clase --</option>
          {clases.map((clase) => (
            <option key={clase.id} value={clase.id}>
              {clase.nombre}
            </option>
          ))}
        </select>
        <br /><br />

        <button type="submit">Subir</button>
      </form>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default SubirDocumento;
