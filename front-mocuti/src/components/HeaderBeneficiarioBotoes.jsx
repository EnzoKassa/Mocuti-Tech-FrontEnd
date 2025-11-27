import "../styles/HeaderBeneficiarioBotoes.css";
import logo from "../assets/images/image (1).svg";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function HeaderBeneficiarioBotoes({ botoes }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const confirmarLogout = async () => {
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
  };

  const botoesComLogout = [
    ...botoes,
    {
      label: "Sair",
      onClick: confirmarLogout,
      className: "btn-sair",
    },
  ];

  return (
    <div className="nav-links">
      <div className="nav-box-botoes">
        <div className="nav-box-logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="nav-links-botoes">
          <nav className="nav-links-botoes">
            {botoesComLogout.map((botao, idx) => (
              <button
                key={idx}
                className={`botoes-nav ${botao.className || ""}`}
                onClick={botao.onClick}
              >
                {botao.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
