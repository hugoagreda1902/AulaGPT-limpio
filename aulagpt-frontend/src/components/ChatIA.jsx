import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatIA.css";
import { askQuestion, uploadDocument, submitTest } from "../api/dataService";

const SUBJECTS = [
  "matematicas", "lengua", "ingles", "historia",
  "ciencias", "fisica", "quimica"
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
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const chatRef = useRef();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history, loading]);

  const isTestReadyToSend = () => {
    return testQuestions.length > 0 && testQuestions.every((_, i) => selectedAnswers[i]);
  };

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
          : "❌ Error al procesar tu petición. Inténtalo de nuevo.";
        setHistory(prev => [...prev, { timestamp: new Date(), autor: "ia", texto: msg }]);
        return;
      }

      if (actualAction === "test" && Array.isArray(data.test)) {
        setHistory(prev => [...prev, { timestamp: new Date(), autor: "ia", texto: "Aquí tienes tu test interactivo:" }]);
        setTestQuestions(data.test);
        return;
      }

      const botMsg = { timestamp: new Date(), autor: "ia", texto: data.answer };
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
    try {
      await uploadDocument(file, subject);
      setUploadMsg("Documento subido correctamente.");
      setFile(null);
    } catch {
      setUploadErr("Error al subir el documento.");
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">AulaGPT</h1>
        <select className="subject-selector" value={subject} onChange={e => setSubject(e.target.value)}>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="chat-body" ref={chatRef}>
        {history.map((msg, i) => {
          const isTestIntro = msg.texto === "Aquí tienes tu test interactivo:";
          return (
            <div key={i} className={`chat-bubble ${msg.autor === "usuario" ? "user-msg" : "assistant-msg"}`}>
              <p className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              {!isTestIntro && <p>{msg.texto}</p>}
            </div>
          );
        })}

        {testQuestions.map((q, i) => (
          <div key={i} className="test-question">
            <p><strong>{i + 1}. {q.question}</strong></p>
            {q.options.map((opt, idx) => (
              <label key={idx}>
                <input
                  type="radio"
                  name={`question-${i}`}
                  value={String.fromCharCode(65 + idx)}
                  checked={selectedAnswers[i] === String.fromCharCode(65 + idx)}
                  onChange={() => handleTestAnswer(i, String.fromCharCode(65 + idx))}
                /> {String.fromCharCode(65 + idx)}. {opt}
              </label>
            ))}
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
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send("answer")}
          disabled={loading}
        />
        <div className="chat-footer-buttons">
          <button className="chat-button" onClick={() => setShowUpload(prev => !prev)}>Subir documento</button>
          <button className="chat-button" onClick={() => send("answer")} disabled={loading}>Enviar</button>
        </div>
      </div>

      {isTestReadyToSend() && (
        <div className="submit-test">
          <button className="chat-button" onClick={handleSubmitTest}>Enviar test</button>
        </div>
      )}

      {error && <p className="chat-error">{error}</p>}

      {showUpload && (
        <div className="upload-section">
          <form onSubmit={handleUpload} className="space-y-2">
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button type="submit" className="chat-button">Subir</button>
          </form>
          {uploadErr && <p className="chat-error">{uploadErr}</p>}
          {uploadMsg && <p className="chat-success">{uploadMsg}</p>}
        </div>
      )}
    </div>
  );
}