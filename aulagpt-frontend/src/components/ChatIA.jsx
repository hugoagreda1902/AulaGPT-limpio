import React, { useState, useEffect, useRef } from "react";
import { askQuestion } from '../api/dataService'; // Importa la función askQuestion desde dataService.js

function ChatIA() {
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Estados para subida de documentos
  const [mostrarSubida, setMostrarSubida] = useState(false);
  const [file, setFile] = useState(null);
  const [mensajeSubida, setMensajeSubida] = useState("");
  const [errorSubida, setErrorSubida] = useState("");

  // Listado de clases/provisional o fetch real
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");

  const chatContainerRef = useRef(null);

  // Obtener asignaturas al montar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('https://aulagpt.onrender.com/api/classes/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data.length) setSubjectId(data[0].class_id);
      })
      .catch(console.error);
  }, []);

  // Auto scroll al ultimo mensaje
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  // Envía pregunta o resumen segun action
  const handleSend = async (e, action = 'answer') => {
    e && e.preventDefault();
    const text = input.trim();
    if (!text || !subjectId) return;

    setMensajes(prev => [...prev, { autor: 'usuario', texto: text }]);
    setInput("");
    setCargando(true);
    setError("");

    try {
      const response = await askQuestion(text, subjectId, action);
      const respuestaIA = response.answer; // JSON con { answer }
      setMensajes(prev => [...prev, { autor: 'ia', texto: respuestaIA }]);
    } catch (err) {
      console.error(err);
      setError("Error al comunicarse con la IA");
    } finally {
      setCargando(false);
    }
  };

  // Manejo de subida de documentos
  const handleUpload = async (e) => {
    e.preventDefault();
    setMensajeSubida("");
    setErrorSubida("");

    if (!file || !subjectId) {
      setErrorSubida("Selecciona un archivo y una asignatura.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subjectId);
    formData.append("class_id", subjectId);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('https://aulagpt.onrender.com/api/documents/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Error en subida');

      setMensajeSubida("Documento subido correctamente.");
      setFile(null);
    } catch (err) {
      console.error(err);
      setErrorSubida("Error al subir el documento.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Chat con AulaGPT</h2>

      {/* Selector de asignatura */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Asignatura:</label>
        <select
          value={subjectId}
          onChange={e => setSubjectId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {subjects.map(sub => (
            <option key={sub.class_id} value={sub.class_id}>
              {sub.class_name}
            </option>
          ))}
        </select>
      </div>

      {/* Historial de chat */}
      <div
        ref={chatContainerRef}
        className="border rounded p-4 h-80 overflow-y-auto bg-white mb-4"
      >
        {mensajes.map((msg, i) => (
          <div key={i} className="mb-4">
            <p className="text-xs text-gray-400">
              {new Date(msg.timestamp || Date.now()).toLocaleString()}
            </p>
            <p><strong>{msg.autor === 'usuario' ? 'Tú' : 'IA'}:</strong> {msg.texto}</p>
          </div>
        ))}
        {cargando && <p className="text-gray-500">Cargando respuesta...</p>}
      </div>

      {/* Input y botones */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend(e, 'answer')}
          className="flex-1 border rounded px-3 py-2"
          disabled={cargando}
          autoComplete="off"
        />
        <button
          onClick={e => handleSend(e, 'answer')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={cargando}
        >Enviar</button>
        <button
          onClick={e => handleSend(e, 'summary')}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={cargando}
        >Resumir</button>
      </div>

      {/* Subida de documentos */}
      <button
        onClick={() => setMostrarSubida(prev => !prev)}
        className="text-blue-600 mb-2"
      >
        {mostrarSubida ? 'Ocultar subida de documentos' : 'Subir documento'}
      </button>

      {mostrarSubida && (
        <form onSubmit={handleUpload} className="space-y-2">
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            className="block"
          />
          <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded">
            Subir
          </button>
          {mensajeSubida && <p className="text-green-600">{mensajeSubida}</p>}
          {errorSubida && <p className="text-red-600">{errorSubida}</p>}
        </form>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default ChatIA;
