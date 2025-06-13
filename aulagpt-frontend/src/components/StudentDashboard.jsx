import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css"; // Estilos específicos del dashboard

/**
 * Componente principal del panel de estudiante.
 * Incluye: datos, chat, documentos y logout con modal de confirmación.
 */
const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [showCode, setShowCode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fullName =
    user?.name === user?.surname
      ? user?.name
      : `${user?.name} ${user?.surname}`;

  // Navegaciones
  const goToChat = () => navigate("/chat");
  const goToDocuments = () => navigate("/documents");

  // Mostrar/Ocultar código de invitación
  const toggleInviteCode = () => {
    if (showCode) {
      setShowCode(false);
    } else {
      const confirm = window.confirm("¿Estás seguro de que quieres ver tu código de invitación?");
      if (confirm) setShowCode(true);
    }
  };

  // Mostrar modal visual para cerrar sesión
  const handleLogoutClick = () => setShowLogoutModal(true);

  // Confirmar logout y redirigir
  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="home-page">
      {/* Cabecera */}
      <header className="header">
        <div className="header-left">
          <h1 className="logo">AulaGPT</h1>
        </div>
        <div className="header-right">
          <button
            className="logout-btn"
            title="Cerrar sesión"
            onClick={handleLogoutClick}
          >
            🔒 Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        <h2>Dashboard del Estudiante</h2>
        <p className="subtext">
          {user ? (
            <>
              Bienvenido, <strong>{fullName}</strong>. Este es tu dashboard personalizado.
            </>
          ) : (
            "Cargando..."
          )}
        </p>

        <section className="grid">
          <div className="column">
            <h3>Datos del Estudiante</h3>
            <p><strong>Nombre:</strong> {fullName}</p>
            <p><strong>ID:</strong> {user?.id || "..."}</p>

            {/* Código de invitación */}
            {user?.invite_code && (
              <div className="invite-code-box">
                <h3>Código de Invitación</h3>
                <div className="code-display">
                  <span>
                    {showCode ? user.invite_code : "******"}
                  </span>
                  <button
                    onClick={toggleInviteCode}
                    className="reveal-btn"
                  >
                    {showCode ? "Ocultar" : "Ver"}
                  </button>
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

      {/* Modal de cierre de sesión */}
      {showLogoutModal && (
        <div className="modal-overlay show">
          <div className="modal-content">
            <h3>¿Cerrar sesión?</h3>
            <p>¿Estás seguro de que deseas cerrar sesión?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="reveal-btn" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
              <button className="reveal-btn" onClick={confirmLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>
          <a href="#">Política de privacidad</a> • <a href="#">Términos de uso</a>
        </p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
