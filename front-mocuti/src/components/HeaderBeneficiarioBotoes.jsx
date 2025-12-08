import "../styles/HeaderBeneficiarioBotoes.css";
import logo from "../assets/images/image (1).svg";
import menu from "../assets/images/menu.png";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import location from '../assets/images/location.svg';
import telefone from '../assets/images/telefone.png';
import insta from '../assets/images/Instagram.svg';
import zap from '../assets/images/Wattsapp.svg';
import face from '../assets/images/Facebook.svg';
import email from '../assets/images/Email.svg';

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
    <>
      {/* Menu Desktop */}
      <div className="caixa-da-home">
        <div style={{ position: 'relative' }} className="nav-home">
          <div className="nav-box">
            <div
              className="nav-endereco"
              onClick={() => window.open("https://www.google.com/maps/place/Av+dos+Metalurgicos,+1081", "_blank")}
              style={{ cursor: "pointer" }}
            >
              <img src={location} alt="Localização" />
              Av dos Metalúrgicos, 1081
            </div>
            <div className="nav-contato">
              <img src={telefone} alt="Telefone" /> 11 98971-1297

              <a href="https://www.instagram.com/anarita.producoes" target="_blank" rel="noopener noreferrer">
                <img src={insta} alt="Instagram" />
              </a>

              <a href="https://wa.me/5511989711297" target="_blank" rel="noopener noreferrer">
                <img src={zap} alt="WhatsApp" />
              </a>

              <a href="https://www.facebook.com/share/1CUjDLGFhT/" target="_blank" rel="noopener noreferrer">
                <img src={face} alt="Facebook" />
              </a>

              <a href="mailto:sitemocuti@gmail.com">
                <img src={email} alt="Email" />
              </a>
            </div>

          </div>
        </div>
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
      </div>

      {/* Menu Mobile */}
      <div className="nav-home-mobile">
        <div className="nav-mobile-header">
          <img src={logo} alt="Logo" />
          <button className="menu-toggle"> <img className="img-menu-mobile" src={menu} alt="" /></button>
        </div>
        <div className="nav-mobile-botoes">
          {botoesComLogout.map((botao, idx) => (
            <button
              key={idx}
              className={`botoes-nav ${botao.className || ""}`}
              onClick={botao.onClick}
            >
              {botao.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}