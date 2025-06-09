import React, { useState } from 'react';
import axios from 'axios';

function ChatIA() {
  const [input, setInput] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const nuevoMensaje = { autor: 'usuario', texto: input };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setInput('');
    setCargando(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://aulagpt.onrender.com/api/ask/',
        { pregunta: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const respuestaIA = response.data.respuesta;
      setMensajes((prev) => [...prev, { autor: 'ia', texto: respuestaIA }]);
    } catch (err) {
      console.error(err);
      setError('Error al comunicarse con la IA');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Chat con AulaGPT</h2>
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
          height: '300px',
          overflowY: 'auto',
          marginBottom: '10px',
        }}
      >
        {mensajes.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.autor === 'usuario' ? 'right' : 'left',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                backgroundColor: msg.autor === 'usuario' ? '#d1e7dd' : '#f8d7da',
                padding: '8px 12px',
                borderRadius: '12px',
                display: 'inline-block',
              }}
            >
              {msg.texto}
            </span>
          </div>
        ))}
        {cargando && <p>Cargando respuesta...</p>}
      </div>

      <form onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '80%', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>
          Enviar
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default ChatIA;
