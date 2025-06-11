import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatIA.css";
import { askQuestion, uploadDocument } from "../api/dataService";

export default function ChatIA() {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");
  const chatRef = useRef();

  useEffect(() => {
    getClasses()
      .then((data) => {
        setSubjects(data);
        if (data.length) setSubject(data[0].subject); // Usamos subject en vez de class_id
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!subject) return;
    fetch(`${process.env.REACT_APP_API_BASE_URL}/chat-history/?subject=${encodeURIComponent(subject)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setHistory)
      .catch(console.error);
  }, [subject]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history, loading]);

  const send = async (action = "answer") => {
    if (!input.trim() || !subject) return;
    setError("");
    setLoading(true);
    const userMsg = { timestamp: new Date(), autor: "usuario", texto: input };
    setHistory((h) => [...h, userMsg]);
    const question = input;
    setInput("");

    try {
      const { answer } = await askQuestion(question, subject, action); // subject en vez de subjectId
      const botMsg = { timestamp: new Date(), autor: "ia", texto: answer };
      setHistory((h) => [...h, botMsg]);
    } catch (e) {
      console.error(e);
      setError("Error comunicándose con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadErr("");
    setUploadMsg("");
    if (!file || !subject) {
      setUploadErr("Selecciona un archivo y una asignatura.");
      return;
    }
    try {
      await uploadDocument(file, subject); // subject en vez de subjectId
      setUploadMsg("Documento subido correctamente.");
      setFile(null);
    } catch {
      setUploadErr("Error al subir el documento.");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">AulaGPT</h1>
        <select
          className="subject-selector"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {subjects.map((s, i) => (
            <option key={i} value={s.subject}>
              {s.subject}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-body" ref={chatRef}>
        {history.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              msg.autor === "usuario" ? "user-msg" : "assistant-msg"
            }`}
          >
            <p className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            <p>{msg.texto}</p>
          </div>
        ))}
        {loading && <p className="loading-msg">Cargando…</p>}
      </div>

      <div className="chat-footer">
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe tu mensaje"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send("answer")}
          disabled={loading}
        />
        <div className="chat-footer-buttons">
          <button className="chat-button" onClick={() => setShowUpload((prev) => !prev)}>
            Subir documento
          </button>
          <button className="chat-button" onClick={() => send("answer")} disabled={loading}>
            Enviar
          </button>
        </div>
      </div>

      {error && <p className="chat-error">{error}</p>}

      {showUpload && (
        <div className="upload-section">
          <form onSubmit={handleUpload} className="space-y-2">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button type="submit" className="chat-button">
              Subir
            </button>
          </form>
          {uploadErr && <p className="chat-error">{uploadErr}</p>}
          {uploadMsg && <p className="chat-success">{uploadMsg}</p>}
        </div>
      )}
    </div>
  );
}
