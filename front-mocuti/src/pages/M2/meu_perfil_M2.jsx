import React, { useEffect, useState } from "react";
import PerfilUsuario from "../../components/PerfilUsuario";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";

  /**
 * ENDPOINTS
 * - http://localhost:8080/Usuario/editar/:idUsuario
 * - http://localhost:8080/feedback/
 */

const MeuPerfilM2 = () => {
  return  (
    <div className="meu-perfil-page">
      {/* Cabeçalho principal */}
      <NavLateral/>
      <div className="MainContent-M2 ">
      <PerfilUsuario/>
      </div>
    </div>
  );
};

export default MeuPerfilM2;