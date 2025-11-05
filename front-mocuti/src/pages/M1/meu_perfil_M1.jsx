import React, { useEffect, useState } from "react";
import PerfilUsuario from "../../components/PerfilUsuario";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";
// Imagens usadas no menu
import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import Visao from "../../assets/images/VisaoGeral.svg";
import Lista from "../../assets/images/listausuario.svg";

const MeuPerfilM1 = () => {
  const rotasPersonalizadas = [
    { texto: "Visão Geral", rota: "/admin/geral", img: Visao },
    { texto: "Eventos", rota: "/admin/eventos", img: Calendario },
    { texto: "Usuários", rota: "/admin/lista-usuarios", img: Lista },
    { texto: "Feedbacks", rota: "/admin/feedbacks", img: feedback },
    { texto: "Meu Perfil", rota: "/admin/perfil", img: MeuPerfil }
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

export default MeuPerfilM1;

