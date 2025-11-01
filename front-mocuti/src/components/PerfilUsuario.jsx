import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const PerfilUsuario = () => {
  const [formData, setFormData] = useState({
    "id": Number,
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
    canalComunicacao: ""
  

  });

  const [showPassword, setShowPassword] = useState(false);
  // Busca os dados do usuário ao carregar o componente
  useEffect(() => {
    try {
      // Recupera o objeto do usuário do localStorage ou sessionStorage
      const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  
      // Verifica se o usuário está autenticado
      if (!user || !user.id) {
        Swal.fire("Erro", "Usuário não autenticado.", "error");
        return;
      }
  
      // Extrai o ID do usuário
      const userId = user.id;
  
      // Faz a requisição ao backend
      const fetchUserData = async () => {
        try {
          const response = await fetch(`http://localhost:8080/usuarios/listar/${userId}`);
  
          if (!response.ok) {
            throw new Error("Erro ao buscar os dados do usuário.");
          }
  
          const data = await response.json();
  
          // Atualiza o estado com os dados necessários para a tela
          setFormData({
            id: data.idUsuario,
            nomeCompleto: data.nomeCompleto,
            cpf: data.cpf,
            telefone: data.telefone,
            email: data.email,
            dataNascimento: data.dt_nasc,
            etnia: data.etnia,
            nacionalidade: data.nacionalidade,
            genero: data.genero,
            cargo: data.cargo.tipoCargo, // Apenas o tipo do cargo
            endereco: `${data.endereco.logradouro}, ${data.endereco.numero} - ${data.endereco.bairro}, ${data.endereco.uf}`, // Endereço formatado
            canalComunicacao: data.canalComunicacao.tipoCanalComunicacao, // Tipo do canal de comunicação
          });
        } catch (error) {
          console.error("Erro ao buscar os dados do usuário:", error);
          Swal.fire("Erro", "Não foi possível carregar os dados do usuário.", "error");
        }
      };
  
      fetchUserData();
    } catch (error) {
      console.error("Erro inesperado:", error);
      Swal.fire("Erro", "Ocorreu um erro inesperado.", "error");
    }
  }, []);

  // Atualiza os campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Envia os dados atualizados para o backend
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validações simples
  //   if (!formData.email.includes("@")) {
  //     Swal.fire("Erro", "E-mail inválido.", "error");
  //     return;
  //   }
  //   if (formData.telefone.length < 10) {
  //     Swal.fire("Erro", "Telefone inválido.", "error");
  //     return;
  //   }

  //   // Exibe o popup de confirmação
  //   const result = await Swal.fire({
  //     title: "Você deseja salvar as alterações?",
  //     showDenyButton: true,
  //     confirmButtonText: "Salvar",
  //     denyButtonText: "Cancelar",
  //     customClass: {
  //       confirmButton: "btn-confirm",
  //       denyButton: "btn-deny",
  //     },
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       const userId = user.id;

  //       const response = await fetch(`http://localhost:8080/usuarios/editar/${userId}`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Erro ao salvar os dados.");
  //       }

  //       Swal.fire("Salvo!", "As alterações foram salvas com sucesso.", "success");
  //     } catch (error) {
  //       console.error(error);
  //       Swal.fire("Erro", "Não foi possível salvar as alterações.", "error");
  //     }
  //   } else if (result.isDenied) {
  //     Swal.fire("Alterações não salvas", "Nenhuma alteração foi feita.", "info");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validações simples
    if (!formData.email.includes("@")) {
      Swal.fire("Erro", "E-mail inválido.", "error");
      return;
    }
    if (formData.telefone.length < 10) {
      Swal.fire("Erro", "Telefone inválido.", "error");
      return;
    }
  
    // Exibe o popup de confirmação
    const result = await Swal.fire({
      title: "Você deseja salvar as alterações?",
      showDenyButton: true,
      confirmButtonText: "Salvar",
      denyButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn-confirm",
        denyButton: "btn-deny",
      },
    });
  
    if (result.isConfirmed) {
      try {
        // Recupera o objeto do usuário do localStorage ou sessionStorage
        const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  
        if (!user || !user.id) {
          Swal.fire("Erro", "Usuário não autenticado.", "error");
          return;
        }
  
        // Filtrar os dados aceitos pelo endpoint
        const dataToSend = {
          nomeCompleto: formData.nomeCompleto,
          cpf: formData.cpf,
          telefone: formData.telefone,
          email: formData.email,
          dt_nasc: formData.dataNascimento, // Certifique-se de que o campo seja enviado como "dt_nasc"
          etnia: formData.etnia,
          nacionalidade: formData.nacionalidade,
          genero: formData.genero,
        };
  
        const response = await fetch(`http://localhost:8080/usuarios/editar/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });
  
        if (!response.ok) {
          throw new Error("Erro ao salvar os dados.");
        }
  
        Swal.fire("Salvo!", "As alterações foram salvas com sucesso.", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Não foi possível salvar as alterações.", "error");
      }
    } else if (result.isDenied) {
      Swal.fire("Alterações não salvas", "Nenhuma alteração foi feita.", "info");
    }
  };

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
              <option value="Outro">Outro</option>
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
      </form>
    </div>
  );
};

export default PerfilUsuario;

