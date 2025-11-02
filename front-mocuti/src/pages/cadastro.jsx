import { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { formatNomeCompleto, formatCpf, formatTelefone, formatCep, formatEmail } from '../utils/formatUtils';

function Cadastro() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    switch (field) {
      case 'nomeCompleto':
        formattedValue = formatNomeCompleto(value);
        break;
      case 'cpf':
        formattedValue = formatCpf(value);
        break;
      case 'telefone':
        formattedValue = formatTelefone(value);
        break;
      case 'cep':
        formattedValue = formatCep(value);
        break;
      case 'email':
        formattedValue = formatEmail(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };


  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    dataNascimento: '',
    genero: '',
    email: '',
    senha: '',
    nacionalidade: '',
    etnia: '',
    canalComunicacao: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    uf: '',
    estado: '',
    bairro: ''
  });

  const [errors, setErrors] = useState({});

  // Atualizar campos com máscaras
  // const handleInputChange = (field, value) => {
  //   let formattedValue = value;

  //   if (field === 'cpf') {
  //     formattedValue = value
  //       .replace(/\D/g, '')
  //       .replace(/(\d{3})(\d)/, '$1.$2')
  //       .replace(/(\d{3})(\d)/, '$1.$2')
  //       .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  //       .slice(0, 14);
  //   }

  //   if (field === 'telefone') {
  //     formattedValue = value
  //       .replace(/\D/g, '')
  //       .replace(/^(\d{2})(\d)/g, '($1) $2')
  //       .replace(/(\d{5})(\d)/, '$1-$2')
  //       .slice(0, 15);
  //   }

  //   if (field === 'cep') {
  //     formattedValue = value
  //       .replace(/\D/g, '')
  //       .replace(/^(\d{5})(\d)/, '$1-$2')
  //       .slice(0, 9);
  //   }

  //   setFormData(prev => ({ ...prev, [field]: formattedValue }));
  // };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  const handleNextStep = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePrevStep = () => setCurrentStep(1);

  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        alert("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        uf: data.uf || '',
        estado: data.localidade || ''
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      alert("Não foi possível buscar o endereço.");
    }
  };

  const validarEtapa2 = () => {
    const newErrors = {};
    if (!formData.etnia) newErrors.etnia = "Selecione a etnia";
    if (!formData.canalComunicacao) newErrors.canalComunicacao = "Selecione o canal de comunicação";
    if (!formData.cep) newErrors.cep = "Informe o CEP";
    if (!formData.logradouro) newErrors.logradouro = "Informe o logradouro";
    if (!formData.uf) newErrors.uf = "Informe a UF";
    if (!formData.estado) newErrors.estado = "Informe a cidade";
    if (!formData.bairro) newErrors.bairro = "Informe o bairro";
    if (!formData.numero) newErrors.numero = "Informe o número";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const cadastrarUsuario = async () => {
    try {
      const payload = {
        nomeCompleto: formData.nomeCompleto,
        cpf: formData.cpf,
        telefone: formData.telefone,
        dataNascimento: formData.dataNascimento,
        etnia: formData.etnia,
        nacionalidade: formData.nacionalidade,
        genero: formData.genero,
        email: formData.email,
        senha: formData.senha,
        cargo: 1,
        endereco: {
          idEndereco: 0,
          cep: formData.cep,
          logradouro: formData.logradouro,
          numero: parseInt(formData.numero) || 0,
          complemento: formData.complemento,
          uf: formData.uf,
          estado: formData.estado,
          bairro: formData.bairro
        },
        canalComunicacao: parseInt(formData.canalComunicacao) || 1
      };

      const res = await fetch("http://localhost:8080/usuarios/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao cadastrar usuário");
     Swal.fire({
  icon: 'success',
  title: 'Sucesso!',
  text: 'Cadastro realizado com sucesso!',
  confirmButtonText: 'OK'
});


      navigate('/login');
    } catch (err) {
  console.error(err);
  Swal.fire({
    icon: 'error',
    title: 'Erro!',
    text: 'Erro ao cadastrar usuário.',
    confirmButtonText: 'OK'
  });
}

  };

  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    if (validarEtapa2()) {
      cadastrarUsuario();
    } else {
      alert("Preencha todos os campos obrigatórios corretamente.");
    }
  };

  return (
    <div className="cadastro-container" style={{ fontSize: `${fontSize}px` }}>
      <div className="cadastro-form-section">
        <div className="accessibility-buttons">
          <button type="button" onClick={decreaseFontSize} className="accessibility-btn decrease-font">A-</button>
          <button type="button" onClick={increaseFontSize} className="accessibility-btn increase-font">A+</button>
        </div>

        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title" style={{ fontSize: `${fontSize * 2}px` }}>
              Cadastre-se</h1>
          </div>

          {/* Etapa 1 */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="cadastro-form form-step step-1">
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input className="form-input" type="text" value={formData.nomeCompleto} onChange={(e) => handleInputChange('nomeCompleto', e.target.value)} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CPF</label>
                  <input className="form-input" type="text" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input className="form-input" type="tel" value={formData.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Data Nascimento</label>
                  <input className="form-input" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gênero</label>
                  <select className="form-select" value={formData.genero} onChange={(e) => handleInputChange('genero', e.target.value)} required>
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="nao-informar">Prefiro não informar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nacionalidade</label>
                  <input className="form-input" type="text" value={formData.nacionalidade} onChange={(e) => handleInputChange('nacionalidade', e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
              </div>

              <div className="form-group password-input-container">
                <label className="form-label">Senha</label>
                <input className="form-input password-input" type={showPassword ? 'text' : 'password'} value={formData.senha} onChange={(e) => handleInputChange('senha', e.target.value)} required />
                <button type="button" className="password-toggle-btn" onClick={togglePasswordVisibility}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
              </div>

              <button type="submit" className="next-btn">Próximo</button>
            </form>
          )}

          {/* Etapa 2 */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmitStep2} className="cadastro-form form-step step-2">
              <div className="form-group">
                <label className="form-label">Raça/Etnia</label>
                <select className="form-select" value={formData.etnia} onChange={(e) => handleInputChange('etnia', e.target.value)} required>
                  <option value="">Selecione</option>
                  <option value="Branca">Branca</option>
                  <option value="Preta">Preta</option>
                  <option value="Parda">Parda</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Indigena">Indígena</option>
                  <option value="nao-informar">Prefiro Não Informar</option>
                </select>
                {errors.etnia && <span className="error-text">{errors.etnia}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Canal de Comunicação</label>
                <select className="form-select" value={formData.canalComunicacao} onChange={(e) => handleInputChange('canalComunicacao', e.target.value)} required>
                  <option value="">Selecione</option>
                  <option value="1">E-mail</option>
                  <option value="2">WhatsApp</option>
                  <option value="3">SMS</option>
                </select>
                {errors.canalComunicacao && <span className="error-text">{errors.canalComunicacao}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">CEP</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  onBlur={() => buscarEnderecoPorCEP(formData.cep)}
                  required
                />
                {errors.cep && <span className="error-text">{errors.cep}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Logradouro</label>
                <input className="form-input" type="text" value={formData.logradouro} onChange={(e) => handleInputChange('logradouro', e.target.value)} required />
                {errors.logradouro && <span className="error-text">{errors.logradouro}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">UF</label>
                  <input className="form-input" type="text" value={formData.uf} onChange={(e) => handleInputChange('uf', e.target.value)} required />
                  {errors.uf && <span className="error-text">{errors.uf}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-input" type="text" value={formData.estado} onChange={(e) => handleInputChange('estado', e.target.value)} required />
                  {errors.estado && <span className="error-text">{errors.estado}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input className="form-input" type="text" value={formData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)} required />
                {errors.bairro && <span className="error-text">{errors.bairro}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Número</label>
                  <input className="form-input" type="text" value={formData.numero} onChange={(e) => handleInputChange('numero', e.target.value)} required />
                  {errors.numero && <span className="error-text">{errors.numero}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Complemento</label>
                  <input className="form-input" type="text" value={formData.complemento} onChange={(e) => handleInputChange('complemento', e.target.value)} />
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" onClick={handlePrevStep} className="prev-btn">Voltar</button>
                <button type="submit" className="submit-btn">Cadastrar</button>
              </div>
            </form>
          )}

          <div className="login-link-container">
            <span className="login-text">Já tem uma conta? </span>
            <button type="button" onClick={() => navigate('/login')} className="login-link">Faça login aqui</button>
          </div>
        </div>
      </div>

      <div className="cadastro-image-section">
        <div className="image-container">
          <img src="\src\assets\images\cadastro_img.png" alt="Pessoas preparando refeições comunitárias" className="background-image" />
        </div>
      </div>
    </div>
  );
}

export default Cadastro;


