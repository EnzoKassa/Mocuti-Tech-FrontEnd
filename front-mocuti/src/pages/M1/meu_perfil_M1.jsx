import React, { useEffect, useState } from "react";
import PerfilUsuario from "../../components/PerfilUsuario";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";
// Imagens usadas no menu
import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import VisaoGeral from "../../assets/images/VisaoGeral.svg";
import listaUsuarios from "../../assets/images/listausuario.svg";

const MeuPerfilM1 = () => {
  const rotasPersonalizadas = [
    { texto: "Eventos", img: Calendario, rota: "/admin/eventos" },
    { texto: "Lista de Usuários", img: listaUsuarios, rota: "/admin/lista-usuarios" },
    { texto: "Feedbacks", img: feedback, rota: "/admin/feedbacks" },
    { texto: "Meu Perfil", img: MeuPerfil, rota: "/admin/perfil" },
    { texto: "Visão Geral", img: VisaoGeral, rota: "/admin/Geral" },
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

