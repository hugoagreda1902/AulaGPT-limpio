import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "../styles/AuthModal.css";

const AuthModal = ({ isLogin, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(isLogin);

  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="tabs">
          <button
            className={isLoginView ? "active" : ""}
            onClick={() => setIsLoginView(true)}
          >
            Iniciar sesión
          </button>
          <button
            className={!isLoginView ? "active" : ""}
            onClick={() => setIsLoginView(false)}
          >
            Registro
          </button>
        </div>
        {isLoginView ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default AuthModal;
