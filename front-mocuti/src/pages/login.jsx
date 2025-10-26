import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css'

const Login = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [fontSize, setFontSize] = useState(18) // fontSize inicial maior
    const {login} = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();

    const [rememberMe, setRememberMe] = useState(false);

    const onSwitchToRegister = () => {
        navigate('/Cadastro')
    }
       const onSwitchToPassword = () => {
        navigate('/forgot-password')
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, senha, rememberMe);

        // redireciona baseado no cargo
        const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
        if (user?.tipoCargo === "Administrador") navigate("/admin/eventos");
        else if (user?.tipoCargo === "Moderador") navigate("/moderador/eventos");
        else if (user?.tipoCargo === "Usuário") navigate("/usuario/eventos");
    };

    const increaseFontSize = () => {
        setFontSize(prev => Math.min(prev + 2, 28)) // limite aumentado para títulos grandes
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
                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label" style={{ fontSize: `${fontSize * 0.875}px` }}>
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        {/* Senha */}
                        <div className="form-group">
                            <label htmlFor="senha" className="form-label" style={{ fontSize: `${fontSize * 0.875}px` }}>
                                Senha
                            </label>
                            <div className="password-input-container">
                                <input
                                    id="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="form-input password-input"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="password-toggle-btn"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
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
                        <button type="submit" className="login-btn" style={{ fontSize: `${fontSize * 1}px` }}>
                            Login
                        </button>

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
