import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="logo">AulaGPT</div>
        <div className="nav-links">
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/register">Registrarse</Link>
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

      <section className="info">
        <h2>¿Qué es AulaGPT?</h2>
        <p>
          AulaGPT es una plataforma que transforma documentos educativos en resúmenes
          útiles para estudiantes y métricas valiosas para profesores.
        </p>
      </section>

      <section className="problem">
        <h2>¿Qué problema resuelve?</h2>
        <p>
          Muchos estudiantes luchan con exceso de contenido sin saber por dónde empezar.
          Los profesores no tienen visibilidad sobre el avance real. AulaGPT une ambos mundos.
        </p>
      </section>

      <section className="how-it-works">
        <h2>¿Cómo funciona?</h2>
        <ol>
          <li>Subes un documento (PDF, Word, etc.)</li>
          <li>La IA genera un resumen automático</li>
          <li>El profesor accede a estadísticas por alumno</li>
        </ol>
      </section>

      <section className="benefits">
        <h2>Beneficios</h2>
        <ul>
          <li><strong>Para estudiantes:</strong> resúmenes claros y rápidos.</li>
          <li><strong>Para profesores:</strong> métricas de seguimiento.</li>
        </ul>
      </section>

      <section className="ai-info">
        <h2>IA responsable</h2>
        <p>
          AulaGPT usa IA de forma ética: no sustituye al aprendizaje,
          sino que potencia la comprensión y el seguimiento académico.
        </p>
      </section>

      <footer className="footer">
        <p>
          <Link to="/about">Sobre nosotros</Link> •{" "}
          <Link to="/privacy">Privacidad</Link> •{" "}
          <Link to="/terms">Términos</Link> •{" "}
          <Link to="/faq">FAQ</Link>
        </p>
      </footer>
    </div>
  );
};

export default Home;
