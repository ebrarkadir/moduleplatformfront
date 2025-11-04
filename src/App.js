import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Panel from "./pages/Panel";
import PrivateRoute from "./routes/PrivateRoute";

// 🔹 Toastify importları
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/panel"
            element={
              <PrivateRoute>
                <Panel />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>

      <ToastContainer position="bottom-right" autoClose={3000} newestOnTop />
    </>
  );
}

export default App;
