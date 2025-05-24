import React from "react";
import { Navigate } from "react-router-dom";

const RotaProtegida = ({ children, papelNecessario }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (papelNecessario && user.papel !== papelNecessario) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RotaProtegida;
