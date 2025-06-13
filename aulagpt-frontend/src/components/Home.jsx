import { useState } from "react";
import AuthModal from "./AuthModal";
import logo from "../images/LogoAulaGPT.png";
import laptopImg from "../images/Laptop_Home.png";
import "../styles/Home.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);

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
          <button className="access-button" onClick={openModal}>
            Acceder
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h2 className="hero-title">Resúmenes inteligentes con IA</h2>
        <img src={laptopImg} alt="Ilustración ordenador IA" className="hero-image" />
        <p className="subtext">
          Sube documentos, recibe ayuda guiada y métricas educativas con inteligencia artificial.
        </p>
      </section>

      {/* Tarjetas */}
      <main className="content-section">
        <div className="info-card">
          <h3>¿Qué es AulaGPT?</h3>
          <p>
            AulaGPT es una herramienta web que facilita el aprendizaje mediante el uso de inteligencia artificial. Permite a estudiantes subir documentos y obtener asistencia guiada para comprender y resumir los contenidos.
          </p>
        </div>

        <div className="info-card">
          <h3>¿Qué problema resuelve?</h3>
          <p>
            Muchos estudiantes se enfrentan a textos largos sin saber qué es lo más importante. AulaGPT ofrece un apoyo personalizado que destaca lo esencial, mientras los docentes obtienen información sobre el progreso de los alumnos.
          </p>
        </div>

        <div className="info-card">
          <h3>¿Cómo funciona?</h3>
          <ul>
            <li>El estudiante sube un documento (PDF, Word, etc.)</li>
            <li>Formula preguntas o solicita ayuda a una guía IA integrada</li>
            <li>La IA responde, resume y explica los conceptos clave</li>
            <li>El docente puede revisar interacciones y métricas de avance</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Beneficios</h3>
          <p><strong>Para estudiantes:</strong> comprensión más rápida y enfoque en lo relevante.</p>
          <p><strong>Para profesores:</strong> seguimiento del uso, preguntas más comunes y evolución del aprendizaje.</p>
        </div>

        <div className="info-card">
          <h3>IA responsable</h3>
          <p>
            AulaGPT promueve un uso ético de la inteligencia artificial en entornos educativos. No reemplaza la figura del docente, sino que actúa como una guía de apoyo para reforzar el aprendizaje, fomentar la autonomía del estudiante y facilitar el seguimiento académico.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 AulaGPT</p>
      </footer>

      {/* Modal de autenticación */}
      {showModal && (
        <AuthModal isLogin={true} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Home;
