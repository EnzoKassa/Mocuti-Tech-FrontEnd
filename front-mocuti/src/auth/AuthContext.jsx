import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

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

  const updateUser = (newUserData) => {
    const updatedUser = {
      id: newUserData.idUsuario,
      nomeCompleto: newUserData.nomeCompleto,
      tipoCargo: newUserData.cargo?.tipoCargo || newUserData.tipoCargo,
      email: newUserData.email,
    };
  
    setUser(updatedUser);
  
    if (localStorage.getItem("user")) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  
    if (sessionStorage.getItem("user")) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  
    console.log("🔄 Storage atualizado:", updatedUser);
  };  

  const login = async (email, senha, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.patch("/usuarios/login", { email, senha });
      const data = res.data;

      console.log("Login bem-sucedido:", data);

      const userData = {
        id: data.idUsuario,
        nomeCompleto: data.nomeCompleto,
        tipoCargo: data.cargo.tipoCargo,
        email: data.email,
      };

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

      return userData;
    } catch (err) {
      setError(err?.message || "Erro no login");
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
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
