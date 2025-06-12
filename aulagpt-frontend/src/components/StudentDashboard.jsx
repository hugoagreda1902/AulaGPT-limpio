import React from "react";
import "../styles/Dashboard.css";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">AulaGPT</h1>
        </div>
        <div className="header-right">
          <div className="access-dot green-dot" title="Cerrar sesión"></div>
        </div>
      </header>

      <main className="main-content">
        <h2>Dashboard del Estudiante</h2>
        <p className="subtext">
          {user ? (
            <>Bienvenido, <strong>{user.name} {user.surname}</strong>. Este es tu dashboard personalizado.</>
          ) : (
            "Cargando..."
          )}
        </p>

        <section className="grid">
          <div className="column">
            <h3>Datos del Estudiante</h3>
            <p><strong>Nombre:</strong> {user ? `${user.name} ${user.surname}` : "..."}</p>
            <p><strong>ID:</strong> {user ? user.id : "..."}</p>

            <h3>Documentos</h3>
            <p>Próximamente: documentos conectados</p>

            <h3>Acceso al Chat</h3>
            <button onClick={() => alert("Chat próximamente")}>
              Entrar al Chat
            </button>
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
