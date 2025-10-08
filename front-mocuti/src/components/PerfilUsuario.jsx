import React, { useState } from 'react'
import Swal from 'sweetalert2'

const PerfilUsuario = () => {
  const [formData, setFormData] = useState({
    cargo: 'Beneficiário',
    cpf: '123.456.789-00',
    dataNascimento: '18/05/1995',
    telefone: '',
    nomeCompleto: '',
    genero: 'Prefiro não informar',
    email: '',
    senha: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
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
      Swal.fire({
        title: "Salvo!",
        text: "As alterações foram salvas com sucesso.",
        icon: "success",
        customClass: {
          confirmButton: "btn-confirm", 
        },
      });
    } else if (result.isDenied) {
      Swal.fire({
        title: "Alterações não salvas",
        text: "Nenhuma alteração foi feita.",
        icon: "info",
        customClass: {
          denyButton: "btn-deny", 
        },
      });
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
            <div className="input-field">{formData.dataNascimento}</div>
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

        <div className="form-group full-width">
          <label htmlFor="senha">Senha</label>
            <input
              type={showPassword ? "text" : "password"}
              id="senha"
              name="senha"
              value={formData.senha}
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
  )
}

export default PerfilUsuario
