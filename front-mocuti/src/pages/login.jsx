import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login, error, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, senha);

        // redireciona baseado no cargo
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.tipoCargo === "Administrador") navigate("/admin/eventos");
        else if (user?.tipoCargo === "Moderador") navigate("/moderador/eventos");
        else if (user?.tipoCargo === "Usuário") navigate("/usuario/eventos");
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>Carregando...</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    Entrar
                </button>
            </form>
        </div>
    );
};

export default Login;
