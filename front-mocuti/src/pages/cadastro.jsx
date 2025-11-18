import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { formatNomeCompleto, formatCpf, formatTelefone, formatCep, formatEmail } from '../utils/formatUtils';

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

function Cadastro() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
  fetch("http://localhost:8080/categorias")
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao buscar categorias");
      return res.json();
    })
    .then((data) => setCategorias(data))
    .catch((err) => console.error("Erro ao carregar categorias:", err));
}, []);



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
    // limpar erro do campo ao digitar
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Valida email: precisa conter '@' e '.' e não permitir caracteres especiais exceto '.'
  const validateEmail = (email) => {
    if (!email) return "Informe o email";
    // permite apenas letras, números e pontos nos lados local e domínio, exige '@' e '.'
    const re = /^[A-Za-z0-9.]+@[A-Za-z0-9.]+\.[A-Za-z]{2,}$/;
    return re.test(email) ? null : "Email inválido. Deve conter '@' e '.'";
  };
  
  // Valida nome: pelo menos 3 letras
  const validateNome = (nome) => {
    if (!nome) return "Informe o nome completo";
    // remove tudo que não seja letra (inclui acentos latinos)
    const apenasLetras = nome.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
    if (apenasLetras.length < 3) return "Nome deve ter no mínimo 3 letras";
    return null;
  };
  
  // Valida senha: min 8, pelo menos 1 número, 1 maiúscula, 1 caractere especial, e não pode ser igual ao nome ou ao email
  const validatePassword = (senha, nome, email) => {
    if (!senha) return "Informe a senha";
    if (senha.length < 8) return "Senha deve ter no mínimo 8 caracteres";
    if (!/[A-Z]/.test(senha)) return "Senha deve conter ao menos uma letra maiúscula";
    if (!/[0-9]/.test(senha)) return "Senha deve conter ao menos um número";
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+`~;]/.test(senha)) return "Senha deve conter ao menos um caractere especial";
    if (nome && senha.toLowerCase().includes(nome.replace(/\s+/g, '').toLowerCase())) return "Senha não pode ser igual ao nome";
    if (email && senha === email) return "Senha não pode ser igual ao email";
    return null;
  };

  const validateCpf = (cpf) => {
    if (!cpf) return "Informe o CPF";
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return "CPF inválido (deve conter 11 dígitos)";
    return null;
  };

  const validateTelefone = (telefone) => {
    if (!telefone) return "Informe o telefone";
    const digits = telefone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) return "Telefone inválido (10 ou 11 dígitos esperados)";
    return null;
  };

  // Valida todos os campos da Etapa 1 antes de permitir avançar
  const validarEtapa1 = () => {
    const newErrors = {};
    // campos obrigatórios da etapa 1
    const nomeErr = validateNome(formData.nomeCompleto); if (nomeErr) newErrors.nomeCompleto = nomeErr;
    const cpfErr = validateCpf(formData.cpf); if (cpfErr) newErrors.cpf = cpfErr;
    const telErr = validateTelefone(formData.telefone); if (telErr) newErrors.telefone = telErr;
    if (!formData.dataNascimento) newErrors.dataNascimento = "Informe a data de nascimento";
    if (!formData.genero) newErrors.genero = "Selecione o gênero";
    if (!formData.nacionalidade) newErrors.nacionalidade = "Selecione a nacionalidade";
    // categoria pode não existir no formulário antigo; somente checar se existe como obrigatório
    if ('categoria' in formData && !formData.categoria) newErrors.categoria = "Selecione uma categoria";
    const emailErr = validateEmail(formData.email); if (emailErr) newErrors.email = emailErr;
    const senhaErr = validatePassword(formData.senha, formData.nomeCompleto, formData.email); if (senhaErr) newErrors.senha = senhaErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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


  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validarEtapa1()) {
      setCurrentStep(2);
    } else {
      // opcional: focar no primeiro erro
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const el = document.querySelector(`[name="${firstErrorField}"]`) || document.querySelector(`#${firstErrorField}`);
        if (el) el.focus();
      }
    }
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
        cargo: 2,
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
        canalComunicacao: parseInt(formData.canalComunicacao) || 1,
        idCategoriaPreferida: parseInt(formData.categoria)
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
                <input name="nomeCompleto" className="form-input" type="text" value={formData.nomeCompleto} onChange={(e) => handleInputChange('nomeCompleto', e.target.value)} required />
                {errors.nomeCompleto && <span className="error-text">{errors.nomeCompleto}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CPF</label>
                  <input name="cpf" className="form-input" type="text" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} required />
                  {errors.cpf && <span className="error-text">{errors.cpf}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input name="telefone" className="form-input" type="tel" value={formData.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} required />
                  {errors.telefone && <span className="error-text">{errors.telefone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Data Nascimento</label>
                  <input className="form-input" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} required />
                  {errors.dataNascimento && <span className="error-text">{errors.dataNascimento}</span>}
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
                  {errors.genero && <span className="error-text">{errors.genero}</span>}
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Nacionalidade</label>
                  <select
                    className="form-select"
                    value={formData.nacionalidade || ''}
                    onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                    required
                  >
                    <option disabled value="">Selecione</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Colômbia">Colômbia</option>
                    <option value="Chile">Chile</option>
                    <option value="Peru">Peru</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Equador">Equador</option>
                    <option value="Bolívia">Bolívia</option>
                    <option value="Uruguai">Uruguai</option>
                    <option value="Paraguai">Paraguai</option>
                    <option value="México">México</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Honduras">Honduras</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Nicarágua">Nicarágua</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Panamá">Panamá</option>
                    <option value="República Dominicana">República Dominicana</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Outro">Outro</option>
                  </select>
                  {errors.nacionalidade && <span className="error-text">{errors.nacionalidade}</span>}
                </div>
              </div>

             <div className="form-group">
  <label htmlFor="label" className="form-label">Categoria Preferida</label>
  <select
    required
    className="form-select"
    value={formData.categoria || ""}
    onChange={(e) => handleInputChange("categoria", e.target.value)}
  >
    <option disabled value="">Selecione uma categoria de evento</option>
    {categorias.map((categoria) => (
      <option key={categoria.idCategoria} value={categoria.idCategoria}>
        {categoria.nome}
      </option>
    ))}
  </select>
  {errors.categoria && <span className="error-text">{errors.categoria}</span>}
</div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" className="form-input" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group password-input-container">
                <label className="form-label">Senha</label>
                <div
                  className="input-wrapper"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <input
                    name="senha"
                    className="form-input password-input"
                    style={{ flex: 1 }}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password-btn"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '40%',
                      cursor: 'pointer'
                    }}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.senha && <span className="error-text">{errors.senha}</span>}
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


