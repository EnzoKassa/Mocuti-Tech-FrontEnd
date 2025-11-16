import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { AuthContext } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import FiltroBeneficiario from "../../components/FiltroBeneficiario";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import "../../styles/EventosBeneficiario.css";
import { useNavigate } from "react-router-dom";
import { fetchInscritosCargo2Count, BASE_URL, apiRefresh, triggerApiRefresh } from "../../api/api";


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
     const { user } = useContext(AuthContext);
     const userId = user?.idUsuario || user?.id || null;
     // helper local para headers de autenticação (pega token do local/session storage)
     const getAuthHeaders = () => {
       const token = localStorage.getItem("token") || sessionStorage.getItem("token") || null;
       return token ? { Authorization: `Bearer ${token}` } : {};
     };

  const navigate = useNavigate();
  
  const botoesNav = [
    { onClick: () => navigate("/usuario/eventos"), label: "Eventos", className: "btn-inicio" },
    { onClick: () => navigate("/usuario/perfil"), label: "Meu Perfil", className: "btn-sobre" },
    { onClick: () => navigate("/usuario/meus-eventos"), label: "Meus Eventos", className: "btn-linha" },
    { onClick: () => navigate("/usuario/feedback"), label: "Feedback", className: "btn-comentarios" }
  ];

     useEffect(() => {
       (async () => {
         try {
           const r1 = await fetch(`${BASE_URL}/categorias`, { method: "GET", headers: { Accept: "application/json", ...getAuthHeaders() }, mode: "cors" });
           if (r1.ok) {
             const cats = await r1.json().catch(() => []);
             if (Array.isArray(cats)) setCategorias(cats);
           }
         } catch (err) {
           console.error("Erro ao buscar categorias:", err);
         }
         try {
           const r2 = await fetch(`${BASE_URL}/status-eventos`, { method: "GET", headers: { Accept: "application/json", ...getAuthHeaders() }, mode: "cors" });
           if (r2.ok) {
             const sts = await r2.json().catch(() => []);
             if (Array.isArray(sts)) setStatusList(sts);
           }
         } catch (err) {
           console.error("Erro ao buscar status:", err);
         }
       })();
     }, []);

     const buscarEventos = async () => {
       try {
             const filtrosAtuais = filtrosUI;
             let endpoint = "/eventos/por-eventos";
             const params = new URLSearchParams();

             if (filtrosAtuais.nome) params.append("nome", filtrosAtuais.nome);
             if (filtrosAtuais.dataInicio) params.append("dataInicio", filtrosAtuais.dataInicio);
             if (filtrosAtuais.dataFim) params.append("dataFim", filtrosAtuais.dataFim);

             const filtrosAdicionais = params.toString();

             if (filtrosAtuais.categoriaId && filtrosAtuais.statusEventoId === "") {
               endpoint = `/eventos/por-categoria?categoriaId=${encodeURIComponent(filtrosAtuais.categoriaId)}`;
               if (filtrosAdicionais) endpoint += "&" + filtrosAdicionais;
             } else if (filtrosAtuais.statusEventoId && filtrosAtuais.categoriaId === "") {
               endpoint = `/eventos/status?statusEventoId=${encodeURIComponent(filtrosAtuais.statusEventoId)}`;
               if (filtrosAdicionais) endpoint += "&" + filtrosAdicionais;
             } else if (filtrosAdicionais) {
               endpoint += "?" + filtrosAdicionais;
             }

             const resp = await fetch(`${BASE_URL}${endpoint}`, { method: "GET", headers: { Accept: "application/json", ...getAuthHeaders() }, mode: "cors" });
             if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);
             let data = await resp.json();

             if (filtrosAtuais.categoriaId && filtrosAtuais.statusEventoId) {
               data = (Array.isArray(data) ? data : []).filter(ev =>
                 (ev.categoria?.idCategoria ?? ev.categoriaId ?? ev.categoria?.id) == filtrosAtuais.categoriaId &&
                 (ev.statusEvento?.idStatusEvento ?? ev.statusEventoId ?? ev.statusEvento?.id) == filtrosAtuais.statusEventoId
               );
             }

             const dataComDadosCompletos = (Array.isArray(data) ? data : []).map(evento => {
               const categoriaNome = evento.categoria?.nome ||
                 categorias.find(c => c.idCategoria == (evento.categoria?.idCategoria ?? evento.categoriaId ?? evento.categoria?.id))?.nome || '';

               const statusSituacao = evento.statusEvento?.situacao ||
                 statusList.find(s => s.idStatusEvento == (evento.statusEvento?.idStatusEvento ?? evento.statusEventoId ?? evento.statusEvento?.id))?.situacao || '';

               // formatar endereço: rua, numero - bairro
               const enderecoObj = evento.endereco || evento.enderecoEvento || evento.local || null;
               let enderecoFormatado = "Local não informado";
               if (enderecoObj && typeof enderecoObj === "object") {
                 const logradouro = enderecoObj.logradouro || enderecoObj.rua || enderecoObj.logradoro || "";
                 const numero = enderecoObj.numero ? `${enderecoObj.numero}` : "";
                 const bairro = enderecoObj.bairro ? `${enderecoObj.bairro}` : "";
                 const partes = [];
                 if (logradouro) partes.push(logradouro + (numero ? `, ${numero}` : ""));
                 if (bairro) partes.push(bairro);
                 if (partes.length) enderecoFormatado = partes.join(" - ");
               } else if (typeof enderecoObj === "string" && enderecoObj.trim()) {
                 enderecoFormatado = enderecoObj;
               }

               return {
                 ...evento,
                 categoriaNome: categoriaNome,
                 statusSituacao: statusSituacao,
                 // garante que o componente use uma string legível
                 local: enderecoFormatado,
                 enderecoFormatado
               };
             });

             const eventosComImg = await Promise.all(
              dataComDadosCompletos.map(async (evento) => {
                  let eventoCompletado = { ...evento, imagemUrl: null };
                  try {
                       if (!evento.idEvento && !evento.id && !evento.id_evento) return eventoCompletado;
                       const id = evento.idEvento || evento.id || evento.id_evento;
                       const imgResponse = await fetch(`${BASE_URL}/eventos/foto/${encodeURIComponent(id)}`);
                       if (imgResponse.ok) {
                        const blob = await imgResponse.blob();
                        eventoCompletado.imagemUrl = URL.createObjectURL(blob);
                       }
                  } catch (errorImg) {
                        console.warn(`Erro ao buscar foto para evento ${evento.idEvento || evento.id}:`, errorImg);
                  }

                  try {
                    const idForCount = evento.idEvento || evento.id || evento.id_evento;
                    if (idForCount) {
                      const count = await fetchInscritosCargo2Count(idForCount);
                      eventoCompletado.qtdInscritosCargo2 = count;
                      eventoCompletado.qtdInscritos = count;
                      if (!eventoCompletado.qtdInteressado) eventoCompletado.qtdInteressado = count;
                    }
                  } catch (errCount) {
                    console.debug("Erro ao buscar contagem de inscritos:", errCount);
                  }

                  return eventoCompletado;
              })
             );

             // helpers robustos para parse de data/hora (suporta YYYY-MM-DD e DD/MM/YYYY)
             const tryParseDateTime = (dateStr, timeStr) => {
               if (!dateStr) return null;
               const t = (timeStr || "").trim();
               // normalize separators
               const ds = String(dateStr).trim();
               // ISO full or with T
               const isoFullMatch = ds.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}(?::\d{2})?))?/);
               if (isoFullMatch) {
                 const datePart = isoFullMatch[1];
                 const timePart = isoFullMatch[2] || t || "00:00";
                 const candidate = `${datePart}T${timePart}`;
                 const d = new Date(candidate);
                 if (!isNaN(d.getTime())) return d;
               }
               // ISO-like YYYY-MM-DD (or YYYY/MM/DD)
               const isoMatch = ds.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
               if (isoMatch) {
                 const [ , y, m, d ] = isoMatch;
                 const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":");
                 const dObj = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
                 if (!isNaN(dObj.getTime())) return dObj;
               }
               // DD/MM/YYYY or DD-MM-YYYY
               const brMatch = ds.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
               if (brMatch) {
                 const [ , day, month, year ] = brMatch;
                 const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":");
                 const dObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hh), Number(mm), Number(ss));
                 if (!isNaN(dObj.getTime())) return dObj;
               }
               // try Date fallback (handles some other formats)
               try {
                 const candidate = t ? `${ds} ${t}` : ds;
                 const dObj = new Date(candidate);
                 if (!isNaN(dObj.getTime())) return dObj;
               } catch { /* ignore */ }
               return null;
             };

             const computeStatusFromDate = (ev) => {
               const dateStr = ev.dia || ev.data_evento || ev.day || "";
               if (!dateStr) return null;
               const start = tryParseDateTime(dateStr, ev.horaInicio || ev.hora_inicio || ev.hora || "");
               const end = tryParseDateTime(dateStr, ev.horaFim || ev.hora_fim || ev.horaFim || "") || tryParseDateTime(dateStr, "23:59");
               const now = new Date();
               if (start && end) {
                 if (now < start) return "Aberto";
                 if (now >= start && now <= end) return "Em andamento";
                 if (now > end) return "Encerrado";
               } else if (start) {
                 if (now < start) return "Aberto";
                 if (now >= start) return "Em andamento";
               }
               return null;
             };

             const parseEventTimestamp = (ev) => {
               // timestamp usado para ordenação: usa início quando possível, senão tenta data sem hora
               const dateStr = ev.dia || ev.data_evento || ev.day || "";
               const dt = tryParseDateTime(dateStr, ev.horaInicio || ev.hora_inicio || ev.hora || "");
               if (dt) return dt.getTime();
               const fallback = tryParseDateTime(dateStr, "00:00");
               return fallback ? fallback.getTime() : 0;
             };

             const processed = eventosComImg.map(ev => {
               const ts = parseEventTimestamp(ev);
               const computed = computeStatusFromDate(ev);
               const effectiveStatus = (computed || (ev.statusSituacao || ev.statusEvento?.situacao || ev.situacao || "")).toString();
               return { ...ev, _startTs: ts, statusEfetivo: effectiveStatus };
             });

             // ordenar do mais antigo (menor timestamp) para o mais novo — assim 2025 aparece acima de 2026
             processed.sort((a, b) => (a._startTs || 0) - (b._startTs || 0));

             // identificar ids de status "Encerrado" a partir do statusList
             const closedStatusIds = new Set((statusList || [])
               .filter(s => (String(s.situacao || s.nome || "").toLowerCase().includes("encerr")))
               .map(s => Number(s.idStatusEvento ?? s.id)).filter(Boolean)
             );

             const containsEncerrado = (val) => {
               if (!val) return false;
               try {
                 return String(val).toLowerCase().includes("encerr");
               } catch { return false; }
             };

             // se usuário logado: buscar participações para excluir eventos já inscritos
             let inscritosIds = new Set();
             if (userId) {
               try {
                 const pr = await fetch(`${BASE_URL}/participacoes/eventos-inscritos/${encodeURIComponent(userId)}`, { method: "GET", headers: { Accept: "application/json", ...getAuthHeaders() }, mode: "cors" });
                 if (pr.ok) {
                   const parts = await pr.json().catch(() => []);
                   (parts || []).forEach(p => {
                     const id = p.idEvento ?? p.evento?.idEvento ?? p.eventoId ?? p.id?.eventoId ?? p.id;
                     if (id || id === 0) inscritosIds.add(String(id));
                   });
                 }
               } catch (err) {
                 console.warn("Não foi possível buscar participações do usuário:", err);
               }
             }

             // manter todos exceto 'Encerrado' e exceto eventos nos quais o usuário já está inscrito
             const filtered = processed.filter(ev => {
               // 1) status calc/ backend text
               if (containsEncerrado(ev.statusEfetivo)) return false;
               const backendTextCandidates = [
                 ev.statusSituacao,
                 ev.statusEvento?.situacao,
                 ev.situacao,
                 ev.status,
                 ev.status_evento,
                 ev.statusEventoNome,
                 ev.statusName
               ];
               for (const t of backendTextCandidates) {
                 if (containsEncerrado(t)) return false;
               }
               // 2) backend id mapping
               const backendId = Number(ev.statusEvento?.idStatusEvento ?? ev.statusEvento?.id ?? ev.statusId ?? ev.statusEventoId ?? ev.status_evento_id ?? 0);
               if (backendId && closedStatusIds.has(backendId)) return false;

               // 3) excluir eventos onde usuário já está inscrito (se userId presente)
               if (inscritosIds.size > 0) {
                 const evId = ev.idEvento ?? ev.id ?? ev.id_evento ?? ev.eventoId;
                 if (evId !== undefined && evId !== null && inscritosIds.has(String(evId))) return false;
               }

               return true;
             });

             setEventos(filtered.map(p => {
               const copy = { ...p };
               delete copy._startTs;
               return copy;
             }));
             
             setFiltrosUI(INITIAL_FILTERS); 
       } catch (error) {
             console.error("Erro ao buscar eventos:", error);
             setEventos([]);
       }
     };

     useEffect(() => {
       buscarEventos();
       const onRefresh = () => buscarEventos();
       apiRefresh.addEventListener("refresh", onRefresh);
       return () => apiRefresh.removeEventListener("refresh", onRefresh);
     }, []);

     const handleFiltroChange = (field, value) => {
       setFiltrosUI(prev => ({ ...prev, [field]: value }));
     };

     const handlePesquisar = () => {
       buscarEventos();
     };

     // opções reutilizáveis para confirmações com o mesmo estilo de botões
     const swalConfirmDefaults = {
       showCancelButton: true,
       buttonsStyling: false,
       customClass: {
         confirmButton: "sw-btn sw-btn-confirm",
         cancelButton: "sw-btn sw-btn-cancel"
       }
     };

     // handler de inscrição (já existente no arquivo — garantir que está definido)
     const inscreverEvento = async (idEvento, idStatusInscricao = 1) => {
      if (!userId) {
        Swal.fire("Atenção", "Você precisa estar logado para se inscrever.", "warning");
        return;
      }
  
      const id = idEvento || null;
      if (!id) {
        Swal.fire("Erro", "ID do evento inválido.", "error");
        return;
      }
  
      const url = `${BASE_URL}/participacoes/${encodeURIComponent(id)}/inscrever?idUsuario=${encodeURIComponent(userId)}&idStatusInscricao=${encodeURIComponent(idStatusInscricao)}`;
  
      try {
        const res = await fetch(url, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", ...getAuthHeaders() } });
        if (res.ok) triggerApiRefresh();
 
         // tenta ler resposta (json ou texto) para extrair mensagem amigável
         const contentType = res.headers.get("content-type") || "";
         let body = null;
         if (contentType.includes("application/json")) {
           body = await res.json().catch(() => null);
         } else {
           body = await res.text().catch(() => null);
         }
  
        if (res.ok) {
          Swal.fire("Inscrição enviada", "Você foi inscrito no evento.", "success");
          return;
        }
  

        let errMsg = "Não foi possível inscrever.";
        if (body) {
          if (typeof body === "string" && body.trim()) {

            errMsg = body;
          } else if (typeof body === "object") {

            errMsg = body.message || body.error || JSON.stringify(body);
          }
        } else {
          errMsg = `Erro ${res.status}`;
        }
  
        Swal.fire("Erro", errMsg, "error");
      } catch (err) {
        console.error("Erro ao inscrever:", err);
        Swal.fire("Erro", "Falha ao conectar com o servidor.", "error");
      }
    };
    
     const mostrarDetalhes = async (evento) => {

  const titulo = evento.nomeEvento || evento.nome || evento.nome_evento || "Evento";
  let descricao = evento.descricao || evento.descricaoEvento || evento.descricao_evento || "Sem descrição.";
  let dataFormat = evento.data_evento || evento.dia || evento.day || "";
  let horaInicio = evento.hora_inicio || evento.horaInicio || evento.horaInicio || "-";
  let horaFim = evento.hora_fim || evento.horaFim || evento.horaFim || "-";
  let imgUrl = evento.imagemUrl || null;
  let localStr = evento.local || evento.enderecoFormatado || "Local não informado";
  let vagas = evento.qtdVaga ?? evento.qtd_vaga ?? evento.qtdVagas ?? "Evento aberto ao público";
  let categoria = evento.categoriaNome || evento.categoria?.nome || "-";
  let status = evento.statusSituacao || evento.statusEvento?.situacao || evento.status_evento || "-";
  let publico = evento.publico || evento.publicoAlvo || evento.publico_alvo || "Público";

  // se não há endereço útil, tenta buscar detalhe do evento no backend
  const hasEnderecoObject = !!(evento.endereco && typeof evento.endereco === "object");
  if ((!evento.endereco && !evento.enderecoFormatado && (!evento.local || evento.local === "Local não informado")) || !hasEnderecoObject) {
    const id = evento.idEvento || evento.id || evento.id_evento;
    if (id) {
      try {
        // mostra um modal de loading curto enquanto carrega os detalhes
        Swal.fire({
          title: "Carregando...",
          html: "Buscando informações completas do evento...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          showConfirmButton: false
        });

        try {
          const resp = await fetch(`${BASE_URL}/eventos/${encodeURIComponent(id)}`, { method: "GET", headers: { Accept: "application/json", ...getAuthHeaders() }, mode: "cors" });
          if (resp.ok) {
            const full = await resp.json();
            // sobrescrever campos com os dados completos quando presentes
            descricao = full.descricao || descricao;
            dataFormat = full.data_evento || full.dia || dataFormat;
            horaInicio = full.hora_inicio || full.horaInicio || horaInicio;
            horaFim = full.hora_fim || full.horaFim || horaFim;
            imgUrl = imgUrl || full.imagemUrl || null;
            vagas = full.qtdVaga ?? full.qtd_vaga ?? vagas;
            categoria = full.categoria?.nome || categoria;
            status = full.statusEvento?.situacao || status;
            publico = full.publicoAlvo || full.publico || publico;

            const e = full.endereco || full.enderecoEvento || full.address || null;
            if (e && typeof e === "object") {
              const rua = e.logradouro || e.rua || "";
              const numero = (e.numero !== undefined && e.numero !== null) ? String(e.numero) : "";
              const bairro = e.bairro || "";
              const parts = [];
              if (rua) parts.push(rua + (numero ? `, ${numero}` : ""));
              if (bairro) parts.push(bairro);
              if (parts.length) localStr = parts.join(" - ");
            } else if (full.enderecoFormatado && typeof full.enderecoFormatado === "string" && full.enderecoFormatado.trim()) {
              localStr = full.enderecoFormatado;
            }
          } else {
            console.warn("Detalhe do evento não disponível:", resp.status);
          }
        } catch (err) {
          console.error("Erro ao buscar detalhe do evento:", err);
        } finally {
          Swal.close();
        }
      } catch (err) {
        console.error("Erro ao buscar detalhe do evento:", err);
      } finally {
        Swal.close();
      }
    }
  }

  const imgHtml = imgUrl ? `<img src="${imgUrl}" alt="${titulo}" class="sw-img" />` : `<div class="sw-img sw-noimg">Sem imagem</div>`;

  const html = `
    <div class="sw-modal-compact" style="display:flex; gap:18px;">
      <div class="sw-left" style="flex:1; min-width:220px;">
        ${imgHtml}
        <div class="sw-desc">
          <h4>Descrição</h4>
          <p>${descricao}</p>
        </div>
      </div>
      <div class="sw-right" style="flex:1;">
        <div class="sw-row"><span class="label">Data:</span><span class="value">${dataFormat}</span></div>
        <div class="sw-row"><span class="label">Hora:</span><span class="value">${horaInicio} - ${horaFim}</span></div>
        <div class="sw-row"><span class="label">Local:</span><span class="value">${localStr}</span></div>
        <div class="sw-row"><span class="label">Nº de vagas:</span><span class="value">${vagas}</span></div>
        <div class="sw-row"><span class="label">Status:</span><span class="value">${status}</span></div>
        <div class="sw-row"><span class="label">Categoria:</span><span class="value">${categoria}</span></div>
        <div class="sw-row"><span class="label">Público Alvo:</span><span class="value">${publico}</span></div>
      </div>
    </div>
  `;

  Swal.fire({
    title: titulo,
    html,
    width: 760,
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonText: "Agendar",
    cancelButtonText: "Fechar",
    customClass: {
      popup: "my-swal compact-swal",
      title: "swal2-title my-swal-title",
      content: "swal2-content my-swal-content",
      confirmButton: "sw-btn sw-btn-confirm",
      cancelButton: "sw-btn sw-btn-cancel",
      closeButton: "swal2-close my-swal-close"
    },
    buttonsStyling: false,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Tem certeza?",
        text: "Deseja participar do evento?",
        icon: "question",
        confirmButtonText: "Sim, agendar",
        cancelButtonText: "Cancelar",
        ...swalConfirmDefaults
      }).then((confirm) => {
        if (confirm.isConfirmed) {
          const id = evento.idEvento || evento.id || evento.id_evento;
          inscreverEvento(id);
        }
      });
    }
  });
};
 
     const handleParticiparClick = (evento) => {
       if (!userId) {
         Swal.fire("Atenção", "Você precisa estar logado para se inscrever.", "warning");
         return;
       }
   
       Swal.fire({
         title: "Tem certeza?",
         text: "Deseja participar do evento?",
         icon: "question",
         confirmButtonText: "Sim, agendar",
         cancelButtonText: "Cancelar",
         ...swalConfirmDefaults
       }).then((result) => {
         if (result.isConfirmed) {
           const id = evento.idEvento || evento.id || evento.id_evento;
           inscreverEvento(id);
         }
       });
     };
 
     return (
       <>
             <HeaderBeneficiario />
             <HeaderBeneficiarioBotoes botoes={botoesNav} />
             <FiltroBeneficiario
              filtros={filtrosUI}
              onFiltroChange={handleFiltroChange}
              categorias={categorias}
              statusList={statusList}
              onPesquisar={handlePesquisar}
             />
             <EspacoEventosBeneficiario
              eventos={eventos}
              onParticipar={handleParticiparClick}
              onInscrever={inscreverEvento}
              onMostrarDetalhes={mostrarDetalhes}
            />
       </>
     );
}

