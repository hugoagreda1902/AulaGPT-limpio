import React, { useState } from "react";
import AuthModal from "./AuthModal";
import "../styles/Home.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">AulaGPT</h1>
        </div>
        <div className="header-right">
          <div className="access-dot" title="Acceder" onClick={openModal}></div>
        </div>
      </header>

      <main className="main-content">
        <h2>Resúmenes inteligentes con IA</h2>
        <p className="subtext">
          Sube documentos, recibe resúmenes y métricas educativas en segundos.
        </p>

        <section className="grid">
          <div className="column">
            <h3>¿Qué es AulaGPT?</h3>
            <p>
              AulaGPT es una plataforma que transforma documentos educativos en
              resúmenes útiles para estudiantes y métricas valiosas para profesores.
            </p>

            <h3>¿Qué problema resuelve?</h3>
            <p>
              Muchos estudiantes luchan con exceso de contenido sin saber por dónde
              empezar. Los profesores no tienen visibilidad sobre el avance real.
              AulaGPT une ambos mundos.
            </p>

            <h3>¿Cómo funciona?</h3>
            <ul>
              <li>Sube un documento (PDF, Word, etc.)</li>
              <li>La IA genera un resumen automático</li>
              <li>El profesor accede a estadísticas por alumno</li>
            </ul>
          </div>

          <div className="column">
            {/* Aquí puedes insertar la imagen del ordenador */}
            <img
              src="AQUI_TU_IMAGEN_DEL_ORDENADOR"
              alt="Ilustración AulaGPT"
              className="computer-img"
            />

            <h3>Beneficios</h3>
            <p><strong>Para estudiantes:</strong> resúmenes claros y rápidos.</p>
            <p><strong>Para profesores:</strong> métricas útiles para seguimiento.</p>

            <h3>IA responsable</h3>
            <p>
              AulaGPT usa IA de forma ética: no sustituye al aprendizaje, sino que
              potencia la comprensión y el seguimiento académico.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          <a href="#">Sobre nosotros</a> • <a href="#">Privacidad</a> •{" "}
          <a href="#">Términos</a> • <a href="#">FAQ</a>
        </p>
      </footer>

      {showModal && (
        <AuthModal isLogin={true} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Home;
