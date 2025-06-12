import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthModal.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await fetch("https://aulagpt.onrender.com/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access);

        // ✅ Guardamos el rol si está disponible
        if (data.role) {
          localStorage.setItem("role", data.role);

          if (data.role === "teacher") {
            navigate("/dashboard/teacher");
          } else if (data.role === "student") {
            navigate("./StudentDashboard");
          } else {
            navigate("/"); // Fallback
          }
        } else {
          // Si no se devuelve el rol, puedes redirigir por defecto
          navigate("./TeacherDashboard");
        }
        console.log("Token de acceso:", data.access);
      } else {
        setErrorMsg(data.detail || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setErrorMsg("Error de conexión con el servidor");
    }
  };

  return (
    <>
      <h2>Iniciar sesión</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
    </>
  );
}

export default Login;
