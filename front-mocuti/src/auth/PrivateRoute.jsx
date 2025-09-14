import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // enquanto o AuthProvider carrega o user do storage, mostra algo ou nada
    return <div>Carregando...</div>;
  }

  if (!user) {
    // Usuário não logado
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.tipoCargo)) {
    // Usuário não tem permissão
    return <Navigate to="/nao-autorizado" replace />;
  }

  return children;
};

export default PrivateRoute;
