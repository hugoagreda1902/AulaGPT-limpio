// src/components/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/dataService";
import "../styles/AuthModal.css";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const data = await loginUser({ username, password });
      console.log("Login OK. Respuesta:", data);

      // Guarda el token de acceso
      localStorage.setItem("token", data.access);

      // Guarda el usuario completo por si lo necesitas más tarde
      localStorage.setItem("user", JSON.stringify(data));

      setMessage("Inicio de sesión exitoso ✓");
      setMessageType("success");

      // Redirección según el rol
      const role = data.role?.toLowerCase?.();

      setTimeout(() => {
        if (role === "teacher") {
          navigate("/dashboard/teacher");
        } else if (role === "student") {
          navigate("/dashboard/student");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      console.error("Error en login:", err);
      setMessage("Usuario o contraseña incorrectos.");
      setMessageType("error");
    }
  };

  return (
    <>
      <h2>Iniciar sesión</h2>

      {message && (
        <p className={messageType === "success" ? "success-msg" : "error-msg"}>
          {message}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-password"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>

        <button type="submit">Entrar</button>
      </form>
    </>
  );
}

export default Login;
