import "../styles/HeaderBeneficiarioBotoes.css";
import logo from "../assets/images/image (1).svg";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HeaderBeneficiarioBotoes({ botoes }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Adiciona botão "Sair" no final da lista
  const botoesComLogout = [
    ...botoes,
    {
      label: "Sair",
      onClick: () => {
        logout?.();
        navigate("/login");
      },
      className: "btn-sair", // opcional para estilização
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

