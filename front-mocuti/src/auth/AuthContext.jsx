import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext(); // <-- export const

export const useAuth = () => useContext(AuthContext); // <-- hook

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:8080/usuarios/login", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) throw new Error("Credenciais inválidas");

      const data = await res.json();
      setUser({ id: data.idUsuario, tipoCargo: data.cargo.tipoCargo });
      localStorage.setItem("user", JSON.stringify({ id: data.idUsuario, tipoCargo: data.cargo.tipoCargo }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; // <-- export default
