import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css"; // Asegúrate de crearlo

function Home() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const onStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">AulaGPT</div>
        <div className="nav-buttons">
          {!token ? (
            <>
              <Link to="/login" className="nav-btn">Iniciar Sesión</Link>
              <Link to="/register" className="nav-btn">Registrarse</Link>
            </>
          ) : (
            <>
              <Link to="/chat" className="nav-btn">Chat</Link>
              <button onClick={handleLogout} className="nav-btn logout">Cerrar Sesión</button>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <h1>Bienvenido a AulaGPT</h1>
        <p>Tu asistente inteligente para el aula.</p>
        {!token && <Link to="/login" className="hero-btn">Comenzar</Link>}
      </section>

      <section className="about">
        <h2>¿Qué es AulaGPT?</h2>
        <p>
          AulaGPT es una plataforma educativa impulsada por inteligencia artificial. 
          Te permite hacer preguntas, obtener resúmenes y practicar con tests basados en tus propios documentos.
        </p>
        <p>
          Este proyecto está en desarrollo y su objetivo es mejorar la experiencia educativa tanto de alumnos como de profesores.
        </p>
        <p className="note">* Proyecto académico en fase de desarrollo.</p>
      </section>
    </div>
  );
}

export default Home;
