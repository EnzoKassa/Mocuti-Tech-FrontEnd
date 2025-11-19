import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../api/api"; //importa sua instância Axios configurada

const PerfilUsuario = () => {
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
    senha: ""
  });

  const [senha, setSenha] = useState()

  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Busca os dados do usuário ao carregar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        if (!user || !user.id) {
          Swal.fire("Erro", "Usuário não autenticado.", "error");
          return;
        }

        const userId = user.id;
        const response = await api.get(`/usuarios/listar/${userId}`);
        const data = response.data;
        
        setSenha(data.senha)

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
          canalComunicacao: data.canalComunicacao?.tipoCanalComunicacao || ""
        });
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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Envia os dados atualizados para o backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      Swal.fire("Erro", "E-mail inválido.", "error");
      return;
    }
    if (formData.telefone.length < 10) {
      Swal.fire("Erro", "Telefone inválido.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Você deseja salvar as alterações?",
      showDenyButton: true,
      confirmButtonText: "Salvar",
      denyButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn-confirm",
        denyButton: "btn-deny"
      }
    });

    if (result.isConfirmed) {
      try {
        const user =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        if (!user || !user.id) {
          Swal.fire("Erro", "Usuário não autenticado.", "error");
          return;
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

        await api.put(`/usuarios/editar/${user.id}`, dataToSend);

        Swal.fire("Salvo!", "As alterações foram salvas com sucesso.", "success");
      } catch (error) {
        console.error(error);

        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Não foi possível salvar as alterações.";

        Swal.fire("Erro", msg, "error");
      }
    } else if (result.isDenied) {
      Swal.fire("Alterações não salvas", "Nenhuma alteração foi feita.", "info");
    }
  };

  const EditarSenha = async (e) => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "Editar senha",
      html: `
        <div style="text-align:center;display: flex;flex-direction: column;align-items: center;">
          <div class="swal-input-group" style="text-align:center;display: flex;flex-direction: column;align-items: center;">
            <label for="swal-old-pass" class="swal2-label" style="display:block;margin-bottom:6px;font-weight:600">Senha atual</label>
            <input id="swal-old-pass" type="password" class="swal2-input" style="margin-left:0;margin-top:0;margin-bottom:12px;margin-right:0">
          </div>
          <div class="swal-input-group" style="text-align:center;display: flex;flex-direction: column;align-items: center;">
            <label for="swal-new-pass" class="swal2-label" style="display:block;margin-bottom:6px;font-weight:600" >Nova senha</label>
            <input id="swal-new-pass" type="password" class="swal2-input" style="margin-left:0;margin-top:0;margin-bottom:12px;margin-right:0">
          </div>
          <div class="swal-input-group" style="text-align:center;display: flex;flex-direction: column;align-items: center;">
            <label for="swal-confirm-pass" class="swal2-label" style="display:block;margin-bottom:6px;font-weight:600">Confirmar nova senha</label>
            <input id="swal-confirm-pass" type="password" class="swal2-input" style="margin-left:0;margin-top:0;margin-bottom:12px;margin-right:0">
          </div>
        </div>
      `,
      focusConfirm: false,
      showDenyButton: true,
      confirmButtonText: "Editar senha",
      denyButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn-confirm",
        denyButton: "btn-deny",
      },
      preConfirm: () => {
        const oldPass = document.getElementById("swal-old-pass").value;
        const newPass = document.getElementById("swal-new-pass").value;
        const confirmPass = document.getElementById("swal-confirm-pass").value;
        if (!oldPass || !newPass || !confirmPass) {
          Swal.showValidationMessage("Preencha todos os campos!");
          return false;
        }

        if (oldPass != senha) {
          Swal.showValidationMessage("Senha Antiga Incorreta!");
          return false;
        }

        if (newPass < 8) {
          Swal.showValidationMessage("Senha deve ter no mínimo 8 caracteres");
          return false;
        }

        if (!/[A-Z]/.test(newPass)) {
          Swal.showValidationMessage("Senha deve conter ao menos uma letra maiúscula");
          return false;
        }

        if (!/[0-9]/.test(newPass)) {
          Swal.showValidationMessage("Senha deve conter ao menos um número");
          return false;
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+`~;]/.test(newPass)) {
          Swal.showValidationMessage("Senha deve conter ao menos um caractere especial");
          return false;
        }
              
        if (newPass != confirmPass) {
          Swal.showValidationMessage("A nova senha e a confirmação não coincidem!");
          return false;
        }

        return { oldPass, newPass, confirmPass };
      }
    });

    if (isConfirmed) {
      try {
        const user =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        if (!user || !user.id) {
          Swal.fire("Erro", "Usuário não autenticado.", "error");
          return;
        }

        const userId = user.id;
        const body = {senha: formValues.newPass};
        const res = await api.patch(`/usuarios/redefinirSenha/${userId}`, body)

        console.log('Senha redefinida com sucesso:', res.data)
        Swal.fire("Salvo!", "A alteração de senha foi salva com sucesso.", "success");
      } catch(error) {
        console.error('Erro ao redefinir senha:', error)
        Swal.fire("Erro", "Erro ao redefinir senha", "error");
      }
    } else {
      console.log("Ação cancelada");
      Swal.fire("A alteração de senha não salva", "Nenhuma alteração foi feita.", "info");
    }

  }

  return (
    <div className="user-details-container">
      <h1 className="title">Detalhes do usuário</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Cargo</label>
            <div className="input-readonly">{formData.cargo}</div>
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
              <option value="Prefiro não informar">Prefiro não informar</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
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

        <button type="submit" className="submit-button">
          Editar
        </button>

        <button type="button" onClick={EditarSenha} className="submit-button">
          Editar Senha
        </button>
      </form>
    </div>
  );
};

export default PerfilUsuario;
