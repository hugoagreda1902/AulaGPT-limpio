import React, { useState } from "react";
import "../styles/dashboard.css";

const StudentDashboard = ({ username = "Usuario1", onEnterChat }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const logout = () => {
    // Aquí puedes añadir tu lógica de logout
    alert("Sesión cerrada");
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">AulaGPT</h1>
        </div>
        <div className="header-right">
          <div className="access-dot green-dot" title="Opciones" onClick={toggleMenu}></div>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={logout}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <h2>Dashboard del Estudiante</h2>
        <p className="subtext">
          Bienvenido, <strong>{username}</strong>. Aquí puedes acceder a tus documentos, chatear y gestionar tu progreso académico.
        </p>

        <section className="grid">
          <div className="column">
            <h3>Datos del Estudiante</h3>
            <p><strong>Nombre:</strong> {username}</p>
            <p><strong>ID:</strong> 123456</p>

            <h3>Documentos</h3>
            <p>Tienes 3 documentos subidos</p>

            <h3>Acceso al Chat</h3>
            <button onClick={onEnterChat}>Entrar al Chat</button>
          </div>

          <div className="column">
            <img
              src="https://images.unsplash.com/photo-1527430253228-e93688616381?fit=crop&w=600&h=400"
              alt="Estudiante retro frente a ordenador"
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
