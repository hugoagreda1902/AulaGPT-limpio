import React, { useState } from "react";
import AuthModal from "./AuthModal";
import "../styles/Home.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const openModal = (login) => {
    setIsLogin(login);
    setShowModal(true);
  };

  return (
    <div className="home">
      <nav className="navbar">
        <div className="logo">AulaGPT</div>
        <div className="nav-links">
          <button onClick={() => openModal(true)}>Iniciar sesión</button>
          <button onClick={() => openModal(false)}>Registrarse</button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <h1>Resúmenes inteligentes con IA</h1>
          <p>
            Sube documentos, recibe resúmenes y métricas educativas en segundos.
          </p>
        </div>
        <div className="hero-image">
          <img src="IMAGE_URL_HERE" alt="Vista previa AulaGPT" />
        </div>
      </header>

      {/* ... otras secciones como info, problem, etc. */}

      <footer className="footer">
        <p>© AulaGPT 2025</p>
      </footer>

      {showModal && (
        <AuthModal isLogin={isLogin} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Home;