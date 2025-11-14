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
import { openGerenciarModal } from "../../components/modal/gerenciarModal";
import { openListaPresencaModal } from "../../components/modal/listaPresencaModal";
import { openEventoFormModal } from "../../components/modal/eventoFormModal";
import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import Visao from "../../assets/images/visaoGeral.svg";
import Lista from "../../assets/images/listausuariom1.svg";
import api from '../../api/api'; // <-- agora tudo usa isso

const INITIAL_FILTERS = {
  nome: "",
  dataInicio: "",
  dataFim: "",
  categoriaId: "",
  statusEventoId: ""
};

export default function EventosM1() {
  const navigate = useNavigate();

  const rotasPersonalizadas = [
    { texto: "Visão Geral", rota: "/admin/geral", img: Visao },
    { texto: "Eventos", rota: "/admin/eventos", img: Calendario },
    { texto: "Usuários", rota: "/admin/lista-usuarios", img: Lista },
    { texto: "Feedbacks", rota: "/admin/feedbacks", img: feedback },
    { texto: "Meu Perfil", rota: "/admin/perfil", img: MeuPerfil }
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

  /** 🔄 MESMA FUNÇÃO, agora usando Axios */
  const safeFetchJson = async (url, opts = {}) => {
    try {
      const res = await api({
        url,
        method: opts.method || "GET",
        headers: { ...getAuthHeaders(), ...opts.headers },
        data: opts.body || null
      });

      return res.data ?? null;
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(err.response?.data || `Erro HTTP: ${err.response?.status}`);
    }
  };

  /** Buscar categorias e status (já usando axios.api) */
  useEffect(() => {
    (async () => {
      try {
        const { data: cats } = await api.get("/categorias", { headers: getAuthHeaders() });
        if (Array.isArray(cats)) setCategorias(cats);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }

      try {
        const { data: sts } = await api.get("/status-eventos", { headers: getAuthHeaders() });
        if (Array.isArray(sts)) setStatusList(sts);
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      }
    })();
  }, []);

  
  /** 🔥 Toda a lógica de buscar eventos mantida — só trocado fetch → axios */
  const buscarEventos = async () => {
    try {
      setLoading(true);
      const filtrosAtuais = filtrosUI;
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

      const data = await safeFetchJson(url) || [];

      if (!Array.isArray(data)) {
        setEventos([]);
        return;
      }

      /** 🔍 Mantido identico */
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
          const val = node[key];
          if (val && typeof val === "object" && (val.logradouro || val.rua || val.bairro || val.numero)) return val;
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
          const numero = e.numero ?? e.enderecoNumero ?? "";
          const bairro = e.bairro ?? "";
          const partes = [];
          if (logradouro) partes.push(logradouro + (numero ? `, ${numero}` : ""));
          if (bairro) partes.push(bairro);
          enderecoFormatado = partes.join(" - ");
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

        return { obj: enderecoObj, formatted: enderecoFormatado };
      };

      const dataComDadosPossivelmenteEnriquecidos = await Promise.all(
        data.map(async (evento) => {
          const { formatted: curto } = buildEndereco(evento);
          if (curto && curto.trim()) return evento;

          try {
            const id = evento.idEvento || evento.id || evento.id_evento;
            if (!id) return evento;

            const detalhe = await safeFetchJson(`/eventos/${encodeURIComponent(id)}`);
            if (!detalhe) return evento;

            const { obj: enderecoObj2, formatted: enderecoFormatado2 } = buildEndereco(detalhe);
            const fallbackLocal2 = detalhe.enderecoFormatado || detalhe.local || "";

            return {
              ...evento,
              local: enderecoFormatado2 || fallbackLocal2 || evento.local || "Local não informado",
              enderecoFormatado: enderecoFormatado2 || evento.enderecoFormatado || fallbackLocal2,
              endereco: enderecoObj2 || evento.endereco
            };
          } catch {
            return evento;
          }
        })
      );

      const dataComDadosCompletos = dataComDadosPossivelmenteEnriquecidos.map(evento => {
        const categoriaNome = evento.categoria?.nome ||
          categorias.find(c => c.idCategoria == evento.categoria?.idCategoria)?.nome || '';

        const statusSituacao = evento.statusEvento?.situacao ||
          statusList.find(s => s.idStatusEvento == evento.statusEvento?.idStatusEvento)?.situacao || '';

        const { obj: enderecoObj, formatted: enderecoFormatado } = buildEndereco(evento);
        const fallbackLocal = evento.enderecoFormatado || evento.local || "";
        const localFinal = enderecoFormatado || fallbackLocal;

        const qtdInteressado = Number(evento.qtdInteressado ?? evento.qtd_interessado ?? 0)
          || (Array.isArray(evento.interessados) ? evento.interessados.length : 0);

        return {
          ...evento,
          categoriaNome,
          statusSituacao,
          local: localFinal || "Local não informado",
          enderecoFormatado: enderecoFormatado || localFinal,
          endereco: enderecoObj || evento.endereco || null,
          qtdInteressado
        };
      });

      /** 🔄 imagem agora com axios */
      const eventosComImg = await Promise.all(
        dataComDadosCompletos.map(async (evento) => {
          const eventoCompletado = { ...evento, imagemUrl: null };
          try {
            const id = evento.idEvento || evento.id || evento.id_evento;
            if (!id) return eventoCompletado;

            const res = await api.get(`/eventos/foto/${id}`, {
              headers: getAuthHeaders(),
              responseType: "blob"
            });

            eventoCompletado.imagemUrl = URL.createObjectURL(res.data);
          } catch {}

          return eventoCompletado;
        })
      );

      setEventos(eventosComImg);
      setFiltrosUI(INITIAL_FILTERS);

    } catch {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscarEventos(); }, []);

  const handleFiltroChange = (field, value) => {
    setFiltrosUI(prev => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => buscarEventos();


  /** 🔥 agora delete usando axios */
  const mostrarGerenciar = async (evento) => {
    await openGerenciarModal(evento, {
      onEdit: (ev) => abrirFormularioEvento(ev),
      onDelete: async (ev) => {
        try {
          const idToDelete = ev.idEvento || ev.id || ev.id_evento;
          await api.delete(`/eventos/${encodeURIComponent(idToDelete)}`, { headers: getAuthHeaders() });

          Swal.fire("Cancelado", "Evento cancelado/excluído.", "success");
          buscarEventos();

        } catch (err) {
          Swal.fire("Erro", err.response?.data || "Falha ao conectar", "error");
        }
      },
      onLista: (ev) => abrirListaPresenca(ev),
      navigate,
      getAuthHeaders
    });
  };

  const abrirListaPresenca = async (evento) =>
    openListaPresencaModal(evento, { getAuthHeaders });

  const abrirFormularioEvento = async (evento = null) =>
    openEventoFormModal(evento, {
      categorias,
      statusList,
      getAuthHeaders,
      safeFetchJson,
      onSaved: () => buscarEventos()
    });


  return (
    <div className="TelaComNavLateral">
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />
      <div className="MainContenEventostM2" style={{ flex: 1 }}>
        <div className="scroll-page">
          <main className="conteudo-com-nav" style={{ paddingTop: "20px" }}>
            <div className="titulo-eventos-m1">
              <h1 style={{ margin: 0 }}>Tela de eventos do sistema</h1>
              <button className="BotaoCadastrarEvento" onClick={() => abrirFormularioEvento()} style={{ background: "#4CAF50" }}>
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
              {loading ? <p>Carregando eventos...</p> : (
                <EspacoEventosBeneficiario eventos={eventos} hideParticipar={true} onMostrarDetalhes={mostrarGerenciar} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
