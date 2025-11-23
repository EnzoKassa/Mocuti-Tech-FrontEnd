import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../auth/ResetPasswordContext";
import "../styles/ForgotPassword.css";
import api from "../api/api";

export default function ResetPassword() {
  const { setStep } = useResetPassword();
  const [token, setToken] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Função de validação
  const validarSenha = (senha) => {
    if (senha === "" || senha.length < 8) {
      return "A senha deve possuir no mínimo 8 caracteres.";
    }
    if (!/[A-Z]/.test(senha)) {
      return "A senha deve conter pelo menos 1 letra maiúscula.";
    }
    if (!/[0-9]/.test(senha)) {
      return "A senha deve conter pelo menos 1 número.";
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(senha)) {
      return "A senha deve conter pelo menos 1 caractere especial.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroSenha("");
    setMensagem("");
  
    // Validação da senha
    const validacao = validarSenha(novaSenha);
    if (validacao) {
      setErroSenha(validacao);
      return;
    }
  
    if (novaSenha !== confirmPassword) {
      setErroSenha("As senhas não coincidem.");
      return;
    }
  
    try {
      const body = { token: token.trim(), novaSenha };
      await api.post("/auth/reset-password", body);
  
      setMensagem("Senha redefinida com sucesso!");
      setStep(2);
      navigate("/reset-success");
    } catch (err) {
      // Extrair a mensagem correta do backend
      let msg = "Ocorreu um erro. Tente novamente.";
      
      // Se o backend enviar { message: "algo" }
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } 
      // Se o backend enviar outro objeto
      else if (typeof err.response?.data === "string") {
        msg = err.response.data;
      }
  
      setMensagem(msg);
    }
  };    

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="container-redefinir-senha">
      <div className="form-wrapper">
        <div className="form-card">
          <h1 className="form-title">Redefinição de Senha</h1>

          <form onSubmit={handleSubmit} className="form">

            {/* TOKEN */}
            <div className="form-group">
              <label className="form-label">Token (6 dígitos)</label>
              <input
                className="form-input"
                type="text"
                maxLength="6"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            {/* NOVA SENHA */}
            <div className="form-group">
              <label className="form-label">Nova senha</label>
              <div className="input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-input"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setErroSenha(validarSenha(e.target.value));
                  }}
                  required
                />
                <button type="button" className="toggle-password-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* CONFIRMAR SENHA */}
            <div className="form-group">
              <label className="form-label">Confirmar senha</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-password-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {erroSenha && <p className="error-text">{erroSenha}</p>}

            <button className="submit-btn" type="submit">
              Redefinir senha
            </button>
          </form>

          {mensagem && <p className="success-text">{mensagem}</p>}
        </div>
      </div>
    </div>
  );
}
