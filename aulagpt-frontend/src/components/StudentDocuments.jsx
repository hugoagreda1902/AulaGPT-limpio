import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No autenticado");
        return;
      }

      try {
        const res = await fetch("https://aulagpt.onrender.com/api/documents/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Error al obtener documentos");

        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los documentos.");
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">AulaGPT</h1>
        </div>
        <div className="header-right">
          <div className="access-dot green-dot" title="Estás logueado"></div>
        </div>
      </header>

      <main className="main-content">
        <h2>Tus Documentos</h2>
        <p className="subtext">Aquí puedes ver y descargar tus archivos subidos.</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <section className="grid">
          <div className="column">
            {documents.length === 0 ? (
              <p>No has subido ningún documento todavía.</p>
            ) : (
              <ul>
                {documents.map((doc) => (
                  <li key={doc.document_id} style={{ marginBottom: "1rem" }}>
                    <strong>{doc.file_name}</strong> <br />
                    <a
                      href={doc.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-link"
                    >
                      Descargar
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <button onClick={() => navigate("/dashboard/student")}>
              ← Volver al Dashboard
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          <a href="#">Política de privacidad</a> • <a href="#">Términos de uso</a>
        </p>
      </footer>
    </div>
  );
};

export default StudentDocuments;
