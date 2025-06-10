import React, { useState, useEffect, useRef } from "react";
import { askQuestion } from '../api/dataService'; // Importa la función askQuestion desde dataService.js

function ChatIA() {
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Estados para subir documentos
  const [mostrarSubida, setMostrarSubida] = useState(false);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [classId, setClassId] = useState("");
  const [mensajeSubida, setMensajeSubida] = useState("");
  const [errorSubida, setErrorSubida] = useState("");

  const materias = [
    "Matemáticas",
    "Lengua",
    "Ciencias",
    "Historia",
    "Inglés",
    "Física",
    "Química",
  ];
  const clases = [{ id: 1, nombre: "Provisional" }]; // Puedes cambiarlo por fetch a la API

  const chatContainerRef = useRef(null);

  // Auto scroll al último mensaje
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const nuevoMensaje = { autor: "usuario", texto: input };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setInput("");
    setCargando(true);
    setError("");

    try {
      // Llama a la función askQuestion para enviar la pregunta al backend
      const response = await askQuestion(input);
      const respuestaIA = response.answer; // Ajusta esto según la estructura de la respuesta de tu API
      setMensajes((prev) => [...prev, { autor: "ia", texto: respuestaIA }]);
    } catch (err) {
      console.error(err);
      setError("Error al comunicarse con la IA");
    } finally {
      setCargando(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMensajeSubida("");
    setErrorSubida("");

    if (!file || !subject || !classId) {
      setErrorSubida("Faltan datos para la subida del documento.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject);
    formData.append("class_id", classId);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://aulagpt.onrender.com/api/documents/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensajeSubida("Documento subido correctamente.");
      setFile(null);
      setSubject("");
      setClassId("");
    } catch (err) {
      console.error(err);
      setErrorSubida("Error al subir el documento.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
      <h2>Chat con AulaGPT</h2>

      <div
        ref={chatContainerRef}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
          backgroundColor: "#fafafa",
        }}
      >
        {mensajes.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.autor === "usuario" ? "right" : "left",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                backgroundColor: msg.autor === "usuario" ? "#d1e7dd" : "#f8d7da",
                padding: "8px 12px",
                borderRadius: "12px",
                display: "inline-block",
                maxWidth: "75%",
                wordWrap: "break-word",
              }}
            >
              {msg.texto}
            </span>
          </div>
        ))}
        {cargando && <p>Cargando respuesta...</p>}
      </div>

      <form
        onSubmit={handleSend}
        style={{ display: "flex", gap: "8px", marginBottom: "10px" }}
      >
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
          disabled={cargando}
          autoComplete="off"
        />
        <button type="submit" style={{ padding: "8px 12px" }} disabled={cargando}>
          Enviar
        </button>
      </form>

      <button
        onClick={() => setMostrarSubida(!mostrarSubida)}
        style={{ marginBottom: "10px" }}
      >
        {mostrarSubida ? "Ocultar subida de documentos" : "Subir documento"}
      </button>

      {mostrarSubida && (
        <form onSubmit={handleUpload}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <br />
          <br />

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">-- Selecciona una materia --</option>
            {materias.map((mat, i) => (
              <option key={i} value={mat}>
                {mat}
              </option>
            ))}
          </select>
          <br />
          <br />

          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
          >
            <option value="">-- Selecciona una clase --</option>
            {clases.map((clase) => (
              <option key={clase.id} value={clase.id}>
                {clase.nombre}
              </option>
            ))}
          </select>
          <br />
          <br />

          <button type="submit">Subir</button>

          {mensajeSubida && <p style={{ color: "green" }}>{mensajeSubida}</p>}
          {errorSubida && <p style={{ color: "red" }}>{errorSubida}</p>}
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default ChatIA;
