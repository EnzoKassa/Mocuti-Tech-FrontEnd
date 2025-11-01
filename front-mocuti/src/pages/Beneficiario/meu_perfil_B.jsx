import React from "react";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import PerfilUsuario from "../../components/PerfilUsuario";
import "../../styles/meu_Perfil_B.css";

/**
 * ENDPOINTS
 * - http://localhost:8080/usuarios/editar/:idUsuario
 */

const botoesNav = [
  { href: "#Eventos", label: "Eventos", className: "btn-inicio" },
  { href: "#MeuPerfil", label: "Meu Perfil", className: "btn-sobre" },
  { href: "#MeusEventos", label: "Meus Eventos", className: "btn-linha" },
];

const MeuPerfilBeneficiario = () => {
  return (
    <div className="meu-perfil-page">
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />
      <PerfilUsuario />
    </div>
  );
};

export default MeuPerfilBeneficiario;

