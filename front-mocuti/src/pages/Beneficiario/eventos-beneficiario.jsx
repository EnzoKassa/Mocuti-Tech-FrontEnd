import HeaderBeneficiario from "../../components/headerbeneficiario";
import HeaderBeneficiarioBotoes from "../../components/headerbotoesbeneficiario";
import Filtrobeneficiario from "../../components/filtrobeneficiario";
import EspacoEventosBeneficiario from "../../components/espacoeventosbeneficiario";
import "../../styles/eventos-beneficiario.css";


const botoesNav = [
  { href: "#Eventos", label: "Eventos", className: "btn-inicio" },
  { href: "#MeuPerfil", label: "Meu Perfil", className: "btn-sobre" },
  { href: "#MeusEventos", label: "Meus Eventos", className: "btn-linha" }
];

export default function EventosBeneficiario() {
  return (
    <>
    <HeaderBeneficiario/>
    <HeaderBeneficiarioBotoes botoes={botoesNav}/>
    <Filtrobeneficiario/>
    <EspacoEventosBeneficiario ImagemEvento/>
    </>
  )
}