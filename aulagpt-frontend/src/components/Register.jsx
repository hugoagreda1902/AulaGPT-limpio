import React, { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "student", // valor por defecto
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Maneja cambios en los inputs
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

  console.log("Enviando formulario:", formData);

  try {
    const res = await fetch("https://aulagpt.onrender.com/api/users/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    console.log("Respuesta status:", res.status);

    if (res.ok) {
      setSuccess(true);
      setFormData({ name: "", surname: "", email: "", password: "", role: "student" });
    } else {
      const data = await res.json();
      console.log("Respuesta error JSON:", data);

      // Si data es un objeto con errores, intenta mostrar todos
    if (typeof data === 'object') {
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
    <div className="register-container">
      <h2>Registro de usuario</h2>
      {success && <p style={{ color: "green" }}>Usuario registrado con éxito!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
    </div>
  );
}

export default Register;
