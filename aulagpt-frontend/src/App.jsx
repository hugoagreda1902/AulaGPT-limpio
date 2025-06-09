import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SubirDocumento from './components/SubirDocumento';
import ChatIA from './ChatIA';

// Componente para rutas privadas
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route 
            path="/uploadDocument" 
            element={
              <PrivateRoute>
                <SubirDocumento />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <ChatIA />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
