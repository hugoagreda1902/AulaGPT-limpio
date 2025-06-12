import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatIA.css";
import { askQuestion, uploadDocument, submitTest } from "../api/dataService";

const SUBJECTS = [
  "matematicas",
  "lengua",
  "ingles",
  "historia",
  "ciencias",
  "fisica",
  "quimica"
];

export default function ChatIA() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");
  const [testQuestions, setTestQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const chatRef = useRef();

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history, testQuestions, loading]);

  const send = async (action = "answer") => {
    if (!input.trim() || !subject) return;
    setError("");
    setLoading(true);

    // user message
    const userMsg = { timestamp: new Date(), autor: "usuario", texto: input };
    setHistory(h => [...h, userMsg]);
    setTestQuestions(null); // clear previous test
    const question = input;
    setInput("");

    try {
      const { answer } = await askQuestion(question, subject, action);
      // Attempt parse test JSON
      if (action === 'test') {
        try {
          const parsed = JSON.parse(answer);
          setTestQuestions(parsed);
          setHistory(h => [...h, { timestamp: new Date(), autor: "ia", texto: '' }]);
        } catch (e) {
          // fallback to plain message
          setHistory(h => [...h, { timestamp: new Date(), autor: "ia", texto: answer }]);
        }
      } else {
        const botMsg = { timestamp: new Date(), autor: "ia", texto: answer };
        setHistory(h => [...h, botMsg]);
      }
    } catch (e) {
      console.error(e);
      setError("Error comunicándose con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare payload: question texts, user answers
      const payload = testQuestions.map((q, idx) => ({
        question: q.question,
        selected: answers[idx]
      }));
      await submitTest(subject, payload);
      setHistory(h => [...h, { timestamp: new Date(), autor: "usuario", texto: "Test enviado" }]);
      setTestQuestions(null);
    } catch (e) {
      console.error(e);
      setError("Error al enviar el test");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (idx, value) => {
    setAnswers(a => ({ ...a, [idx]: value }));
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
      await uploadDocument(file, subject);
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
          onChange={e => setSubject(e.target.value)}
        >
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="chat-body" ref={chatRef}>
        {history.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.autor === "usuario" ? "user-msg" : "assistant-msg"}`}>
            <p className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            <p>{msg.texto}</p>
          </div>
        ))}
        {loading && <p className="loading-msg">Cargando…</p>}
      </div>

      {testQuestions ? (
        <form className="test-form" onSubmit={handleSubmitTest}>
          {testQuestions.map((q, idx) => (
            <div key={idx} className="test-question">
              <p>{`Pregunta ${idx+1}: ${q.question}`}</p>
              {q.options.map((opt, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={opt}
                    checked={answers[idx] === opt}
                    onChange={() => handleOptionChange(idx, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button type="submit" className="chat-button" disabled={loading}>
            Enviar respuestas
          </button>
        </form>
      ) : (
        <div className="chat-footer">
          <input
            type="text"
            className="chat-input"
            placeholder="Escribe tu mensaje"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={loading}
          />
          <div className="chat-footer-buttons">
            <button
              className="chat-button"
              onClick={() => setShowUpload(prev => !prev)}
            >
              Subir documento
            </button>
            <button
              className="chat-button"
              onClick={() => send("answer")}
              disabled={loading}
            >
              Enviar respuesta
            </button>
            <button
              className="chat-button"
              onClick={() => send("summary")}
              disabled={loading}
            >
              Generar resumen
            </button>
            <button
              className="chat-button"
              onClick={() => send("test")}
              disabled={loading}
            >
              Generar test
            </button>
          </div>
        </div>
      )}

      {error && <p className="chat-error">{error}</p>}

      {showUpload && (
        <div className="upload-section">
          <form onSubmit={handleUpload} className="space-y-2">
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
            />
            <button type="submit" className="chat-button">Subir</button>
          </form>
          {uploadErr && <p className="chat-error">{uploadErr}</p>}
          {uploadMsg && <p className="chat-success">{uploadMsg}</p>}
        </div>
      )}
    </div>
  );
}