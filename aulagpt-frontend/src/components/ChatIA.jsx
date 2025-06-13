import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/LogoAulaGPT.png";
import { askQuestion, uploadDocument, submitTest } from "../api/dataService";
import "../styles/ChatIA.css";

const SUBJECTS = [
  "Matemáticas", "lengua", "ingles", "historia",
  "ciencias", "fisica", "quimica"
];

export default function ChatIA() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");
  const [file, setFile] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const chatRef = useRef();
  const modalRef = useRef();
  const navigate = useNavigate();

  const formatFileSize = (size) => {
    const kb = size / 1024;
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
  };

  useEffect(() => {
    if (chatRef.current && history.length > 0) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history, loading]);

  const isTestReadyToSend = () =>
    testQuestions.length > 0 && testQuestions.every((_, i) => selectedAnswers[i]);

  const send = async (action = "answer") => {
    if (!input.trim() || !subject) return;
    setError("");
    setLoading(true);
    setTestQuestions([]);
    setSelectedAnswers({});

    const userMsg = { timestamp: new Date(), autor: "usuario", texto: input };
    setHistory(prev => [...prev, userMsg]);
    const question = input;
    setInput("");

    try {
      const actualAction = question.toLowerCase().includes("test") ? "test" : action;
      const data = await askQuestion(question, subject, actualAction);

      if (data.error) {
        const msg = data.error.includes("JSON válido")
          ? "❌ No se pudo generar el test. Asegúrate de que hay documentos subidos y reformula tu pregunta."
          : data.error;
        setHistory(prev => [...prev, { timestamp: new Date(), autor: "ia", texto: msg }]);
        return;
      }

      if (actualAction === "test" && Array.isArray(data.test)) {
        setHistory(prev => [...prev, { timestamp: new Date(), autor: "ia", texto: "Aquí tienes tu test interactivo:" }]);
        setTestQuestions(data.test);
        return;
      }

      const text = data.answer ? data.answer : "❌ Respuesta vacía, revisa la consola.";
      const botMsg = { timestamp: new Date(), autor: "ia", texto: text };
      setHistory(prev => [...prev, botMsg]);

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

    const maxBytes = 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadErr("❌ El archivo supera el límite de 100 MB.");
      return;
    }

    try {
      await uploadDocument(file, subject);
      setUploadMsg("✅ Documento subido correctamente.");
      setFile(null);
    } catch {
      setUploadErr("❌ Error al subir el documento.");
    }
  };

  const handleTestAnswer = (qIndex, option) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitTest = async () => {
    try {
      const answers = testQuestions.map((q, i) => ({
        question: q.question,
        selected: selectedAnswers[i]
      }));
      await submitTest(subject, answers);
      setHistory(prev => [...prev, { timestamp: new Date(), autor: "ia", texto: "Test enviado correctamente." }]);
      setTestQuestions([]);
      setSelectedAnswers({});
    } catch (e) {
      setError("Error al enviar el test");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        triggerClose();
      }
    };
    if (showUploadModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUploadModal]);

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setShowUploadModal(false);
    }, 200);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-logo-group">
            <img src={logo} alt="Logo AulaGPT" className="logo-icon" />
            <h1 className="chat-title">AulaGPT</h1>
          </div>
          <div className="chat-controls">
            <select
              className="subject-selector"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="chat-button" onClick={() => navigate("/dashboard/student")}>
              Volver al Dashboard
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="chat-body" ref={chatRef}>
          {history.map((msg, i) => {
            const isTestIntro = msg.texto === "Aquí tienes tu test interactivo:";
            return (
              <div
                key={i}
                className={`chat-bubble ${msg.autor === "usuario" ? "user-msg" : "assistant-msg"}`}
              >
                <p className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                {!isTestIntro && <p>{msg.texto}</p>}
              </div>
            );
          })}
          {testQuestions.map((q, i) => (
            <div key={i} className="test-question">
              <p><strong>{i + 1}. {q.question}</strong></p>
              <div className="test-options">
                {q.options.map((opt, idx) => (
                  <label key={idx}>
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={String.fromCharCode(65 + idx)}
                      checked={selectedAnswers[i] === String.fromCharCode(65 + idx)}
                      onChange={() => handleTestAnswer(i, String.fromCharCode(65 + idx))}
                    />
                    {String.fromCharCode(65 + idx)}. {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {loading && <p className="loading-msg">Cargando…</p>}
        </div>

        {/* Footer */}
        <div className="chat-footer">
          <input
            type="text"
            className="chat-input"
            placeholder="Escribe tu mensaje"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send("answer")}
            disabled={loading}
          />
          <div className="chat-footer-buttons">
            <button
              className="chat-button"
              onClick={() => setShowUploadModal(true)}
            >
              📎 Subir documento
            </button>
            <button
              className="chat-button"
              onClick={() => send("answer")}
              disabled={loading}
            >
              Enviar
            </button>
          </div>
        </div>

        {isTestReadyToSend() && (
          <div className="submit-test">
            <button className="chat-button" onClick={handleSubmitTest}>
              Enviar test
            </button>
          </div>
        )}

        {error && <p className="chat-error">{error}</p>}
      </div>

      {/* Modal Subida Documento */}
      {showUploadModal && (
        <div className={`modal-overlay show ${isClosing ? "closing" : ""}`}>
          <div className="modal-content" ref={modalRef}>
            <h3>Subir documento</h3>
            <p>Selecciona un archivo para que la IA pueda ayudarte.</p>
            <form onSubmit={handleUpload} className="modal-form">
              <input
                type="file"
                id="fileUpload"
                style={{ display: "none" }}
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile) {
                    const maxBytes = 100 * 1024 * 1024;
                    if (selectedFile.size > maxBytes) {
                      setUploadErr("❌ El archivo supera el límite de 100 MB.");
                      setFile(null);
                    } else {
                      setUploadErr("");
                      setFile(selectedFile);
                    }
                  }
                }}
              />
              <label htmlFor="fileUpload" className="upload-button">
                Seleccionar archivo
              </label>

              {/* Selector de asignatura dentro del modal */}
              <select
                className="subject-selector"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                <option value="">Selecciona una asignatura</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {file && (
                <p style={{ fontSize: "0.85rem", color: "#333", marginTop: "0.5rem" }}>
                  📄 <strong>{file.name}</strong> · {formatFileSize(file.size)}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="reveal-btn" onClick={triggerClose}>
                  Cancelar
                </button>
                <button type="submit" className="chat-button">Subir</button>
              </div>
            </form>
            {uploadErr && <p className="chat-error">{uploadErr}</p>}
            {uploadMsg && <p className="chat-success">{uploadMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
