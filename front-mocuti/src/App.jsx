
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthProvider from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import HomeRedirect from "./auth/HomeRedirect";

// Rotas públicas
import Home from "./pages/landingPage";
import Cadastro from "./pages/cadastro";
import Login from "./pages/login";

// Rotas de Usuário
import Eventos_B from "./pages/Beneficiario/eventos_B";
import MeuPerfil_B from "./pages/Beneficiario/meu_perfil_B";
import MeusEventos_B from "./pages/Beneficiario/meus_eventos_B";

// Rotas de Moderador
import Eventos_M2 from "./pages/M2/eventos_M2";
import Convites_M2 from "./pages/M2/convites_M2";
import Feedbacks_M2 from "./pages/M2/feedbacks_M2";
import MeuPerfil_M2 from "./pages/M2/meu_perfil_M2";

// Rotas de Administrador
import Eventos_M1 from "./pages/M1/eventos_M1";
import GeralM1 from "./pages/M1/GeralM1";
import ListaUser_M1 from "./pages/M1/lista_user_M1";
import Feedbacks_M1 from "./pages/M1/feedbacks_M1";
import MeuPerfil_M1 from "./pages/M1/meu_perfil_M1";

function App() {
  return (
    <AuthProvider>
      <ResetPasswordProvider>
        {" "}
        {/* <<< <--- ÚNICO provider para o fluxo */}
        <Router>
          <Routes>
            {/* Redirecionamento inicial */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Rotas públicas */}
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Fluxo de recuperação */}
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/reset-password"
              element={
                <ResetRoute requiredStep={1}>
                  <ResetPassword />
                </ResetRoute>
              }
            />

            <Route
              path="/reset-success"
              element={
                <ResetRoute requiredStep={2}>
                  <ResetSuccess />
                </ResetRoute>
              }
            />

            {/* Rotas de Usuário */}
            <Route
              path="/usuario/eventos"
              element={
                <PrivateRoute roles={["Usuário"]}>
                  <Eventos_B />
                </PrivateRoute>
              }
            />
            <Route
              path="/usuario/perfil"
              element={
                <PrivateRoute roles={["Usuário"]}>
                  <MeuPerfil_B />
                </PrivateRoute>
              }
            />
            <Route
              path="/usuario/meus-eventos"
              element={
                <PrivateRoute roles={["Usuário"]}>
                  <MeusEventos_B />
                </PrivateRoute>
              }
            />

            {/* Rotas de Moderador */}
            <Route
              path="/moderador/eventos"
              element={
                <PrivateRoute roles={["Moderador"]}>
                  <Eventos_M2 />
                </PrivateRoute>
              }
            />
            <Route
              path="/moderador/convites"
              element={
                <PrivateRoute roles={["Moderador"]}>
                  <Convites_M2 />
                </PrivateRoute>
              }
            />
            <Route
              path="/moderador/feedbacks"
              element={
                <PrivateRoute roles={["Moderador"]}>
                  <Feedbacks_M2 />
                </PrivateRoute>
              }
            />
            <Route
              path="/moderador/perfil"
              element={
                <PrivateRoute roles={["Moderador"]}>
                  <MeuPerfil_M2 />
                </PrivateRoute>
              }
            />

          {/* Rotas de Administrador */}
          <Route
            path="/admin/eventos"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <Eventos_M1 />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/lista-usuarios"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <ListaUser_M1 />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/feedbacks"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <Feedbacks_M1 />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/perfil"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <MeuPerfil_M1 />
              </PrivateRoute>
            }
          />

            {/* Acesso negado */}
            <Route path="/nao-autorizado" element={<h1>Acesso negado ❌</h1>} />
          </Routes>
        </Router>
      </ResetPasswordProvider>
    </AuthProvider>

    
  );
}

export default App;
