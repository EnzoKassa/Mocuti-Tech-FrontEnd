import React, { useEffect, useState } from "react";
import PerfilUsuario from "../../components/PerfilUsuario";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";
// Imagens usadas no menu
import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import convite from "../../assets/images/convitesLogo.svg";

  /**
 * ENDPOINTS
 * - http://localhost:8080/Usuario/editar/:idUsuario
 * - http://localhost:8080/feedback/
 */

const MeuPerfilM2 = () => {
  const rotasPersonalizadas = [
    { texto: "Eventos", img: Calendario, rota: "/moderador/eventos" },
    { texto: "Convites", img: convite, rota: "/moderador/convites" },
    { texto: "Meu Perfil", img: MeuPerfil, rota: "/moderador/perfil" },
    { texto: "Feedbacks", img: feedback, rota: "/moderador/feedbacks" },
  ];

  return  (
    <div className="meu-perfil-page2">
      {/* Cabeçalho principal */}
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />
      <div className="MainContent-M1">
      <PerfilUsuario/>
      </div>
    </div>
  );
};

export default MeuPerfilM2;

