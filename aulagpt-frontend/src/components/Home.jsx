import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    // Cuando el token cambie en localStorage (ej. login o logout), actualizar el estado
    const onStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", onStorageChange);

    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null); // Actualizamos estado para que la UI cambie
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Bienvenido a AulaGPT</h1>

      {!token ? (
        <>
          <p>Para acceder a todas las funcionalidades, por favor inicia sesión o regístrate.</p>
          <Link to="/login">
            <button style={{ margin: "10px", padding: "10px 20px" }}>Iniciar Sesión</button>
          </Link>
          <Link to="/register">
            <button style={{ margin: "10px", padding: "10px 20px" }}>Registrarse</button>
          </Link>
        </>
      ) : (
        <>
          <p>Ya has iniciado sesión. Puedes acceder al chat o cerrar sesión.</p>
          <Link to="/chat">
            <button style={{ margin: "10px", padding: "10px 20px" }}>Ir al Chat</button>
          </Link>
          <button onClick={handleLogout} style={{ margin: "10px", padding: "10px 20px" }}>
            Cerrar Sesión
          </button>
        </>
      )}
    </div>
  );
}

export default Home;
