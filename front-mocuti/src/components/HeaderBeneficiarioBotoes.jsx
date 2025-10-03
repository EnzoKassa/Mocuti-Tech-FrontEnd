import "../styles/HeaderBeneficiarioBotoes.css";
import logo from "../assets/images/image (1).svg";

export default function HeaderBeneficiarioBotoes( {botoes}) {
    return (
<div className="nav-links">
            <div className="nav-box-botoes">
              <div className="nav-box-logo">
                <img src={logo} alt="" />
              </div>
              <div className="nav-links-botoes">

                <div className="nav-links-botoes">
                  {botoes.map((botao, idx) => (
                        <a
                            key={idx}
                            href={botao.href}
                            className={`botoes-nav ${botao.className || ""}`}
                        >
                            {botao.label}
                        </a>
                    ))}
                </div>

              </div>
            </div>
          </div>
    );
}