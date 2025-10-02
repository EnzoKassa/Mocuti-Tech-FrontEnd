import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../auth/ResetPasswordContext";

export default function ResetPassword() {
  const { setStep } = useResetPassword();         // atualiza step para 2 quando sucesso
  const [token, setToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { token: token.trim(), novaSenha };
      const response = await fetch("http://localhost:8080/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // tenta ler mensagem do servidor (útil para debug)
        const text = await response.text();
        throw new Error(text || "Erro ao redefinir senha");
      }

      setMensagem("Senha redefinida com sucesso!");
      setStep(2);                    // marca passo final do fluxo
      navigate("/reset-success");    // vai pra tela de sucesso
    } catch (error) {
      setMensagem("Token inválido ou expirado.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Redefinir Senha</h2>
      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Token (6 dígitos)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
        <button type="submit">Redefinir</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}
