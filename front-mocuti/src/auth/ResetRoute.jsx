import React from "react";
import { Navigate } from "react-router-dom";
import { useResetPassword } from "./ResetPasswordContext";

export default function ResetRoute({ requiredStep, children }) {
  const { step } = useResetPassword();

  // Se o usuário não atingiu o passo necessário, manda de volta pro começo
  if (step < requiredStep) {
    return <Navigate to="/forgot-password" />;
  }

  return children;
}
