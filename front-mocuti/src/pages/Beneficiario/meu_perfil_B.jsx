import { useEffect, useState, useContext } from "react";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import PerfilUsuario from "../../components/PerfilUsuario";
import "../../styles/meu_Perfil_B.css";
import { useNavigate } from "react-router-dom";

const MeuPerfilBeneficiario = () => {

  const navigate = useNavigate();

  const botoesNav = [
    { onClick: () => navigate("/usuario/eventos"), label: "Eventos", className: "btn-inicio" },
    { onClick: () => navigate("/usuario/perfil"), label: "Meu Perfil", className: "btn-sobre" },
    { onClick: () => navigate("/usuario/meus-eventos"), label: "Meus Eventos", className: "btn-linha" },
    { onClick: () => navigate("/usuario/feedback"), label: "Feedback", className: "btn-comentarios" }
  ];

  const [fontSize, setFontSize] = useState(100);

  const aumentarFonte = () => {
    const novo = Math.min(fontSize + 10, 200);
    setFontSize(novo);
    document.documentElement.style.fontSize = novo + "%";
  };

  const diminuirFonte = () => {
    const novo = Math.max(fontSize - 10, 50);
    setFontSize(novo);
    document.documentElement.style.fontSize = novo + "%";
  };

  return (
    <div className="meu-perfil-page">

      {/* BOTÕES ACESSIBILIDADE */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <button
          onClick={aumentarFonte}
          className="w-12 h-12 rounded-md bg-[#001F4D] text-white text-[18px] font-bold shadow-lg hover:bg-[#012d73] transition"
        >
          A+
        </button>

        <button
          onClick={diminuirFonte}
          className="w-12 h-12 rounded-md bg-[#001F4D] text-white text-[18px] font-bold shadow-lg hover:bg-[#012d73] transition"
        >
          A-
        </button>
      </div>
      <HeaderBeneficiarioBotoes botoes={botoesNav} />
      <PerfilUsuario />
    </div>
  );
};

export default MeuPerfilBeneficiario;

