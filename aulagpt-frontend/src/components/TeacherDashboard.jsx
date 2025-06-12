import React from "react";
import "../styles/Dashboard.css";

const TeacherDashboard = () => {
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
        <h2>Dashboard del Profesor</h2>
        <p className="subtext">
          Bienvenido, Prof. Martínez. Aquí puedes gestionar a tus estudiantes, conversar y revisar métricas educativas.
        </p>

        <section className="grid">
          <div className="column">
            <h3>Datos del Profesor</h3>
            <p><strong>Nombre:</strong> Ana Martínez</p>
            <p><strong>ID Docente:</strong> P-09876</p>

            <h3>Acceso al Chat</h3>
            <button>Ir al Chat</button>

            <h3>Métricas</h3>
            <p>Puedes revisar las métricas por documento, por alumno y por tema. Muy pronto se habilitarán gráficas visuales.</p>
          </div>

          <div className="column">
            <img
              src="https://images.unsplash.com/photo-1581093448793-5cf7e8389e00?fit=crop&w=600&h=400"
              alt="Pizarra retro con datos"
              className="computer-img"
            />

            <h3>Visibilidad académica</h3>
            <p>Accede a datos de lectura, resúmenes generados y tiempo dedicado por estudiante. Todo en un solo lugar.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          <a href="#">Soporte</a> • <a href="#">Métricas detalladas</a> • <a href="#">Cerrar sesión</a>
        </p>
      </footer>
    </div>
  );
};

export default TeacherDashboard;
