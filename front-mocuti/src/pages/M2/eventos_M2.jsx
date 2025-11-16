import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavLateral } from "../../components/NavLateral";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import FiltroBeneficiario from "../../components/FiltroBeneficiario";
import Swal from "sweetalert2";
import "../../styles/EventosBeneficiario.css";
import "../../styles/NavLateral.css";
import "../../styles/TelaComNavLateral.css";
import "../../styles/FeedbacksM2.css";

import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import convite from "../../assets/images/convitesLogo.svg";
import { fetchInscritosCargo2Count, BASE_URL, apiRefresh } from "../../api/api";

const INITIAL_FILTERS = {
  nome: "",
  dataInicio: "",
  dataFim: "",
  categoriaId: "",
  statusEventoId: ""
};

export default function EventosM2() {
  const navigate = useNavigate();

  const rotasPersonalizadas = [
    { texto: "Eventos", img: Calendario, rota: "/moderador/eventos" },
    { texto: "Convites", img: convite, rota: "/moderador/convites" },
     { texto: "Feedbacks", img: feedback, rota: "/moderador/feedbacks" },
    { texto: "Meu Perfil", img: MeuPerfil, rota: "/moderador/perfil" },
   
  ];

  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [filtrosUI, setFiltrosUI] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken") || null;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const safeFetchJson = async (url, opts = {}) => {
    const options = { ...opts };
    options.headers = { ...(options.headers || {}), ...getAuthHeaders(), Accept: "application/json" };
    const res = await fetch(url, options);
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 204) return null;
    if (!res.ok) {
      const txt = await res.text().catch(() => `Erro ${res.status}`);
      throw new Error(txt || `Erro HTTP: ${res.status}`);
    }
    const txt = await res.text().catch(() => "");
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  };

  useEffect(() => {
    (async () => {
      try {
        const cats = await safeFetchJson("http://localhost:8080/categorias");
        if (Array.isArray(cats)) setCategorias(cats);
      } catch (err) { console.error("Erro ao buscar categorias:", err); }
      try {
        const sts = await safeFetchJson("http://localhost:8080/status-eventos");
        if (Array.isArray(sts)) setStatusList(sts);
      } catch (err) { console.error("Erro ao buscar status:", err); }
    })();
  }, []);

  const buscarEventos = async () => {
    try {
      setLoading(true);
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

      const data = (await safeFetchJson(url)) || [];
      if (!Array.isArray(data)) { setEventos([]); return; }

      const tryParseIfJson = (v) => {
        if (!v || typeof v !== "string") return v;
        const s = v.trim();
        if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
          try { return JSON.parse(s); } catch { return v; }
        }
        return v;
      };

      const findAddressObject = (node, seen = new Set()) => {
        if (!node || typeof node === "number" || typeof node === "boolean") return null;
        if (typeof node === "string") {
          const parsed = tryParseIfJson(node);
          if (parsed && parsed !== node) return findAddressObject(parsed, seen);
          return null;
        }
        if (seen.has(node)) return null;
        seen.add(node);
        const candidateKeys = ["endereco", "enderecoEvento", "address", "local", "enderecoFormatado", "localizacao", "endereco_obj"];
        for (const k of candidateKeys) {
          if (node[k]) {
            const v = node[k];
            if (typeof v === "string") {
              const parsed = tryParseIfJson(v);
              if (parsed && typeof parsed === "object") return parsed;
            } else if (typeof v === "object") return v;
          }
        }
        for (const key of Object.keys(node)) {
          try {
            const val = node[key];
            if (val && typeof val === "object") {
              if (val.logradouro || val.rua || val.bairro || val.numero) return val;
            }
          } catch { /* ignore */ }
        }
        for (const key of Object.keys(node)) {
          const res = findAddressObject(node[key], seen);
          if (res) return res;
        }
        return null;
      };

      const buildEndereco = (evento) => {
        let candidate = evento.endereco ?? evento.enderecoEvento ?? evento.local ?? evento.enderecoFormatado ?? null;
        candidate = (typeof candidate === "string") ? tryParseIfJson(candidate) : candidate;
        if (!candidate || typeof candidate !== "object") {
          const found = findAddressObject(evento);
          if (found) candidate = found;
        }
        let enderecoFormatado = "";
        let enderecoObj = null;
        if (candidate && typeof candidate === "object") {
          const e = candidate;
          const logradouro = e.logradouro || e.rua || e.endereco || e.logradoro || "";
          const numero = (e.numero !== undefined && e.numero !== null) ? String(e.numero) : (e.enderecoNumero ? String(e.enderecoNumero) : "");
          const bairro = e.bairro ? String(e.bairro) : "";
          const partes = [];
          if (logradouro) partes.push(logradouro + (numero ? `, ${numero}` : ""));
          if (bairro) partes.push(bairro);
          if (partes.length) enderecoFormatado = partes.join(" - ");
          enderecoObj = {
            idEndereco: e.idEndereco || e.id || null,
            cep: e.cep || "",
            logradouro,
            numero,
            complemento: e.complemento || "",
            uf: e.uf || "",
            estado: e.estado || e.localidade || "",
            bairro
          };
        } else if (typeof candidate === "string" && candidate.trim()) {
          enderecoFormatado = candidate.trim();
        }
        return { obj: enderecoObj, formatted: enderecoFormatado || "" };
      };

      const dataComDadosPossivelmenteEnriquecidos = await Promise.all(
        data.map(async (evento) => {
          const { formatted: curto } = buildEndereco(evento);
          if (curto && String(curto).trim()) return evento;
          try {
            const id = evento.idEvento || evento.id || evento.id_evento;
            if (!id) return evento;
            const detalhe = await safeFetchJson(`http://localhost:8080/eventos/${encodeURIComponent(id)}`);
            if (!detalhe) return evento;
            const { obj: enderecoObj2, formatted: enderecoFormatado2 } = buildEndereco(detalhe);
            const fallbackLocal2 = detalhe.enderecoFormatado || detalhe.local || "";
            const localFinal2 = enderecoFormatado2 || (typeof fallbackLocal2 === "string" ? fallbackLocal2 : "");
            return {
              ...evento,
              local: localFinal2 || evento.local || "Local não informado",
              enderecoFormatado: enderecoFormatado2 || evento.enderecoFormatado || (localFinal2 || ""),
              endereco: enderecoObj2 || evento.endereco || null
            };
          } catch (err) {
            console.warn("Não foi possível buscar detalhe do evento para endereço:", evento.idEvento || evento.id, err);
            return evento;
          }
        })
      );

      const dataComDadosCompletos = dataComDadosPossivelmenteEnriquecidos.map(evento => {
        const categoriaNome = evento.categoria?.nome || categorias.find(c => c.idCategoria == evento.categoria?.idCategoria)?.nome || '';
        const statusSituacao = evento.statusEvento?.situacao || statusList.find(s => s.idStatusEvento == evento.statusEvento?.idStatusEvento)?.situacao || '';
        const { obj: enderecoObj, formatted: enderecoFormatado } = buildEndereco(evento);
        const fallbackLocal = evento.enderecoFormatado || evento.local || "";
        const localFinal = enderecoFormatado || (typeof fallbackLocal === "string" ? fallbackLocal : "");
        const qtdInteressado = Number(evento.qtdInteressado ?? evento.qtd_interessado ?? evento.qtdInteressos ?? evento.qtd_interessos ?? evento.qtdInteresse ?? 0) ||
          (Array.isArray(evento.interessados) ? evento.interessados.length : 0);
        return {
          ...evento,
          categoriaNome,
          statusSituacao,
          local: localFinal || "Local não informado",
          enderecoFormatado: enderecoFormatado || (localFinal || ""),
          endereco: enderecoObj || evento.endereco || null,
          qtdInteressado
        };
      });

      const eventosComImg = await Promise.all(
        dataComDadosCompletos.map(async (evento) => {
          const eventoCompletado = { ...evento, imagemUrl: null };
          try {
            const id = evento.idEvento || evento.id || evento.id_evento;
            if (!id) return eventoCompletado;
            const imgResponse = await fetch(`http://localhost:8080/eventos/foto/${id}`, { headers: getAuthHeaders(), mode: "cors" });
            if (imgResponse.ok) {
              const blob = await imgResponse.blob();
              eventoCompletado.imagemUrl = URL.createObjectURL(blob);
            }
          } catch (errorImg) {
            console.warn(`Erro ao buscar foto para evento ${evento.idEvento}:`, errorImg);
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

      // robusto parser de data/hora — inclui ISO completo com T
      const tryParseDateTime = (dateStr, timeStr) => {
        if (!dateStr) return null;
        const ds = String(dateStr).trim();
        const t = String(timeStr || "").trim();

        // ISO full (ex: 2026-11-26T14:00:00 or 2026-11-26 14:00:00)
        const isoFullMatch = ds.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}(?::\d{2})?))?/);
        if (isoFullMatch) {
          const datePart = isoFullMatch[1];
          const timePart = isoFullMatch[2] || t || "00:00";
          const candidate = `${datePart}T${timePart}`;
          const d = new Date(candidate);
          if (!isNaN(d.getTime())) return d;
        }

        // YYYY-MM-DD without T
        const isoMatch = ds.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
        if (isoMatch) {
          const [ , y, m, d ] = isoMatch;
          const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":");
          const dObj = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
          if (!isNaN(dObj.getTime())) return dObj;
        }

        // BR DD/MM/YYYY or DD-MM-YYYY
        const brMatch = ds.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
        if (brMatch) {
          const [ , day, month, year ] = brMatch;
          const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":");
          const dObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hh), Number(mm), Number(ss));
          if (!isNaN(dObj.getTime())) return dObj;
        }

        // fallback: try Date constructor with combined string
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
        const dateStr = ev.dia || ev.data_evento || ev.day || "";
        const dt = tryParseDateTime(dateStr, ev.horaInicio || ev.hora_inicio || ev.hora || "");
        if (dt) return dt.getTime();
        const fallback = tryParseDateTime(dateStr, "00:00");
        return fallback ? fallback.getTime() : 0;
      };

      // ids que representam "Encerrado" no statusList (para backend id mapping)
      const closedStatusIds = new Set((statusList || [])
        .filter(s => (String(s.situacao || s.nome || "").toLowerCase().includes("encerr")))
        .map(s => Number(s.idStatusEvento ?? s.id)).filter(Boolean)
      );

      const processed = eventosComImg.map(ev => {
        const ts = parseEventTimestamp(ev);
        const computed = computeStatusFromDate(ev);
        const effectiveStatus = (computed || (ev.statusSituacao || ev.statusEvento?.situacao || "")).toString();
        return { ...ev, _startTs: ts, statusEfetivo: effectiveStatus };
      });

      // ordenar ascendente (mais antigo primeiro)
      processed.sort((a, b) => (a._startTs || 0) - (b._startTs || 0));

      // manter todos exceto 'Encerrado' (usa statusEfetivo ou id do backend)
      const filtered = processed.filter(ev => {
        const sText = (ev.statusEfetivo || ev.statusSituacao || ev.statusEvento?.situacao || "").toString().toLowerCase();
        if (sText.includes("encerr")) return false;
        const backendId = Number(ev.statusEvento?.idStatusEvento ?? ev.statusEvento?.id ?? ev.statusId ?? 0);
        if (backendId && closedStatusIds.has(backendId)) return false;
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscarEventos(); 
   const onRefresh = () => buscarEventos();
   apiRefresh.addEventListener("refresh", onRefresh);
   return () => apiRefresh.removeEventListener("refresh", onRefresh);
  }, []);

  const handleFiltroChange = (field, value) => { setFiltrosUI(prev => ({ ...prev, [field]: value })); };
  const handlePesquisar = () => { buscarEventos(); };

  // versão do modal de detalhes (copiado de eventos_B.jsx) sem ações
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

    // tentar buscar endereço completo se faltar
    const hasEnderecoObject = !!(evento.endereco && typeof evento.endereco === "object");
    if ((!evento.endereco && !evento.enderecoFormatado && (!evento.local || evento.local === "Local não informado")) || !hasEnderecoObject) {
      const id = evento.idEvento || evento.id || evento.id_evento;
      if (id) {
        try {
          Swal.fire({ title: "Carregando...", html: "Buscando informações completas do evento...", allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }, showConfirmButton: false });
          const resp = await fetch(`http://localhost:8080/eventos/${encodeURIComponent(id)}`);
          if (resp.ok) {
            const full = await resp.json();
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
      showCancelButton: false,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "my-swal compact-swal",
        title: "swal2-title my-swal-title",
        content: "swal2-content my-swal-content",
        closeButton: "swal2-close my-swal-close"
      },
      buttonsStyling: false
    });
  };

  return (
    <div className="TelaComNavLateral">
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />
      <div className="MainContenEventostM2">
        <div className="scroll-page">
          <main className="conteudo-com-nav" style={{ paddingTop: "20px" }}>
            <div className="titulo-eventos">
              <h1 style={{ margin: 0 }}>Tela de eventos</h1>
            </div>

            <FiltroBeneficiario
              filtros={filtrosUI}
              onFiltroChange={handleFiltroChange}
              categorias={categorias}
              statusList={statusList}
              onPesquisar={handlePesquisar}
            />

            <div style={{ marginTop: 12 }}>
              {loading ? (
                <p>Carregando eventos...</p>
              ) : (
                <EspacoEventosBeneficiario
                  eventos={eventos}
                  hideParticipar={true}
                  onMostrarDetalhes={mostrarDetalhes}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


