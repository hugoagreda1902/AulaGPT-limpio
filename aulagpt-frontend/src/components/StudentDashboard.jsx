import React from "react";
import "../styles/Dashboard.css";

const StudentDashboard = () => {
  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">AulaGPT</h1>
        </div>
        <div className="header-right">
          <div className="access-dot" title="Acceder"></div>
        </div>
      </header>

      <main className="main-content">
        <h2>Dashboard del Estudiante</h2>
        <p className="subtext">
          Bienvenido, Carlos. Aquí puedes acceder a tus documentos, chatear y gestionar tu progreso académico.
        </p>

        <section className="grid">
          <div className="column">
            <h3>Datos del Estudiante</h3>
            <p><strong>Nombre:</strong> Carlos López</p>
            <p><strong>ID:</strong> 123456</p>

            <h3>Documentos</h3>
            <p>Tienes 3 documentos subidos</p>

            <h3>Acceso al Chat</h3>
            <button>Entrar al Chat</button>
          </div>

          <div className="column">
            <img
              src="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?fit=crop&w=600&h=400"
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
