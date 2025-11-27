import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/NavLateral.css";
import "../styles/TelaComNavLateral.css";
import { BotaoNav } from "./BotaoNav";
import Swal from "sweetalert2";

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

  async function confirmarLogout() {
    const result = await Swal.fire({
      title: "Deseja sair?",
      text: "Ao sair, você precisará fazer login novamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "#FFBB00",
      cancelButtonColor: "#45AA48",
    });

    if (result.isConfirmed) {
      logout?.();
      navigate("/login");

      Swal.fire({
        icon: "success",
        title: "Sessão encerrada",
        text: "Você saiu com sucesso!",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

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
        <BotaoNav texto="Sair" imgLink={Sair} onClick={confirmarLogout} />
      </div>
    </div>
  );
}

