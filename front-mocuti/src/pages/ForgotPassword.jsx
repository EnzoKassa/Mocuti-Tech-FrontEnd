import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../auth/ResetPasswordContext"; // import correto
import '../styles/ForgotPassword.css';

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
    <div className="container-redefinir-senha">
      <div className="form-wrapper">
        <div className="form-card">
          <h1 className="form-title">
            Redefinição de Senha
          </h1>

          <form onSubmit={handleSubmit} className="form">
            {/* Nova Senha */}
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                Insira seu e-mail
              </label>
              <div className="input-wrapper">
                <input
                type="email"
                  id="newPassword"
                  name="newPassword"
                  value={email}
                   onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="form-input"
                  required
                />
               
              </div>
              <p className="form-help-text">
                Enviaremos um e-mail com instruções para redefinir sua senha.
              </p>
            </div>
            <button
              type="submit"
              className="submit-btn"
            >
              Redefinir Senha
            </button>
          </form>
          {mensagem && <p className="message">{mensagem}</p>}
        </div>
      </div>
    </div>
  );
}


