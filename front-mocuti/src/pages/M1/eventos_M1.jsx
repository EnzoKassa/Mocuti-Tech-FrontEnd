import { useEffect, useState } from "react";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import FiltroBeneficiario from "../../components/FiltroBeneficiario";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import "../../styles/EventosBeneficiario.css";

const INITIAL_FILTERS = {
       nome: "",
       dataInicio: "",
       dataFim: "",
       categoriaId: "",
       statusEventoId: ""
};

export default function EventosBeneficiario() {
     const [eventos, setEventos] = useState([]);
     const [categorias, setCategorias] = useState([]);
     const [statusList, setStatusList] = useState([]);
     const [filtrosUI, setFiltrosUI] = useState(INITIAL_FILTERS);

     useEffect(() => {
       fetch("http://localhost:8080/categorias")
             .then(res => res.json())
             .then(setCategorias)
             .catch(err => console.error("Erro ao buscar categorias:", err));

       fetch("http://localhost:8080/status-eventos")
             .then(res => res.json())
             .then(setStatusList)
             .catch(err => console.error("Erro ao buscar status:", err));
     }, []);

     const buscarEventos = async () => {
       try {
             const filtrosAtuais = filtrosUI;
             let url = "http://localhost:8080/eventos/por-eventos";
             const params = new URLSearchParams();

             if (filtrosAtuais.nome) params.append("nome", filtrosAtuais.nome);
             if (filtrosAtuais.dataInicio) params.append("dataInicio", filtrosAtuais.dataInicio);
             if (filtrosAtuais.dataFim) params.append("dataFim", filtrosAtuais.dataFim);

             const filtrosAdicionais = params.toString();

             if (filtrosAtuais.categoriaId && filtrosAtuais.statusEventoId === "") {
              url = `http://localhost:8080/eventos/por-categoria?categoriaId=${filtrosAtuais.categoriaId}`;
              if (filtrosAdicionais) url += "&" + filtrosAdicionais;
             } else if (filtrosAtuais.statusEventoId && filtrosAtuais.categoriaId === "") {
              url = `http://localhost:8080/eventos/status?statusEventoId=${filtrosAtuais.statusEventoId}`;
              if (filtrosAdicionais) url += "&" + filtrosAdicionais;
             } else if (filtrosAdicionais) {
              url += "?" + filtrosAdicionais;
             }

             const response = await fetch(url);
             if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
             let data = await response.json();

             if (filtrosAtuais.categoriaId && filtrosAtuais.statusEventoId) {
              data = data.filter(ev =>
                  ev.categoria?.idCategoria == filtrosAtuais.categoriaId &&
                  ev.statusEvento?.idStatusEvento == filtrosAtuais.statusEventoId
              );
             }
           
           const dataComDadosCompletos = data.map(evento => {
               const categoriaNome = evento.categoria?.nome || 
                   categorias.find(c => c.idCategoria == evento.categoria?.idCategoria)?.nome || '';
                   
               const statusSituacao = evento.statusEvento?.situacao ||
                   statusList.find(s => s.idStatusEvento == evento.statusEvento?.idStatusEvento)?.situacao || '';
                   
               return {
                   ...evento,
                   categoriaNome: categoriaNome,
                   statusSituacao: statusSituacao
               };
           });


             const eventosComImg = await Promise.all(
              dataComDadosCompletos.map(async (evento) => {
                  let eventoCompletado = { ...evento, imagemUrl: null }; 
                  try {
                       if (!evento.idEvento) return eventoCompletado;
                       const imgResponse = await fetch(`http://localhost:8080/eventos/foto/${evento.idEvento}`);
                       if (imgResponse.ok) {
                        const blob = await imgResponse.blob();
                        eventoCompletado.imagemUrl = URL.createObjectURL(blob);
                       }
                  } catch (errorImg) {
                        console.warn(`Erro ao buscar foto para evento ${evento.idEvento}:`, errorImg);
                  }
                  return eventoCompletado;
              })
             );

             setEventos(eventosComImg);
             
             setFiltrosUI(INITIAL_FILTERS); 
       } catch (error) {
             console.error("Erro ao buscar eventos:", error);
             setEventos([]);
       }
     };

     useEffect(() => {
       buscarEventos();
     }, []);

     const handleFiltroChange = (field, value) => {
       setFiltrosUI(prev => ({ ...prev, [field]: value }));
     };

     const handlePesquisar = () => {
       buscarEventos();
     };

     return (
       <>
             <NavLateral/>
             <FiltroBeneficiario
              filtros={filtrosUI}
              onFiltroChange={handleFiltroChange}
              categorias={categorias}
              statusList={statusList}
              onPesquisar={handlePesquisar}
             />
             <EspacoEventosBeneficiario eventos={eventos} />
       </>
     );
}