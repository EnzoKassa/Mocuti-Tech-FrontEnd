import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/NavLateral.css";
import "../styles/TelaComNavLateral.css";
import { BotaoNav } from "./BotaoNav";

// Imagens
import Person from "../assets/images/Person.svg";
import Sair from "../assets/images/sair.svg";

export function NavLateral({ rotasPersonalizadas }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const nomeUsuario =
    user?.nomeCompleto ||
    localStorage.getItem("nomeCompleto") ||
    sessionStorage.getItem("nomeCompleto") ||
    "Usuário";

  return (
    <div className="NavLateral">
      {/* Box usuário */}
      <div className="boxUsuario">
        <img src={Person} alt="Usuário" />
        <div id="nomeUser">{nomeUsuario}</div>
      </div>

      {/* Links de navegação */}
      <div className="boxLinksNav">
        {rotasPersonalizadas.map((btn, idx) => (
          <BotaoNav
            key={idx}
            texto={btn.texto}
            imgLink={btn.img}
            onClick={() => navigate(btn.rota)}
          />
        ))}
      </div>

      {/* Botão sair */}
      <div className="BoxBtnSair">
        <BotaoNav
          texto="Sair"
          imgLink={Sair}
          onClick={() => {
            logout?.();
            navigate("/login");
          }}
        />
      </div>
    </div>
  );
}

