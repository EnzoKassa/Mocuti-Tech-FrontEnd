import "../css/NavLateral.css";
import { BotaoNav } from "./BotaoNav";
// {importe as imagens}
import Person from "../assets/Person.svg"
import Calendario from '../assets/calendario.svg'
import ListaUser from "../assets/icone Lista Usuarios.svg"
import MeuPerfil from "../assets/meuPerfil.svg"
import VisaoGeral from "../assets/visaoGeral.svg"
import Sair from "../assets/sair.svg";

export function NavLateral() {
  return (
    <div className="NavLateral">
      {/* Box usuário */}
      <div className="boxUsuario">
        <img src={Person} alt="Usuário" />
        <div id="nomeUser">Ana Rita Eduardo</div>
      </div>

      {/* Links de navegação */}
      <div className="boxLinksNav">
        <BotaoNav texto="Eventos" imgLink={Calendario} />
        <BotaoNav texto="Lista de Usuários" imgLink={ListaUser} />
        <BotaoNav texto="Meu Perfil" imgLink={MeuPerfil} />
        <BotaoNav texto="Visão Geral" imgLink={VisaoGeral} />
        
      </div>

      {/* Botão sair */}
      <div className="BoxBtnSair">
        <BotaoNav texto="Sair" imgLink={Sair} />
      </div>
    </div>
  );
}
