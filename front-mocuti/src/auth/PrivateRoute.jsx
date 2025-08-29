import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();

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
