import React from "react";
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

  return (
    <div className="meu-perfil-page">
      <HeaderBeneficiarioBotoes botoes={botoesNav} />
      <PerfilUsuario />
    </div>
  );
};

export default MeuPerfilBeneficiario;

