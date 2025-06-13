import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

const StudentDocuments = () => {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("accessToken");
  const asignaturas = ["Matemáticas", "Lengua", "Inglés", "Historia", "Ciencias", "Física", "Química"];

  // Debug
  console.log("Modal visible:", showModal);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("https://aulagpt.onrender.com/api/documents/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!file || !subject) {
      setMessage("Por favor, selecciona un archivo y asignatura.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject);

    try {
      const response = await fetch("https://aulagpt.onrender.com/api/documents/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage("Documento subido correctamente.");
        setFile(null);
        setSubject("");
        setShowModal(false);
        fetchDocuments();
      } else {
        const data = await response.json();
        setMessage(data.error || "Error al subir el documento.");
      }
    } catch (err) {
      console.error("Error al subir documento:", err);
      setMessage("Error en la conexión.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedDocs.length === 0) {
      alert("Selecciona al menos un documento para eliminar.");
      return;
    }

    const confirm = window.confirm("¿Estás seguro de que deseas eliminar los documentos seleccionados?");
    if (!confirm) return;

    try {
      const response = await fetch("https://aulagpt.onrender.com/api/documents/delete-selected/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedDocs }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`Documentos eliminados: ${result.eliminados.length}`);
        setSelectedDocs([]);
        fetchDocuments();
      } else {
        setMessage("Error al eliminar documentos.");
      }
    } catch (err) {
      console.error("Error al eliminar documentos:", err);
      setMessage("Error en la conexión.");
    }
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">AulaGPT</h1>
        </div>
        <div className="header-right">
          <div className="access-dot green-dot" title="Cerrar sesión"></div>
        </div>
      </header>

      <main className="main-content">
        <h2>Documentos del Estudiante</h2>

        <button onClick={() => setShowModal(true)}>Subir documento</button>

        {message && <p>{message}</p>}

        <section className="grid">
          <div className="column">
            <h3>Mis documentos</h3>
            {documents.length > 0 ? (
              <>
                <ul>
                  {documents.map((doc) => (
                    <li key={doc.document_id}>
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.document_id)}
                        onChange={() => handleCheckboxChange(doc.document_id)}
                      />{" "}
                      <a href={doc.drive_link} target="_blank" rel="noopener noreferrer">
                        {doc.file_name}
                      </a>{" "}
                      – {doc.subject}
                    </li>
                  ))}
                </ul>
                <button onClick={handleDeleteSelected}>Eliminar seleccionados</button>
              </>
            ) : (
              <p>No hay documentos subidos.</p>
            )}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <h3>Subir Documento</h3>
            <form onSubmit={handleUpload}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
              <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
                <option value="">Selecciona una asignatura</option>
                {asignaturas.map((a, i) => (
                  <option key={i} value={a}>{a}</option>
                ))}
              </select>
              <button type="submit">Subir</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocuments;
