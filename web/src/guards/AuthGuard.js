import React from "react";
import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const isAuthenticated = localStorage.getItem("refreshToken") !== null && localStorage.getItem("accessToken") !== null;

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" />;
  }

  return children;
};

export default AuthGuard;
