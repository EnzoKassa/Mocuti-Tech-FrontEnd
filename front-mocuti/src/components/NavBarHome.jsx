import { useNavigate } from "react-router-dom";
import telefone from "../assets/images/telefone.svg";
import zap from "../assets/images/Wattsapp.svg";
import face from "../assets/images/Facebook.svg";
import email from "../assets/images/Email.svg";
import insta from "../assets/images/Instagram.svg";
import logo from "../assets/images/image (1).svg";
import location from "../assets/images/location.svg";
import "../styles/bottom.css";

export function NavHome({ texto, imgLink, onClick }) {
    const navigate = useNavigate();
    return (
        <div className="nav-home">
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

                    <a href="mailto:mocuti@gmail.com" target="_blank" rel="noopener noreferrer">
                        <img src={email} alt="Email" />
                    </a>
                </div>

            </div>
            <div className="nav-links-home">
                <div className="nav-box-botoes">
                    <div className="nav-box-logo">
                        <img src={logo} alt="" />
                    </div>
                    <div className="nav-links-botoes-home">
                        <a href="#inicio" className="botoes-nav btn-inicio">Início</a>
                        <a href="#sobre" className="botoes-nav btn-sobre">Sobre Nós</a>
                        <a href="#linha-do-tempo" className="botoes-nav btn-linha">Linha do Tempo</a>
                        <a href="#eventos" className="botoes-nav btn-eventos">Eventos</a>
                    </div>


                    <div className="nav-box-cadastro">
                        <a onClick={() => navigate('../cadastro')} className="botoes-cadastro-nav">Criar Conta</a>
                        <a onClick={() => navigate('../login')} className="botoes-cadastro-nav-blue">Entrar</a>
                    </div>
                </div>
            </div>
        </div>
    );
}