import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a AulaGPT</h1>
      <p className="mb-8 text-gray-700">Tu asistente educativo inteligente.</p>

      <div className="space-x-4">
        <button
          onClick={() => navigate("/register")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Registrarse
        </button>
        <button
          onClick={() => navigate("/login")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

export default Home;
