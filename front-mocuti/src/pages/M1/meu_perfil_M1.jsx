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
  


  return  (
    <div className="meu-perfil-page2">

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
      {/* Cabeçalho principal */}
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />
      <div className="MainContent-M1">
      <PerfilUsuario/>
      </div>
    </div>
  );
};

export default MeuPerfilM1;

