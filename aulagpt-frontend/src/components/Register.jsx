import React, { useState } from "react";
import "../styles/AuthModal.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // ✅ Lista de dominios válidos
    const allowedDomains = [
      "gmail.com",
      "hotmail.com",
      "yahoo.com",
      "outlook.com",
      "icloud.com",
      "protonmail.com",
      "live.com",
      "gmx.com",
      "mail.com",
      "msn.com",
      "aol.com",
      "zoho.com",
      "yandex.com",
      "student.com"
    ];

    const emailDomain = formData.email.split("@")[1];
    if (!allowedDomains.includes(emailDomain)) {
      setError("Por favor, usa un correo electrónico válido como Gmail, Hotmail, Outlook, etc.");
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
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="student">Alumno</option>
          <option value="teacher">Profesor</option>
        </select>
        <button type="submit">Registrarse</button>
      </form>
    </>
  );
}

export default Register;
