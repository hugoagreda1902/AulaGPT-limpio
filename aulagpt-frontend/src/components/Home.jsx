import { useState } from "react";
import AuthModal from "./AuthModal";
import logo from "../images/LogoAulaGPT.png"; // Importar el logo
import laptopImg from "../images/Laptop_Home.png"; // Imagen principal
import "../styles/Home.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);

  return (
    <div className="home-page">
      {/* Header superior */}
      <header className="header">
        <div className="header-left">
          <div className="logo-with-icon">
            <img src={logo} alt="Logo AulaGPT" className="logo-icon" />
            <span className="logo-text">AulaGPT</span>
          </div>
        </div>
        <div className="header-right">
          <button className="access-button" onClick={openModal}>
            Acceder
          </button>
        </div>
      </header>

      {/* Sección de introducción */}
      <section className="hero">
        <h2 className="hero-title">Resúmenes inteligentes con IA</h2>
        <img src={laptopImg} alt="Ilustración ordenador IA" className="hero-image" />
        <p className="subtext">
          Sube documentos, recibe resúmenes y métricas educativas en segundos.
        </p>
      </section>

      {/* Tarjetas informativas */}
      <main className="content-section">
        <div className="info-card">
          <h3>¿Qué es AulaGPT?</h3>
          <p>
            AulaGPT es una plataforma que transforma documentos educativos en
            resúmenes útiles para estudiantes y métricas valiosas para profesores.
          </p>
        </div>

        <div className="info-card">
          <h3>¿Qué problema resuelve?</h3>
          <p>
            Muchos estudiantes luchan con exceso de contenido sin saber por dónde
            empezar. Los profesores no tienen visibilidad sobre el avance real.
            AulaGPT une ambos mundos.
          </p>
        </div>

        <div className="info-card">
          <h3>¿Cómo funciona?</h3>
          <ul>
            <li>Sube un documento (PDF, Word, etc.)</li>
            <li>La IA genera un resumen automático</li>
            <li>El profesor accede a estadísticas por alumno</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Beneficios</h3>
          <p><strong>Para estudiantes:</strong> resúmenes claros y rápidos.</p>
          <p><strong>Para profesores:</strong> métricas útiles para seguimiento.</p>
        </div>

        <div className="info-card">
          <h3>IA responsable</h3>
          <p>
            AulaGPT usa IA de forma ética: no sustituye al aprendizaje, sino que
            potencia la comprensión y el seguimiento académico.
          </p>
        </div>
      </main>

      {/* Footer limpio */}
      <footer className="footer">
        <p>© 2025 AulaGPT</p>
      </footer>

      {/* Modal */}
      {showModal && (
        <AuthModal isLogin={true} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Home;
