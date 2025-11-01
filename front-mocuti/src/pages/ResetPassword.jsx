import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../auth/ResetPasswordContext";
import '../styles/ForgotPassword.css';

export default function ResetPassword() {
  const { setStep } = useResetPassword();
  const [token, setToken] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  // Estado separado para novaSenha
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmPassword) {
      setMensagem("As senhas não coincidem!");
      return;
    }
    try {
      const body = { token: token.trim(), novaSenha };
      const response = await fetch("http://localhost:8080/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro ao redefinir senha");
      }

      setMensagem("Senha redefinida com sucesso!");
      setStep(2);
      navigate("/reset-success");
    } catch (error) {
      setMensagem("Token inválido ou expirado.");
      console.error(error);
    }
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="container">
      <div className="form-wrapper">
        <div className="form-card">
          <h1 className="form-title">
            Redefinição de Senha
          </h1>

          <form onSubmit={handleSubmit} className="form">
            {/* Token */}
            <div className="form-group">
              <label htmlFor="token" className="form-label">
                Token de 6 dígitos
              </label>
              <div className="input-wrapper">
                <input
                  id="token"
                  name="token"
                  className="form-input"
                  type="text"
                  placeholder="Token (6 dígitos)"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
            </div>

            {/* Nova Senha */}
            <div className="form-group">
              <label htmlFor="novaSenha" className="form-label">
                Nova Senha
              </label>
              <div className="input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="novaSenha"
                  name="novaSenha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="toggle-password-btn"
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirme a Senha */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirme a Senha
              </label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="toggle-password-btn"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="form-help-text">
                Deve ter uma combinação de no mínimo 8 dígitos, números e símbolos
              </p>
            </div>

            {/* Botão de Redefinir */}
            <button
              type="submit"
              className="submit-btn"
            >
              Redefinir Senha
            </button>
          </form>
          {mensagem && <p>{mensagem}</p>}
        </div>
      </div>
    </div>
  );
}

