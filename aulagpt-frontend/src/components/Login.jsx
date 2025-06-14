import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const response = await fetch("https://aulagpt.onrender.com/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;

        // ✅ Aquí guardamos correctamente el token con la clave que axiosConfig espera
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(user));

        setMessage("Inicio de sesión exitoso ✓");
        setMessageType("success");

        console.log("Usuario recibido:", user);
        console.log("Rol:", user.role);
        
        setTimeout(() => {
          if (user.role === "teacher") {
            navigate("/dashboard/teacher");
          } else if (user.role === "student") {
            navigate("/dashboard/student");
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        setMessage(data.error || "Usuario o contraseña incorrectos.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setMessage("Error de conexión con el servidor");
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