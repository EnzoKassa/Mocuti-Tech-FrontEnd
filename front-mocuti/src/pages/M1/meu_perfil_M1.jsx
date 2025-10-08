import React, { useEffect, useState } from "react";
import PerfilUsuario from "../../components/PerfilUsuario";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";

const MeuPerfilM1 = () => {
  return  (
    <div className="meu-perfil-page">
      {/* Cabeçalho principal */}
      <NavLateral/>
      <div className="MainContent-M1 ">
      <PerfilUsuario/>
      </div>
    </div>
  );
};

export default MeuPerfilM1;