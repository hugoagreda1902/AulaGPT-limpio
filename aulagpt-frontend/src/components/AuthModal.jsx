import { useState, useRef, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import "../styles/AuthModal.css";

const AuthModal = ({ isLogin, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(isLogin);
  const modalRef = useRef(null);

  // Cerrar al hacer clic fuera del modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay show">
      <div className="modal-content" ref={modalRef}>
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
