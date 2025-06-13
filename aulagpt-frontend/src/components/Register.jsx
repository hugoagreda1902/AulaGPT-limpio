import { useState } from "react";
import "../styles/AuthModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const allowedDomains = [
    "gmail.com", "hotmail.com", "yahoo.com", "outlook.com",
    "icloud.com", "protonmail.com", "live.com", "gmx.com",
    "mail.com", "msn.com", "aol.com", "zoho.com", "yandex.com", "student.com"
  ];

  const validatePassword = (password) => ({
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[\W_]/.test(password),
  });

  const passwordChecks = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const emailDomain = formData.email.split("@")[1];
    if (!allowedDomains.includes(emailDomain)) {
      setError("Por favor, usa un correo electrónico válido como Gmail, Hotmail, Outlook, etc.");
      return;
    }

    if (!isPasswordValid) {
      setError("La contraseña no cumple con los requisitos.");
      return;
    }

    try {
      const res = await fetch("https://aulagpt.onrender.com/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          username: "",
          name: "",
          surname: "",
          email: "",
          password: "",
          role: "student",
        });
      } else {
        const data = await res.json();
        if (typeof data === "object") {
          const allErrors = Object.values(data).flat().join(" ");
          setError(allErrors || "Error en el registro");
        } else {
          setError("Error en el registro.");
        }
      }
    } catch (error) {
      console.error("Error en fetch:", error);
      setError("Error de conexión al servidor");
    }
  };

  return (
    <>
      <h2>Registro de usuario</h2>
      {success && <p className="success-msg">¡Usuario registrado con éxito!</p>}
      {error && <p className="error-msg">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="surname"
          placeholder="Apellido"
          value={formData.surname}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
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

        {/* Solo mostramos los requisitos si se empieza a escribir */}
        {formData.password && (
          <ul className="password-checklist">
            <li className={passwordChecks.length ? "valid" : "invalid"}>
              <FontAwesomeIcon icon={passwordChecks.length ? faCheck : faTimes} />
              Mínimo 6 caracteres
            </li>
            <li className={passwordChecks.upper ? "valid" : "invalid"}>
              <FontAwesomeIcon icon={passwordChecks.upper ? faCheck : faTimes} />
              Una letra mayúscula
            </li>
            <li className={passwordChecks.lower ? "valid" : "invalid"}>
              <FontAwesomeIcon icon={passwordChecks.lower ? faCheck : faTimes} />
              Una letra minúscula
            </li>
            <li className={passwordChecks.number ? "valid" : "invalid"}>
              <FontAwesomeIcon icon={passwordChecks.number ? faCheck : faTimes} />
              Un número
            </li>
            <li className={passwordChecks.special ? "valid" : "invalid"}>
              <FontAwesomeIcon icon={passwordChecks.special ? faCheck : faTimes} />
              Un carácter especial
            </li>
          </ul>
        )}

        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="student">Alumno</option>
          <option value="teacher">Profesor</option>
        </select>

        <button type="submit" disabled={!isPasswordValid}>
          Registrarse
        </button>
      </form>
    </>
  );
}

export default Register;
