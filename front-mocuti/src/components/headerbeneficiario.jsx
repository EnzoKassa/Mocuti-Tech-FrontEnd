import location from '../assets/images/location.svg';
import telefone from '../assets/images/telefone.png';
import insta from '../assets/images/Instagram.svg';
import zap from '../assets/images/Wattsapp.svg';
import face from '../assets/images/Facebook.svg';
import email from '../assets/images/Email.svg';
import "../styles/HeaderBeneficiario.css";

export default function HeaderBeneficiario() {
    return (
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

                    <a href="mailto:mocuti@gmail.com">
                        <img src={email} alt="Email" />
                    </a>
                </div>

            </div>
        </div>
    );
}

