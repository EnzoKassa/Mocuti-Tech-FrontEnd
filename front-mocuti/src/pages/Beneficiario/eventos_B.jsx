import { useEffect, useState } from "react";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import Filtrobeneficiario from "../../components/FiltroBeneficiario";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import "../../styles/EventosBeneficiario.css";


const botoesNav = [
  { href: "#Eventos", label: "Eventos", className: "btn-inicio" },
  { href: "#MeuPerfil", label: "Meu Perfil", className: "btn-sobre" },
  { href: "#MeusEventos", label: "Meus Eventos", className: "btn-linha" }
];

export default function EventosBeneficiario() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [filtros, setFiltros] = useState({
    nome: "",
    dataInicio: "",
    dataFim: "",
    categoriaId: "",
    statusEventoId: ""
  });

  useEffect(() => {
    fetch("http://localhost:8080/categorias")
      .then(res => res.json())
      .then(setCategorias);

    fetch("http://localhost:8080/status-eventos")
      .then(res => res.json())
      .then(setStatusList);
  }, []);


  const buscarEventos = async () => {
    const params = new URLSearchParams();
    if (filtros.nome) params.append("nome", filtros.nome);
    if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.append("dataFim", filtros.dataFim);
    if (filtros.categoriaId) params.append("categoriaId", filtros.categoriaId);
    if (filtros.statusEventoId) params.append("statusEventoId", filtros.statusEventoId);

    let url = "http://localhost:8080/eventos/por-eventos";
    if (params.toString()) url += "?" + params.toString();

    const res = await fetch(url);
    const data = await res.json();
    setEventos(data);
  };

  useEffect(() => {
    buscarEventos();
  }, []);

  const handleFiltroChange = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => {
    buscarEventos();
  };

  return (
    <>
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />
      <Filtrobeneficiario
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        categorias={categorias}
        statusList={statusList}
        onPesquisar={handlePesquisar}
      />
      <EspacoEventosBeneficiario eventos={eventos} mostrarParticipar={true} />
    </>
  );
}