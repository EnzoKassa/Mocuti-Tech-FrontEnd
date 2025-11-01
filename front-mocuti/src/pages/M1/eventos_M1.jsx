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
    { texto: "Visão Geral", rota: "/admin/dashboard", img: Visao },
    { texto: "Eventos", rota: "/admin/eventos", img: Calendario },
    { texto: "Usuários", rota: "/admin/lista-usuarios", img: Lista },
    { texto: "Feedbacks", rota: "/admin/feedbacks", img: feedback },
    { texto: "Meu Perfil", rota: "/admin/meu-perfil", img: MeuPerfil }
  ];
  
  // defaultMenu/menuItems removed — usamos rotasPersonalizadas diretamente no NavLateral
  // (mantemos as imagens/rotas em rotasPersonalizadas declaradas acima)
  
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
    if (res.status === 401) {
      // opcional: redirecionar para login
      console.warn("Unauthorized request to", url);
      // mostrar aviso leve
      // Swal.fire("Sessão expirada", "Faça login novamente.", "warning");
      throw new Error("Unauthorized");
    }
    if (res.status === 204) return null;
    if (!res.ok) {
      const txt = await res.text().catch(() => `Erro ${res.status}`);
      throw new Error(txt || `Erro HTTP: ${res.status}`);
    }
    const txt = await res.text().catch(() => "");
    if (!txt) return null;
    try {
      return JSON.parse(txt);
    } catch {
      // não era JSON válido
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const cats = await safeFetchJson("http://localhost:8080/categorias");
        if (Array.isArray(cats)) setCategorias(cats);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }

      try {
        const sts = await safeFetchJson("http://localhost:8080/status-eventos");
        if (Array.isArray(sts)) setStatusList(sts);
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      }
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

      const data = await safeFetchJson(url) || [];

      if (!Array.isArray(data)) {
        setEventos([]);
        return;
      }

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
        // scan properties
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

      console.debug("raw eventos fetched (primeiro):", data && data.length ? data[0] : null);

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
           const categoriaNome = evento.categoria?.nome ||
               categorias.find(c => c.idCategoria == evento.categoria?.idCategoria)?.nome || '';
                
           const statusSituacao = evento.statusEvento?.situacao ||
               statusList.find(s => s.idStatusEvento == evento.statusEvento?.idStatusEvento)?.situacao || '';
 
          // construir endereço consistente (mesma abordagem que eventos_B)
          const { obj: enderecoObj, formatted: enderecoFormatado } = buildEndereco(evento);
          const fallbackLocal = evento.enderecoFormatado || evento.local || "";
          const localFinal = enderecoFormatado || (typeof fallbackLocal === "string" ? fallbackLocal : "");
 
          // garantir quantidade de interessados (várias formas que o backend pode retornar)
          const qtdInteressado = Number(evento.qtdInteressado ?? evento.qtd_interessado ?? evento.qtdInteressos ?? evento.qtd_interessos ?? evento.qtdInteresse ?? 0) ||
            (Array.isArray(evento.interessados) ? evento.interessados.length : 0);
 
           return {
               ...evento,
               categoriaNome,
               statusSituacao,
               local: localFinal || "Local não informado",
               enderecoFormatado: enderecoFormatado || (localFinal || ""),
               // expõe o objeto endereço com campos usados em outros lugares
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
          return eventoCompletado;
        })
      );

      setEventos(eventosComImg);
      setFiltrosUI(INITIAL_FILTERS);
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
    setFiltrosUI(prev => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => {
    buscarEventos();
  };

  // ---- Gerenciar / Formularios / Lista de Presença ----
  const mostrarGerenciar = async (evento) => {
    await openGerenciarModal(evento, {
      onEdit: (ev) => abrirFormularioEvento(ev),
      onDelete: async (ev) => {
        try {
          const idToDelete = ev.idEvento || ev.id || ev.id_evento;
          const res = await fetch(`http://localhost:8080/eventos/${encodeURIComponent(idToDelete)}`, { method: "DELETE", headers: getAuthHeaders() });
          if (res.ok || res.status === 204) {
            Swal.fire("Cancelado", "Evento cancelado/excluído.", "success");
            buscarEventos();
          } else {
            const t = await res.text().catch(() => `Erro ${res.status}`);
            Swal.fire("Erro", t, "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Erro", "Falha ao conectar com o servidor.", "error");
        }
      },
      onLista: (ev) => abrirListaPresenca(ev),
      navigate,
      getAuthHeaders
     });
   };

  const abrirListaPresenca = async (evento) => {
    await openListaPresencaModal(evento, { getAuthHeaders });
  };

  const abrirFormularioEvento = async (evento = null) => {
    await openEventoFormModal(evento, {
      categorias,
      statusList,
      getAuthHeaders,
      safeFetchJson,
      onSaved: () => buscarEventos()
    });
  };

  return (
    <div className="TelaComNavLateral">
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />
      <div className="MainContenEventostM1" style={{ flex: 1 }}>
        <div className="scroll-page">
          <main className="conteudo-com-nav" style={{ paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h1 style={{ margin: 0 }}>Tela de eventos do sistema</h1>
              <div>
                <button className="sw-btn sw-btn-confirm" onClick={() => abrirFormularioEvento()} style={{ background: "#4CAF50" }}>
                  Criar novo evento
                </button>
              </div>
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

