import React, { useState, useEffect, useRef } from "react";
import { askQuestion } from "../api/dataService"; // Ruta correcta al servicio
import "../styles/ChatIA.css"; // ✅ Ruta actualizada a tu carpeta de estilos

function ChatIA() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      const asignaturasConDocs = ["Matemáticas", "Lengua", "Historia"];
      setSubjects(asignaturasConDocs);
      setSelectedSubject(asignaturasConDocs[0] || "");
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSubject) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      const response = await askQuestion(input, selectedSubject);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.respuesta },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error al obtener respuesta." },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="text-xl font-semibold">AulaGPT</h1>
          <select
            className="subject-selector"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        <div className="chat-body">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${msg.role === "user" ? "user-msg" : "assistant-msg"}`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="chat-button"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatIA;
