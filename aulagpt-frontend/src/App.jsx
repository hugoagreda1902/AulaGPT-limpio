import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import ChatIA from "./components/ChatIA";
import StudentDashboard from "./components/StudentDashboard"; // ← en la misma carpeta
import TeacherDashboard from "./components/TeacherDashboard"; // ← igual

// Ruta protegida
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatIA />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/student"
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/teacher"
            element={
              <PrivateRoute>
                <TeacherDashboard />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
