import "../styles/HeaderBeneficiarioBotoes.css";
import logo from "../assets/images/image (1).svg";

export default function HeaderBeneficiarioBotoes({ botoes }) {
  return (
    <div className="nav-links">
      <div className="nav-box-botoes">
        <div className="nav-box-logo">
          <img src={logo} alt="" />
        </div>
        <div className="nav-links-botoes">
          <nav className="nav-links-botoes">
              {botoes.map((botao, idx) => (
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

