import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");

  const handleInvite = async () => {
    setInviteStatus("");

    if (!inviteCode.trim()) {
      setInviteStatus("⚠️ Ingresa un código válido.");
      return;
    }

    try {
      const response = await fetch("https://aulagpt.onrender.com/api/student-teacher/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_invite_code: inviteCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteStatus("✅ Estudiante invitado correctamente.");
        setInviteCode("");
      } else {
        setInviteStatus(`❌ Error: ${data.error || "No se pudo invitar."}`);
      }
    } catch (err) {
      console.error("Error al invitar:", err);
      setInviteStatus("❌ Error al conectar con el servidor.");
    }
  };

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
        <h2>Dashboard del Profesor</h2>
        <p className="subtext">
          Bienvenido, {user?.name} {user?.surname}. Aquí puedes gestionar a tus estudiantes, conversar y revisar métricas educativas.
        </p>

        <section className="grid">
          <div className="column">
            <h3>Datos del Profesor</h3>
            <p><strong>Nombre:</strong> {user?.name} {user?.surname}</p>
            <p><strong>ID Docente:</strong> {user?.id || "..."}</p>

            <div className="invite-student-box">
              <h3>Invitar Estudiante</h3>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Código del estudiante"
              />
              <button onClick={handleInvite}>Invitar</button>
              {inviteStatus && <p className="invite-status">{inviteStatus}</p>}
            </div>

            <h3>Acceso al Chat</h3>
            <button onClick={() => navigate("/chat")}>Ir al Chat</button>

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
