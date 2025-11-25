import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavLateral } from "../../components/NavLateral";
import EspacoEventosBeneficiario from "../../components/espacoeventosbeneficiario";
import FiltroBeneficiario from "../../components/FiltroBeneficiario";
import Swal from "sweetalert2";
import "../../styles/EventosBeneficiario.css";
import "../../styles/NavLateral.css";
import "../../styles/TelaComNavLateral.css";
import "../../styles/FeedbacksM2.css";
import { openGerenciarModal } from "../../components/modal/gerenciarModal";
import { openListaPresencaModal } from "../../components/modal/listaPresencaModal";
import { openEventoFormModal } from "../../components/modal/eventoFormModal";
import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import Visao from "../../assets/images/visaoGeral.svg";
import Lista from "../../assets/images/listausuariom1.svg";
import api, { fetchInscritosCargo2Count } from "../../api/api";

const INITIAL_FILTERS = {
  nome: "",
  dataInicio: "",
  dataFim: "",
  categoriaId: "",
  statusEventoId: "",
};

export default function EventosM1() {
  const navigate = useNavigate();

  const rotasPersonalizadas = [
    { texto: "Visão Geral", rota: "/admin/geral", img: Visao },
    { texto: "Eventos", rota: "/admin/eventos", img: Calendario },
    { texto: "Usuários", rota: "/admin/lista-usuarios", img: Lista },
    { texto: "Feedbacks", rota: "/admin/feedbacks", img: feedback },
    { texto: "Meu Perfil", rota: "/admin/perfil", img: MeuPerfil },
  ];

  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [filtrosUI, setFiltrosUI] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => {
    return (
      localStorage.getItem("token") || localStorage.getItem("authToken") || null
    );
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /** 🔄 MESMA FUNÇÃO, agora usando Axios */
  const safeFetchJson = async (url, opts = {}) => {
    try {
      const method = (opts.method || "GET").toLowerCase();

      const res = await api[method](url, opts.body || null, {
        headers: {
          ...getAuthHeaders(),
          ...opts.headers,
        },
      });

      return res.data ?? null;
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(
        err.response?.data || `Erro HTTP: ${err.response?.status}`
      );
    }
  };

  /** Buscar categorias e status (já usando axios.api) */
  useEffect(() => {
    (async () => {
      try {
        const { data: cats } = await api.get("/categorias", {
          headers: getAuthHeaders(),
        });
        if (Array.isArray(cats)) setCategorias(cats);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }

      try {
        const { data: sts } = await api.get("/status-eventos", {
          headers: getAuthHeaders(),
        });
        if (Array.isArray(sts)) setStatusList(sts);
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      }
    })();
  }, []);

  const buscarEventos = async () => {
    try {
      setLoading(true);
      const filtrosAtuais = filtrosUI || {};

      // monta URL conforme filtros (mesma regra do EventosBeneficiario)
      let url = "/eventos/por-eventos";
      const params = new URLSearchParams();
      if (filtrosAtuais.nome) params.append("nome", filtrosAtuais.nome);
      if (filtrosAtuais.dataInicio) params.append("dataInicio", filtrosAtuais.dataInicio);
      if (filtrosAtuais.dataFim) params.append("dataFim", filtrosAtuais.dataFim);
      const filtrosAdicionais = params.toString();
      if (filtrosAtuais.categoriaId && !filtrosAtuais.statusEventoId) {
        url = `/eventos/por-categoria?categoriaId=${filtrosAtuais.categoriaId}`;
        if (filtrosAdicionais) url += "&" + filtrosAdicionais;
      } else if (filtrosAtuais.statusEventoId && !filtrosAtuais.categoriaId) {
        url = `/eventos/status?statusEventoId=${filtrosAtuais.statusEventoId}`;
        if (filtrosAdicionais) url += "&" + filtrosAdicionais;
      } else if (filtrosAdicionais) {
        url += "?" + filtrosAdicionais;
      }

      const data = (await safeFetchJson(url)) || [];
      if (!Array.isArray(data)) { setEventos([]); return; }

      // Enriquecimento parecido com EventosBeneficiario (categoria/status/local)
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
        const candidateKeys = ["endereco","enderecoEvento","address","local","enderecoFormatado","localizacao","endereco_obj"];
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
            if (val && typeof val === "object" && (val.logradouro || val.rua || val.bairro || val.numero)) return val;
          } catch (err) {
            console.debug("findAddressObject error:", err);
          }
        }
        for (const key of Object.keys(node)) {
          const res = findAddressObject(node[key], seen);
          if (res) return res;
        }
        return null;
      };
      const buildEndereco = (evento) => {
        let candidate = evento.endereco ?? evento.enderecoEvento ?? evento.local ?? evento.enderecoFormatado ?? null;
        candidate = typeof candidate === "string" ? tryParseIfJson(candidate) : candidate;
        if (!candidate || typeof candidate !== "object") {
          const found = findAddressObject(evento);
          if (found) candidate = found;
        }
        let enderecoFormatado = "";
        let enderecoObj = null;
        if (candidate && typeof candidate === "object") {
          const e = candidate;
          const logradouro = e.logradouro || e.rua || e.endereco || e.logradoro || "";
          const numero = e.numero !== undefined && e.numero !== null ? String(e.numero) : e.enderecoNumero ? String(e.enderecoNumero) : "";
          const bairro = e.bairro ? String(e.bairro) : "";
          const partes = [];
          if (logradouro) partes.push(logradouro + (numero ? `, ${numero}` : ""));
          if (bairro) partes.push(bairro);
          if (partes.length) enderecoFormatado = partes.join(" - ");
          enderecoObj = { idEndereco: e.idEndereco || e.id || null, cep: e.cep || "", logradouro, numero, complemento: e.complemento || "", uf: e.uf || "", estado: e.estado || e.localidade || "", bairro };
        } else if (typeof candidate === "string" && candidate.trim()) enderecoFormatado = candidate.trim();
        return { obj: enderecoObj, formatted: enderecoFormatado || "" };
      };

      // tentar enriquecer endereço buscando detalhes do evento quando não houver local já formatado
      const dataComDadosPossivelmenteEnriquecidos = await Promise.all(
        (data || []).map(async (evento) => {
          const { formatted: curto } = buildEndereco(evento);
          if (curto && String(curto).trim()) return evento;
          try {
            const id = evento.idEvento || evento.id || evento.id_evento;
            if (!id) return evento;
            const detalhe = await safeFetchJson(`/eventos/${encodeURIComponent(id)}`);
            if (!detalhe) return evento;
            const { obj: enderecoObj2, formatted: enderecoFormatado2 } = buildEndereco(detalhe);
            const fallbackLocal2 = detalhe.enderecoFormatado || detalhe.local || "";
            return {
              ...evento,
              // preservar campos já existentes, sobrescrever local/endereco quando disponíveis no detalhe
              local: enderecoFormatado2 || fallbackLocal2 || evento.local || "Local não informado",
              enderecoFormatado: enderecoFormatado2 || detalhe.enderecoFormatado || evento.enderecoFormatado || fallbackLocal2 || "",
              endereco: enderecoObj2 || detalhe.endereco || evento.endereco || null,
            };
          } catch (err) {
            console.debug("Erro ao buscar detalhe do evento (enriquecimento):", err);
            return evento;
          }
        })
      );

      const dataComDadosCompletos = (dataComDadosPossivelmenteEnriquecidos || []).map(evento => {
        const categoriaNome = evento.categoria?.nome || categorias.find(c => String(c.idCategoria) === String(evento.categoria?.idCategoria ?? evento.categoriaId ?? evento.categoria?.id))?.nome || "";
        const statusSituacao = evento.statusEvento?.situacao || statusList.find(s => String(s.idStatusEvento) === String(evento.statusEvento?.idStatusEvento ?? evento.statusEventoId ?? evento.statusEvento?.id))?.situacao || "";
        const { obj: enderecoObj, formatted: enderecoFormatado } = buildEndereco(evento);
        const fallbackLocal = evento.enderecoFormatado || evento.local || "";
        const localFinal = enderecoFormatado || (typeof fallbackLocal === "string" ? fallbackLocal : "");
        const qtdInteressado = Number(evento.qtdInteressado ?? evento.qtd_interessado ?? evento.qtdInteressos ?? evento.qtd_interessos ?? evento.qtdInteresse ?? 0) || (Array.isArray(evento.interessados) ? evento.interessados.length : 0);
        return { ...evento, categoriaNome, statusSituacao, local: localFinal || "Local não informado", enderecoFormatado: enderecoFormatado || localFinal || "", endereco: enderecoObj || evento.endereco || null, qtdInteressado };
      });

      const eventosComImg = await Promise.all(
        dataComDadosCompletos.map(async (evento) => {
          const eventoCompletado = { ...evento, imagemUrl: null };
          try {
            const id = evento.idEvento || evento.id || evento.id_evento;
            if (id) {
              const imgResponse = await api.get(`/eventos/foto/${encodeURIComponent(id)}`, { headers: getAuthHeaders(), responseType: "blob" });
              if (imgResponse && imgResponse.data) eventoCompletado.imagemUrl = URL.createObjectURL(imgResponse.data);
            }
          } catch (e) { console.debug("Erro ao buscar imagem do evento:", e); }
          try {
            const idForCount = evento.idEvento || evento.id || evento.id_evento;
            if (idForCount) {
              const count = await fetchInscritosCargo2Count(idForCount);
              eventoCompletado.qtdInscritosCargo2 = count;
              if (!eventoCompletado.qtdInteressado) eventoCompletado.qtdInteressado = count;
            }
          } catch (errCount) { console.debug("Erro ao buscar contagem de inscritos:", errCount); }
          return eventoCompletado;
        })
      );

      const processed = (eventosComImg || []).map(ev => {
        const ts = (function(evLocal){
          const dateStr = evLocal.dia || evLocal.data_evento || evLocal.day || "";
          const startTime = evLocal.horaInicio || evLocal.hora_inicio || evLocal.hora || "";
          if (!dateStr) return 0;
          try {
            const iso = `${dateStr}T${(startTime || "00:00")}`;
            const d = new Date(iso);
            if (isNaN(d.getTime())) {
              const parts = dateStr.split("-");
              if (parts.length === 3) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
              return 0;
            }
            return d.getTime();
          } catch { return 0; }
        })(ev);
        const computed = (function(evLocal){
          const dateStr = evLocal.dia || evLocal.data_evento || evLocal.day || "";
          if (!dateStr) return null;
          const start = (function(){ const t = evLocal.horaInicio || evLocal.hora_inicio || evLocal.hora || ""; const d = new Date(`${dateStr}T${t||"00:00"}`); return isNaN(d.getTime()) ? null : d; })();
          const end = (function(){ const t = evLocal.horaFim || evLocal.hora_fim || evLocal.horaFim || ""; const d = new Date(`${dateStr}T${t||"23:59"}`); return isNaN(d.getTime()) ? null : d; })();
          const now = new Date();
          if (start && end) { if (now < start) return "Aberto"; if (now >= start && now <= end) return "Em andamento"; if (now > end) return "Encerrado"; }
          else if (start) { if (now < start) return "Aberto"; if (now >= start) return "Em andamento"; }
          return null;
        })(ev);
        const effectiveStatus = (computed || ev.statusSituacao || ev.statusEvento?.situacao || "").toString();
        return { ...ev, _startTs: ts, statusEfetivo: effectiveStatus };
      });

      // aplicar filtros combinados (nome, intervalo de datas, categoria, status)
      // usa `filtrosAtuais` já declarado no início da função
      const fromTs = filtrosAtuais.dataInicio ? new Date(filtrosAtuais.dataInicio).setHours(0,0,0,0) : null;
      const toTs = filtrosAtuais.dataFim ? new Date(filtrosAtuais.dataFim).setHours(23,59,59,999) : null;
      const nameFilter = filtrosAtuais.nome ? String(filtrosAtuais.nome).toLowerCase() : "";
      const categoryFilter = filtrosAtuais.categoriaId ? String(filtrosAtuais.categoriaId) : "";
      const statusFilter = filtrosAtuais.statusEventoId ? String(filtrosAtuais.statusEventoId) : "";

      const isClosed = (ev) => String(ev.statusEfetivo || ev.statusSituacao || ev.statusEvento?.situacao || ev.situacao || ev.status_evento || "").toLowerCase().includes("encerr");

      const filteredProcessed = processed.filter(ev => {
        // nome
        if (nameFilter) {
          const title = String(ev.nomeEvento || ev.nome || ev.nome_evento || "").toLowerCase();
          if (!title.includes(nameFilter)) return false;
        }
        // data intervalo
        if (fromTs !== null || toTs !== null) {
          const ts = Number(ev._startTs || 0);
          if (fromTs !== null && ts < fromTs) return false;
          if (toTs !== null && ts > toTs) return false;
        }
        // categoria
        if (categoryFilter) {
          const evCat = String(ev.categoria?.idCategoria ?? ev.categoriaId ?? ev.categoria?.id ?? "");
          if (evCat !== categoryFilter) return false;
        }
        // status (se escolhido)
        if (statusFilter) {
          const sel = (statusList || []).find(s => String(s.idStatusEvento ?? s.id ?? s.value) === statusFilter) || null;
          const selText = sel ? String(sel.situacao || sel.nome || "").toLowerCase() : "";
          if (selText && selText.includes("encerr")) {
            // quer encerrar: aceitar eventos com texto de situação "encerrado"
            if (!isClosed(ev)) return false;
          } else {
            // filtrar por id preferencialmente, fallback por texto
            const evStatusId = String(ev.statusEvento?.idStatusEvento ?? ev.statusId ?? ev.statusEventoId ?? "");
            if (evStatusId && statusFilter) {
              if (evStatusId !== statusFilter) return false;
            } else if (selText) {
              const evText = String(ev.statusEfetivo || ev.statusSituacao || ev.statusEvento?.situacao || ev.situacao || "").toLowerCase();
              if (!evText.includes(selText)) return false;
            }
          }
        }
        return true;
      });

      // ordenar do mais próximo/recente ao mais distante (decrescente por timestamp)
      filteredProcessed.sort((a, b) => (b._startTs || 0) - (a._startTs || 0));

      // visibilidade padrão: ocultar encerrados se o filtro de status NÃO selecionar explicitamente "Encerrado"
      let allowClosed = false;
      if (statusFilter) {
        const sel = (statusList || []).find(s => String(s.idStatusEvento ?? s.id ?? s.value) === statusFilter);
        const situ = sel ? String(sel.situacao || sel.nome || "").toLowerCase() : "";
        if (situ.includes("encerr")) allowClosed = true;
      }

      let visible = filteredProcessed;
      if (!allowClosed) visible = visible.filter(ev => !isClosed(ev));

      setEventos(visible.map(p => { const c = { ...p }; delete c._startTs; return c; }));
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarEventos();
  }, []);

  const handleFiltroChange = (field, value) => {
    setFiltrosUI((prev) => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => buscarEventos();

  /** 🔥 agora delete usando axios */
  const mostrarGerenciar = async (evento) => {
    await openGerenciarModal(evento, {
      onEdit: (ev) => abrirFormularioEvento(ev),
      onDelete: async (ev) => {
        try {
          const idToCancel = ev.idEvento || ev.id || ev.id_evento;
          if (!idToCancel) {
            Swal.fire("Erro", "ID do evento inválido.", "error");
            return;
          }

          // payload que força status para 2 (encerrado) — envia vários formatos para compatibilidade
          const payload = {
            status_evento: 2,
            statusEventoId: 2,
            statusEvento: { idStatusEvento: 2 },
          };

          await api.patch(
            `/eventos/${encodeURIComponent(idToCancel)}`,
            payload,
            { headers: getAuthHeaders() }
          );

          Swal.fire("Cancelado", "Evento marcado como encerrado (status_evento = 2).", "success");
          buscarEventos();
        } catch (err) {
          const msg = err.response?.data || err.message || "Falha ao atualizar evento.";
          Swal.fire("Erro", String(msg), "error");
        }
      },
      onLista: (ev) => abrirListaPresenca(ev),
      navigate,
      getAuthHeaders,
    });
  };

  const abrirListaPresenca = async (evento) => openListaPresencaModal(evento, { getAuthHeaders });

  const abrirFormularioEvento = async (evento = null) =>
    openEventoFormModal(evento, {
      categorias,
      statusList,
      getAuthHeaders,
      safeFetchJson,
      onSaved: () => buscarEventos(),
    });

  return (
    <div className="TelaComNavLateral">
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />
      <div className="MainContenEventostM2" style={{ flex: 1 }}>
        <div className="scroll-page">
          <main className="conteudo-com-nav" style={{ paddingTop: "20px" }}>
            <div className="titulo-eventos-m1">
              <h1 style={{ margin: 0 }}>Tela de eventos do sistema</h1>
              <button
                className="BotaoCadastrarEvento"
                onClick={() => abrirFormularioEvento()}
                style={{color:"white", background: "#4CAF50" }}
              >
                Criar novo evento
              </button>
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
                  onMostrarDetalhes={mostrarGerenciar}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
