import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "../api/AuthService";

const PrivateRoute = ({ children }) => {
  const auth = getAuth();

  if (!auth || !auth.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
