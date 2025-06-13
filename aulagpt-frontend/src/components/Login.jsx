import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthModal.css";

// Font Awesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await fetch("https://aulagpt.onrender.com/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;

        localStorage.setItem("user", JSON.stringify(user));

        if (user.role === "teacher") {
          navigate("/dashboard/teacher");
        } else if (user.role === "student") {
          navigate("/dashboard/student");
        } else {
          navigate("/");
        }
      } else {
        setErrorMsg(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setErrorMsg("Error de conexión con el servidor");
    }
  };

  return (
    <>
      <h2>Iniciar sesión</h2>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
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
