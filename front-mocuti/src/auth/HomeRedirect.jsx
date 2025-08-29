import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const HomeRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.tipoCargo) {
        case "Administrador":
          navigate("/admin/eventos");
          break;
        case "Moderador":
          navigate("/moderador/eventos");
          break;
        case "Usuário":
          navigate("/usuario/eventos");
          break;
        default:
          navigate("/login");
      }
    }
  }, [user, navigate]);

  // Se não tiver usuário logado, deixa na home
  return <h1>Bem-vindo! Faça login para continuar.</h1>;
};

export default HomeRedirect;
