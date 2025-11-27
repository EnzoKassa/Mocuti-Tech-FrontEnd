import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import Swal from "sweetalert2";
import api from "../api/api";
import {
  formatNomeCompleto,
  formatTelefone,
  formatEmail,
} from "../utils/formatUtils";

const PerfilUsuario = () => {
  const { updateUser } = useAuth();
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    id: Number,
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    email: "",
    dataNascimento: "",
    etnia: "",
    nacionalidade: "",
    genero: "",
    cargo: "",
    endereco: "",
    canalComunicacao: "",
    senha: "",
  });

  const [senha, setSenha] = useState();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        if (!storedUser?.id) {
          Swal.fire("Erro", "Usuário não autenticado.", "error");
          return;
        }

        const response = await api.get(`/usuarios/listar/${storedUser.id}`);
        const data = response.data;

        setSenha(data.senha);

        setFormData({
          id: data.idUsuario,
          nomeCompleto: data.nomeCompleto,
          senha: data.senha,
          cpf: data.cpf,
          telefone: data.telefone,
          email: data.email,
          dataNascimento: data.dt_nasc,
          etnia: data.etnia,
          nacionalidade: data.nacionalidade,
          genero: data.genero,
          cargo: data.cargo?.tipoCargo || "",
          endereco: data.endereco
            ? `${data.endereco.logradouro}, ${data.endereco.numero} - ${data.endereco.bairro}, ${data.endereco.uf}`
            : "",
          canalComunicacao: data.canalComunicacao?.tipoCanalComunicacao || "",
        });

        setOriginalData({
          nomeCompleto: data.nomeCompleto,
          cpf: data.cpf,
          telefone: data.telefone,
          email: data.email,
          dt_nasc: data.dt_nasc,
          etnia: data.etnia,
          nacionalidade: data.nacionalidade,
          genero: data.genero,
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar os dados do usuário:", error);
        Swal.fire(
          "Erro",
          "Não foi possível carregar os dados do usuário.",
          "error"
        );
      }
    };

    fetchUserData();
  }, []);

  // 🔹 Atualiza os campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "telefone") formattedValue = formatTelefone(value);
    if (name === "nomeCompleto") formattedValue = formatNomeCompleto(value);
    if (name === "email") formattedValue = formatEmail(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // 🔹 Submeter alterações
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.includes("@"))
      return Swal.fire("Erro", "E-mail inválido.", "error");
    if (formData.telefone.length < 10)
      return Swal.fire("Erro", "Telefone inválido.", "error");

    if (formData.email !== originalData.email) {
      try {
        const check = await api.get(
          `/usuarios/existeEmail?email=${formData.email}`
        );

        if (check.data.exists) {
          return Swal.fire(
            "Erro",
            "Este e-mail já está sendo usado por outro usuário.",
            "error"
          );
        }
      } catch (err) {
        return Swal.fire(
          "Erro",
          err.response?.data?.message || "Erro ao verificar e-mail.",
          "error"
        );
      }
    }

    const confirm = await Swal.fire({
      title: "Salvar alterações?",
      showCancelButton: true,
      confirmButtonText: "Salvar",
      confirmButtonColor: "#45AA48",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const storedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));

      if (!storedUser?.id) {
        return Swal.fire("Erro", "Usuário não autenticado.", "error");
      }

      const dataToSend = {
        nomeCompleto: formData.nomeCompleto,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        dt_nasc: formData.dataNascimento,
        etnia: formData.etnia,
        nacionalidade: formData.nacionalidade,
        genero: formData.genero,
      };

      if (!originalData) return;

      const unchanged =
        dataToSend.nomeCompleto === originalData.nomeCompleto &&
        dataToSend.cpf === originalData.cpf &&
        dataToSend.telefone === originalData.telefone &&
        dataToSend.email === originalData.email &&
        dataToSend.dt_nasc === originalData.dt_nasc &&
        dataToSend.etnia === originalData.etnia &&
        dataToSend.nacionalidade === originalData.nacionalidade &&
        dataToSend.genero === originalData.genero;

      if (unchanged) {
        return Swal.fire("Aviso", "Nenhuma alteração foi realizada.", "info");
      }

      // 🔥 Só chama API se houve mudança
      const response = await api.put(
        `/usuarios/editar/${storedUser.id}`,
        dataToSend
      );

      const updatedUser = {
        id: response.data.idUsuario,
        nomeCompleto: response.data.nomeCompleto,
        tipoCargo: response.data.cargo?.tipoCargo || storedUser.tipoCargo,
        email: response.data.email,
      };

      updateUser(updatedUser);

      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("idUsuario", updatedUser.id);
        localStorage.setItem("nomeCompleto", updatedUser.nomeCompleto);
      }

      if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        sessionStorage.setItem("idUsuario", updatedUser.id);
        sessionStorage.setItem("nomeCompleto", updatedUser.nomeCompleto);
      }

      setFormData((prev) => ({
        ...prev,
        ...response.data,
        cargo: response.data.cargo?.tipoCargo || prev.cargo,
      }));

      Swal.fire("Sucesso!", "Dados atualizados com sucesso!", "success").then(
        () => {
          window.location.reload();
        }
      );
    } catch (error) {
      const msg =
        error.response?.data?.message || "Ocorreu um erro ao atualizar.";
      Swal.fire("Erro", msg, "error");
    }
  };

  // 🔹 Editar senha
  const EditarSenha = async () => {
    let showOld = false;
    let showNew = false;
    let showConfirm = false;

    const EyeIcon = () =>
      `<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const EyeOffIcon = () =>
      `<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    const renderIcon = (inputId, currentState, toggleFn) => {
      const input = document.getElementById(inputId);
      input.type = currentState ? "password" : "text";
      toggleFn(!currentState);
      document.getElementById(`icon-${inputId}`).innerHTML = currentState
        ? EyeIcon()
        : EyeOffIcon();
    };

    const validatePassword = (senha) => {
      if (!senha) return "Informe a senha";
      if (senha.length < 8) return "Senha deve ter no mínimo 8 caracteres";
      if (!/[A-Z]/.test(senha))
        return "Senha deve conter ao menos uma letra maiúscula";
      if (!/[0-9]/.test(senha)) return "Senha deve conter ao menos um número";
      if (!/[!@#$%^&*(),.?\":{}|<>_\\\-\\[\]/+`~;]/.test(senha))
        return "Senha deve conter ao menos um caractere especial";
      return null;
    };

    const { isConfirmed } = await Swal.fire({
      title: `<h2 style="font-size: 26px;">Editar Senha</h2>`,
      html: `
        <div style="display:flex; flex-direction:column; gap:16px; width: 85%; margin: 0 auto;">
          <label>Senha atual</label>
          <div style="position:relative;">
            <input id="swal-old-pass" type="password" style="width:100%; padding:10px 40px 10px 12px; border-radius:8px; border:1px solid #ccc;">
            <span id="icon-swal-old-pass" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); cursor:pointer;">${EyeIcon()}</span>
          </div>

          <label>Nova senha</label>
          <div style="position:relative;">
            <input id="swal-new-pass" type="password" style="width:100%; padding:10px 40px 10px 12px; border-radius:8px; border:1px solid #ccc;">
            <span id="icon-swal-new-pass" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); cursor:pointer;">${EyeIcon()}</span>
          </div>

          <label>Confirmar nova senha</label>
          <div style="position:relative;">
            <input id="swal-confirm-pass" type="password" style="width:100%; padding:10px 40px 10px 12px; border-radius:8px; border:1px solid #ccc;">
            <span id="icon-swal-confirm-pass" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); cursor:pointer;">${EyeIcon()}</span>
          </div>
        </div>
      `,
      showDenyButton: true,
      confirmButtonText: "Salvar",
      confirmButtonColor: "#45AA48",
      denyButtonText: "Cancelar",
      focusConfirm: false,
      didRender: () => {
        document
          .getElementById("icon-swal-old-pass")
          ?.addEventListener("click", () =>
            renderIcon("swal-old-pass", showOld, (val) => (showOld = val))
          );
        document
          .getElementById("icon-swal-new-pass")
          ?.addEventListener("click", () =>
            renderIcon("swal-new-pass", showNew, (val) => (showNew = val))
          );
        document
          .getElementById("icon-swal-confirm-pass")
          ?.addEventListener("click", () =>
            renderIcon(
              "swal-confirm-pass",
              showConfirm,
              (val) => (showConfirm = val)
            )
          );
      },
      preConfirm: async () => {
        const oldPass = document.getElementById("swal-old-pass").value;
        const newPass = document.getElementById("swal-new-pass").value;
        const confirmPass = document.getElementById("swal-confirm-pass").value;

        const validationMessage = validatePassword(newPass);
        if (validationMessage) {
          Swal.showValidationMessage(validationMessage);
          return false;
        }

        if (!oldPass || !newPass || !confirmPass) {
          Swal.showValidationMessage("Preencha todos os campos.");
          return false;
        }
        if (newPass !== confirmPass) {
          Swal.showValidationMessage("As senhas não coincidem.");
          return false;
        }
        if (newPass === oldPass) {
          Swal.showValidationMessage(
            "A nova senha não pode ser igual à atual."
          );
          return false;
        }

        try {
          const storedUser =
            JSON.parse(localStorage.getItem("user")) ||
            JSON.parse(sessionStorage.getItem("user"));
          if (!storedUser?.id) {
            Swal.showValidationMessage("Usuário não autenticado.");
            return false;
          }

          await api.patch(`/usuarios/redefinirSenha/${storedUser.id}`, {
            senhaAtual: oldPass,
            novaSenha: newPass,
          });
          return true;
        } catch (err) {
          Swal.showValidationMessage(
            err.response?.data?.message || "Senha atual incorreta."
          );
          return false;
        }
      },
    });

    if (isConfirmed) {
      Swal.fire("Sucesso!", "Senha atualizada com sucesso!", "success");
    }
  };

  return (
    <div className="user-details-container">
      <h1 className="title">Detalhes do usuário</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Cargo</label>
            <div className="input-readonly">
              {typeof formData.cargo === "object"
                ? formData.cargo?.tipoCargo
                : formData.cargo || "Não informado"}
            </div>
          </div>
          <div className="form-group">
            <label>CPF</label>
            <div className="input-readonly">{formData.cpf}</div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Data de Nascimento</label>
            <div className="input-readonly">{formData.dataNascimento}</div>
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Etinia</label>
            <div className="input-readonly">{formData.etnia}</div>
          </div>
          <div className="form-group">
            <label>Nacionalidade</label>
            <div className="input-readonly">{formData.nacionalidade}</div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nomeCompleto">Nome Completo</label>
            <input
              type="text"
              id="nomeCompleto"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="genero">Gênero</label>
            <select
              id="genero"
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
              className="select-field"
            >
              <option value="" disabled>
                {" "}
                Selecione{" "}
              </option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="nao-informar">Prefiro não informar</option>
              <option value="outros">Outros</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            width: "100%",
          }}
        >
          <button
            style={{ flex: 1 }}
            type="button"
            onClick={EditarSenha}
            className="submit-button"
          >
            Editar Senha
          </button>

          <button style={{ flex: 1 }} type="submit" className="submit-button">
            Editar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilUsuario;
