import React, { useState } from 'react'
import api from '../api/api'

function CadastroUsuario() {
  const [cadastro, setCadastro] = useState({
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    dataNascimento: '',
    etnia: '',
    nacionalidade: '',
    genero: '',
    email: '',
    senha: '',
    cargo: '',          // opcional, número ou vazio
    endereco: '',       // número (ID do endereço)
    canalComunicacao: '' // número (ID do canal)
  })

  const [msg, setMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setCadastro(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCadastrar = async () => {
    try {
      // converter cargo, endereco e canalComunicacao para número ou null
      const payload = {
        ...cadastro,
        cargo: cadastro.cargo ? parseInt(cadastro.cargo) : null,
        endereco: parseInt(cadastro.endereco),
        canalComunicacao: parseInt(cadastro.canalComunicacao),
      }
      const res = await api.post('/usuarios/cadastrar', payload)
      setMsg(`Usuário cadastrado: ${res.data.nomeCompleto}`)
    } catch (err) {
      setMsg(`Erro: ${err.response?.data?.message || err.message}`)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Cadastro de Usuário</h2>

      <input
        name="nomeCompleto"
        placeholder="Nome Completo"
        value={cadastro.nomeCompleto}
        onChange={handleChange}
      />
      <input
        name="cpf"
        placeholder="CPF"
        value={cadastro.cpf}
        onChange={handleChange}
      />
      <input
        name="telefone"
        placeholder="Telefone (opcional)"
        value={cadastro.telefone}
        onChange={handleChange}
      />
      <input
        name="dataNascimento"
        type="date"
        placeholder="Data de Nascimento"
        value={cadastro.dataNascimento}
        onChange={handleChange}
      />
      <input
        name="etnia"
        placeholder="Etnia"
        value={cadastro.etnia}
        onChange={handleChange}
      />
      <input
        name="nacionalidade"
        placeholder="Nacionalidade"
        value={cadastro.nacionalidade}
        onChange={handleChange}
      />
      <input
        name="genero"
        placeholder="Gênero"
        value={cadastro.genero}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={cadastro.email}
        onChange={handleChange}
      />
      <input
        name="senha"
        type="password"
        placeholder="Senha"
        value={cadastro.senha}
        onChange={handleChange}
      />
      <input
        name="cargo"
        placeholder="Cargo (número, opcional)"
        value={cadastro.cargo}
        onChange={handleChange}
      />
      <input
        name="endereco"
        placeholder="ID do Endereço"
        value={cadastro.endereco}
        onChange={handleChange}
      />
      <input
        name="canalComunicacao"
        placeholder="ID do Canal de Comunicação"
        value={cadastro.canalComunicacao}
        onChange={handleChange}
      />

      <button onClick={handleCadastrar}>Cadastrar</button>
      <p>{msg}</p>
    </div>
  )
}

export default CadastroUsuario
