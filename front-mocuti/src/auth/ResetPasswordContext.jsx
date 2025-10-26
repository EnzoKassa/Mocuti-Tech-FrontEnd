// src/auth/ResetPasswordContext.jsx
import React, { createContext, useState, useContext } from "react";

const ResetPasswordContext = createContext();

export function ResetPasswordProvider({ children }) {
  const [step, setStep] = useState(0); 
  // 0 = nada, 1 = email enviado, 2 = token validado

  return (
    <ResetPasswordContext.Provider value={{ step, setStep }}>
      {children}
    </ResetPasswordContext.Provider>
  );
}

export function useResetPassword() {
  return useContext(ResetPasswordContext);
}
