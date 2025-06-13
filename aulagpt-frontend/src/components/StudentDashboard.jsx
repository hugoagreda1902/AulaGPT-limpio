import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [showCode, setShowCode] = useState(false);

  const fullName =
    user?.name === user?.surname ? user?.name : `${user?.name} ${user?.surname}`;

  const goToChat = () => navigate("/chat");
  const goToDocuments = () => navigate("/documents");

  const handleRevealCode = () => {
    const confirm = window.confirm("¿Estás seguro de que quieres ver tu código de invitación?");
    if (confirm) setShowCode(true);
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
        <h2>Dashboard del Estudiante</h2>
        <p className="subtext">
          {user ? (
            <>Bienvenido, <strong>{fullName}</strong>. Este es tu dashboard personalizado.</>
          ) : (
            "Cargando..."
          )}
        </p>

        <section className="grid">
          <div className="column">
            <h3>Datos del Estudiante</h3>
            <p><strong>Nombre:</strong> {fullName}</p>
            <p><strong>ID:</strong> {user?.id || "..."}</p>

            {user?.invite_code && (
              <div className="invite-code-box">
                <h3>Código de Invitación</h3>
                <div className="code-display">
                  <span>
                    {showCode ? user.invite_code : "******"}
                  </span>
                  {!showCode && (
                    <button
                      onClick={handleRevealCode}
                      className="reveal-btn"
                      aria-label="Mostrar código de invitación"
                    >
                      Ver
                    </button>
                  )}
                </div>
              </div>
            )}

            <h3>Documentos</h3>
            <p>Próximamente: documentos conectados</p>
            <button onClick={goToDocuments}>Ver documentos</button>

            <h3>Acceso al Chat</h3>
            <button onClick={goToChat}>Entrar al Chat</button>
          </div>

          <div className="column">
            <img
              src="https://images.unsplash.com/photo-1527430253228-e93688616381?fit=crop&w=600&h=400"
              alt="Estudiante frente al ordenador"
              className="computer-img"
            />
            <h3>Resumen rápido</h3>
            <p>Accede a resúmenes automáticos de tus documentos con IA.</p>
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

export default StudentDashboard;
