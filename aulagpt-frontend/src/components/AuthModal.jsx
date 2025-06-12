import React, { useState } from "react";
import "../styles/AuthModal.css";
import Login from "./Login";
import Register from "./Register";

const AuthModal = ({ isLogin, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(isLogin);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>

        {isLoginView ? <Login /> : <Register />}

        <p className="switch">
          {isLoginView ? (
            <>
              ¿No tienes cuenta?{" "}
              <span onClick={() => setIsLoginView(false)}>Regístrate</span>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <span onClick={() => setIsLoginView(true)}>Inicia sesión</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
