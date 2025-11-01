import location from '../assets/images/location.svg';
import telefone from '../assets/images/telefone.png';
import insta from '../assets/images/Instagram.svg';
import zap from '../assets/images/Wattsapp.svg';
import face from '../assets/images/Facebook.svg';
import email from '../assets/images/Email.svg';
import "../styles/HeaderBeneficiario.css";

export default function HeaderBeneficiario() {
    return (
        <div style={{position: 'relative'}} className="nav-home">
            <div className="nav-box">
                <div className="nav-endereco">
                    <img src={location} alt="Localização" />
                    Av dos Metalurgicos, 1081
                </div>
                <div className="nav-contato">
                    <img src={telefone} alt="Telefone" />
                    11 980711297
                    <img src={insta} alt="Instagram" />
                    <img src={zap} alt="WhatsApp" />
                    <img src={face} alt="Facebook" />
                    <img src={email} alt="E-mail" />
                </div>

            </div>
        </div>
    );
}

