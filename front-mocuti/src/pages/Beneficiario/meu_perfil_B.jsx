import React from "react";
import Swal from "sweetalert2";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import PerfilUsuario from "../../components/PerfilUsuario";
import "../../styles/meu_Perfil_B.css";

/**
 * ENDPOINTS
 * - http://localhost:8080/Usuario/editar/:idUsuario
 */

// Botões de navegação (se forem usados nos headers)
const botoesNav = [
  { href: "#Eventos", label: "Eventos", className: "btn-inicio" },
  { href: "#MeuPerfil", label: "Meu Perfil", className: "btn-sobre" },
  { href: "#MeusEventos", label: "Meus Eventos", className: "btn-linha" }
];

const MeuPerfilBeneficiario = () => {
  // Função para lidar com o clique no botão "Editar"

  

  return (
    <div className="meu-perfil-page">
      {/* Cabeçalho principal */}
      <HeaderBeneficiario />

      {/* Botões de navegação */}
      <HeaderBeneficiarioBotoes botoes={botoesNav} />

      {/* Formulário de detalhes do usuário */}
        <PerfilUsuario />
    </div>
  );
};

export default MeuPerfilBeneficiario;