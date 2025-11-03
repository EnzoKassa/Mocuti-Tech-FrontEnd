import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext(); // <-- export const
export const useAuth = () => useContext(AuthContext); // <-- hook

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email, senha, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:8080/usuarios/login", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        // tenta extrair mensagem do servidor (json ou texto)
        let msg = "Credenciais inválidas";
        try {
          const text = await res.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              msg = json.message || json.error || text;
            } catch {
              msg = text;
            }
          }
        } catch {
          /* fallback */
        }
        throw new Error(msg);
      }
      const data = await res.json();

      // setUser({ id: data.idUsuario, tipoCargo: data.cargo.tipoCargo });
      // localStorage.setItem("user", JSON.stringify({ id: data.idUsuario, tipoCargo: data.cargo.tipoCargo }));

      // const userData = { id: data.idUsuario, tipoCargo: data.cargo.tipoCargo };
      const userData = {
        id: data.idUsuario,
        nomeCompleto: data.nomeCompleto,
        tipoCargo: data.cargo.tipoCargo,
        email: data.email,
      };

      // atualiza estado uma vez
      setUser(userData);

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("idUsuario", userData.id);
        localStorage.setItem("nomeCompleto", userData.nomeCompleto);
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("idUsuario", userData.id);
        sessionStorage.setItem("nomeCompleto", userData.nomeCompleto);
        localStorage.removeItem("user");
      }
      // retorna dados para o chamador confirmar sucesso
      return userData;
    } catch (err) {
      setError(err?.message || "Erro no login");
      // relança para o caller (ex.: página de login) poder tratar
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; // <-- export default


