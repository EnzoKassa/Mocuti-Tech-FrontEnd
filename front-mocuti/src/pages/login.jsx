import { useState, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../styles/Login.css'

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

const Login = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [fontSize, setFontSize] = useState(18)
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const emailRef = useRef(null);
    const senhaRef = useRef(null);
    const [rememberMe, setRememberMe] = useState(false);

    const onSwitchToRegister = () => {
        navigate('/Cadastro')
    }

    const onSwitchToPassword = () => {
        navigate('/forgot-password')
    }

    const validateEmail = (value) => {
        if (!value) return "Informe o email";
        const re = /^[A-Za-z0-9.]+@[A-Za-z0-9.]+\.[A-Za-z]{2,}$/;
        return re.test(value) ? null : "Email inválido. Deve conter '@' e '.'";
    };

    const validateSenha = (value) => {
        if (!value) return "Informe a senha";
        if (value.length < 8) return "Senha deve ter no mínimo 8 caracteres";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        const newErrors = {};
        const emailErr = validateEmail(email);
        if (emailErr) newErrors.email = emailErr;
        const senhaErr = validateSenha(senha);
        if (senhaErr) newErrors.senha = senhaErr;
        setErrors(newErrors);
        if (Object.keys(newErrors).length) {
            if (newErrors.email && emailRef.current) emailRef.current.focus();
            else if (newErrors.senha && senhaRef.current) senhaRef.current.focus();
            Swal.fire({
                icon: "error",
                title: "Erro",
                text: "Verifique os campos e tente novamente."
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const userData = await login(email, senha, rememberMe);
            const user = userData || JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));

            Swal.fire({
                icon: "success",
                title: "Login realizado com sucesso!",
                showConfirmButton: false,
                timer: 1500
            });

            if (user?.tipoCargo === "Administrador") navigate("/admin/eventos");
            else if (user?.tipoCargo === "Moderador") navigate("/moderador/eventos");
            else if (user?.tipoCargo === "Usuário") navigate("/usuario/eventos");
        } catch (err) {
            const msg = err?.message || "Falha ao autenticar";
            setSubmitError(msg);
            Swal.fire({
                icon: "error",
                title: "Erro ao autenticar",
                text: msg
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const increaseFontSize = () => {
        setFontSize(prev => Math.min(prev + 2, 28))
    }

    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(prev - 2, 12))
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="login-container" style={{ fontSize: `${fontSize}px` }}>
            {/* Coluna da esquerda - Imagem */}
            <div className="login-image-section">
                <div className="image-container">
                    <img
                        src="\src\assets\images\login_img.png"
                        alt="Pessoas em atividade comunitária"
                        className="background-image"
                    />
                </div>
            </div>

            {/* Coluna da direita - Formulário */}
            <div className="login-form-section">
                {/* Botões de acessibilidade */}
                <div className="accessibility-buttons">
                    <button
                        type="button"
                        onClick={decreaseFontSize}
                        className="accessibility-btn decrease-font"
                    >
                        A-
                    </button>
                    <button
                        type="button"
                        onClick={increaseFontSize}
                        className="accessibility-btn increase-font"
                    >
                        A+
                    </button>
                </div>

                <div className="form-container">
                    {/* Cabeçalho */}
                    <div className="form-header">
                        <h1 className="form-title" style={{ fontSize: `${fontSize * 2}px` }}>
                            Bem vindo de volta!
                        </h1>
                        <p className="form-subtitle" style={{ fontSize: `${fontSize * 0.9}px` }}>
                            Por favor, faça login para continuar
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="login-form" noValidate>
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label" style={{ fontSize: `${fontSize * 0.875}px` }}>
                                Email
                            </label>
                            <input
                                id="email"
                                ref={emailRef}
                                type="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors(prev => ({ ...prev, email: undefined }));
                                    setSubmitError("");
                                }}
                                className="form-input"
                                required
                            />
                            {errors.email && <span className="error-text" role="alert">{errors.email}</span>}
                        </div>

                        {/* Senha */}
                        <div className="form-group">
                            <label htmlFor="senha" className="form-label" style={{ fontSize: `${fontSize * 0.875}px` }}>
                                Senha
                            </label>
                            <div className="password-input-container">
                                <input
                                    id="senha"
                                    ref={senhaRef}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(e) => {
                                        setSenha(e.target.value);
                                        setErrors(prev => ({ ...prev, senha: undefined }));
                                        setSubmitError("");
                                    }}
                                    className="form-input password-input"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="password-toggle-btn"
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {errors.senha && <span className="error-text" role="alert">{errors.senha}</span>}
                        </div>

                        {/* Opções adicionais */}
                        <div className="form-options">
                            <label className="checkbox-container" style={{ fontSize: `${fontSize * 0.875}px` }}>
                                <input type="checkbox" className="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                                <span className="checkbox-text">Lembrar de mim</span>
                            </label>
                            <a onClick={onSwitchToPassword} className="forgot-password-link" style={{ fontSize: `${fontSize * 0.875}px` }}>
                                Esqueceu sua senha?
                            </a>
                        </div>

                        {/* Botão de Login */}
                        <button type="submit" className="login-btn" style={{ fontSize: `${fontSize * 1}px` }} disabled={isSubmitting}>
                            {isSubmitting ? (<><span className="spinner" aria-hidden="true"></span> Entrando...</>) : 'Login'}
                        </button>
                        {/* mensagem de submissão (erro) */}
                        {submitError && <div className="error-text" role="alert" aria-live="assertive" style={{ marginTop: 8 }}>{submitError}</div>}

                        {/* Link para cadastro */}
                        <div className="register-link-container" style={{ fontSize: `${fontSize * 0.875}px` }}>
                            <span className="register-text">Não tem conta? </span>
                            <button
                                type="button"
                                onClick={onSwitchToRegister}
                                className="register-link"
                            >
                                Faça o cadastro aqui
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login


