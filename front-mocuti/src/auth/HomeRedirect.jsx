import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // espera carregar user
    if (!user) navigate("/home"); // não logado → landing page
    else {
      // redireciona baseado no cargo
      if (user.tipoCargo === "Administrador") navigate("/admin/eventos");
      else if (user.tipoCargo === "Moderador") navigate("/moderador/eventos");
      else if (user.tipoCargo === "Usuário") navigate("/usuario/eventos");
    }
  }, [user, loading, navigate]);

  return null;
};

export default HomeRedirect;


