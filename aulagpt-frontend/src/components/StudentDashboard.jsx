import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/LogoAulaGPT.png";
import studentImg from "../images/Laptop_Home.png";
import "../styles/Dashboard.css";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [showCode, setShowCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const modalRef = useRef(null);

  const fullName =
    user?.name === user?.surname ? user?.name : `${user?.name} ${user?.surname}`;

  const goToChat = () => navigate("/chat");
  const goToDocuments = () => navigate("/documents");

  const handleRevealClick = () => setShowCodeModal(true);
  const confirmShowCode = () => {
    setShowCode(true);
    setShowCodeModal(false);
  };

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setShowLogoutModal(false);
      setShowCodeModal(false);
    }, 200);
  };

  useEffect(() => {
    const body = document.body;
    const shouldLockScroll = showLogoutModal || showCodeModal;
    body.style.overflow = shouldLockScroll ? "hidden" : "";
    return () => {
      body.style.overflow = "";
    };
  }, [showLogoutModal, showCodeModal]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        triggerClose();
      }
    };

    if (showLogoutModal || showCodeModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutModal, showCodeModal]);

  return (
    <div className="home-page">
      {/* Encabezado */}
      <header className="header">
        <div className="header-left">
          <div className="logo-with-icon">
            <img src={logo} alt="Logo AulaGPT" className="logo-icon" />
            <span className="logo-text">AulaGPT</span>
          </div>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            🔒 Cerrar sesión
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h2 className="hero-title">Tu panel personalizado como estudiante</h2>
        <img src={studentImg} alt="Estudiante con IA" className="hero-image" />
        <p className="subtext">
          Consulta tus datos, documentos recientes y accede al chat educativo con IA.
        </p>
      </section>

      {/* Contenido principal */}
      <main className="content-section">
        {/* Tarjeta Datos */}
        <div className="info-card">
          <h3>Datos del estudiante</h3>
          <p><strong>Nombre completo:</strong> {fullName}</p>
          <p><strong>ID de usuario:</strong> {user?.id || "Cargando..."}</p>

          <div className="button-group">
            <span className="group-label">Configuración de cuenta</span>
            <button className="group-btn" onClick={() => alert("Funcionalidad próximamente")}>
              Cambiar contraseña
            </button>
            <button className="group-btn" onClick={() => alert("Funcionalidad próximamente")}>
              Cambiar nombre de usuario
            </button>
            <button className="group-btn" onClick={() => alert("Funcionalidad próximamente")}>
              Cambiar correo electrónico
            </button>
          </div>
        </div>

        {/* Asistente IA */}
        <div className="info-card">
          <h3>Asistente IA</h3>
          <p>Consulta a la IA tus dudas, pide explicaciones o resúmenes.</p>
          <div className="button-group">
            <button className="reveal-btn" onClick={goToChat}>Ir al Chat</button>
          </div>
        </div>

        {/* Documentos */}
        <div className="info-card">
          <h3>Últimos documentos</h3>
          <p>Próximamente: aquí aparecerán tus últimos documentos subidos.</p>
          <div className="button-group">
            <button className="reveal-btn" onClick={goToDocuments}>Ver documentos</button>
          </div>
        </div>

        {/* Código de invitación */}
        {user?.invite_code && (
          <div className="info-card">
            <h3>Código de invitación</h3>
            <p>Cuidado: este código es personal, no lo compartas con cualquiera.</p>
            <div className="code-display">
              <span>{showCode ? user.invite_code : "******"}</span>
              {showCode ? (
                <button onClick={() => setShowCode(false)} className="reveal-btn">
                  Ocultar
                </button>
              ) : (
                <button onClick={handleRevealClick} className="reveal-btn">
                  Ver
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Código de invitación */}
      {showCodeModal && (
        <div className={`modal-overlay show ${isClosing ? "closing" : ""}`}>
          <div className="modal-content" ref={modalRef}>
            <h3>¿Mostrar código de invitación?</h3>
            <p>Este código es personal. ¿Estás seguro de que deseas verlo?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="reveal-btn" onClick={triggerClose}>
                Cancelar
              </button>
              <button className="reveal-btn" onClick={confirmShowCode}>
                Mostrar código
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cerrar sesión */}
      {showLogoutModal && (
        <div className={`modal-overlay show ${isClosing ? "closing" : ""}`}>
          <div className="modal-content" ref={modalRef}>
            <h3>¿Cerrar sesión?</h3>
            <p>¿Estás seguro de que deseas cerrar sesión?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="reveal-btn" onClick={triggerClose}>
                Cancelar
              </button>
              <button className="reveal-btn" onClick={confirmLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
