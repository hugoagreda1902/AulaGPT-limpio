import { useState, useRef, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import "../styles/AuthModal.css";

const AuthModal = ({ isLogin, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(isLogin);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);

  // Cerrar con animación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
        }, 300);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden"; // Bloquear scroll

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto"; // Restaurar scroll
    };
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div className={`modal-overlay show ${isClosing ? "closing" : ""}`}>
      <div className={`modal-content ${isClosing ? "fade-out" : ""}`} ref={modalRef}>
        <button className="close-btn" onClick={handleClose}>×</button>

        <div className="tabs">
          <button
            className={isLoginView ? "active" : ""}
            onClick={() => setIsLoginView(true)}
          >
            Registro
          </button>
          <button
            className={!isLoginView ? "active" : ""}
            onClick={() => setIsLoginView(false)}
          >
            Iniciar sesion
          </button>
        </div>

        {isLoginView ? <Register /> : <Login />}
      </div>
    </div>
  );
};

export default AuthModal;
