import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../auth/ResetPasswordContext"; // import correto


export default function ForgotPassword() {
      const { setStep } = useResetPassword(); // pega o setStep do contexto
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error("Erro ao enviar e-mail");

      setMensagem("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      // redireciona para tela de token se quiser

         // atualiza o step para permitir acesso à página de token
      setStep(1);

      
      navigate("/reset-password"); 
    } catch (error) {
      setMensagem("Erro ao enviar e-mail. Tente novamente.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Recuperar Senha</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}
