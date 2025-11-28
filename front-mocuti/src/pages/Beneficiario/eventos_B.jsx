import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { AuthContext } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import FiltroBeneficiario from "../../components/FiltroBeneficiario";
import EspacoEventosBeneficiario from "../../components/espacoeventosbeneficiario";
import "../../styles/EventosBeneficiario.css";
import { useNavigate } from "react-router-dom";
import api, {
  fetchInscritosCargo2Count,
  BASE_URL,
  apiRefresh,
  triggerApiRefresh,
} from "../../api/api";

const INITIAL_FILTERS = {
  nome: "",
  dataInicio: "",
  dataFim: "",
  categoriaId: "",
  statusEventoId: "",
};

export default function EventosBeneficiario() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [filtrosUI, setFiltrosUI] = useState(INITIAL_FILTERS);
  const { user } = useContext(AuthContext);
  const userId = user?.idUsuario || user?.id || null;
  const navigate = useNavigate();

  const botoesNav = [
    { onClick: () => navigate("/usuario/eventos"), label: "Eventos", className: "btn-inicio" },
    { onClick: () => navigate("/usuario/perfil"), label: "Meu Perfil", className: "btn-sobre" },
    { onClick: () => navigate("/usuario/meus-eventos"), label: "Meus Eventos", className: "btn-linha" },
    { onClick: () => navigate("/usuario/feedback"), label: "Feedback", className: "btn-comentarios" },
  ];

  // eslint-disable-next-line no-unused-vars
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catsRes, stsRes] = await Promise.all([api.get("/categorias"), api.get("/status-eventos")]);
        setCategorias(Array.isArray(catsRes.data) ? catsRes.data : []);
        setStatusList(Array.isArray(stsRes.data) ? stsRes.data : []);
      } catch (err) {
        console.error("Erro ao buscar categorias/status:", err);
      }
    };
    fetchMeta();
  }, []);

  const buscarEventos = async () => {
    try {
      const filtrosAtuais = filtrosUI || {};
      const params = {};
      if (filtrosAtuais.nome) params.nome = filtrosAtuais.nome;
      if (filtrosAtuais.dataInicio) params.dataInicio = filtrosAtuais.dataInicio;
      if (filtrosAtuais.dataFim) params.dataFim = filtrosAtuais.dataFim;
      if (filtrosAtuais.categoriaId) params.categoriaId = filtrosAtuais.categoriaId;
      if (filtrosAtuais.statusEventoId) params.statusEventoId = filtrosAtuais.statusEventoId;

      const res = await api.get("/eventos/por-eventos", { params });
      let data = Array.isArray(res.data) ? res.data : (res.data ?? []);

      // se ambos filtros categoria+status vierem, aplicar aqui (back-end pode não suportar combinação)
      if (filtrosAtuais.categoriaId && filtrosAtuais.statusEventoId) {
        data = data.filter(ev =>
          (ev.categoria?.idCategoria ?? ev.categoriaId ?? ev.categoria?.id) == filtrosAtuais.categoriaId &&
          (ev.statusEvento?.idStatusEvento ?? ev.statusEventoId ?? ev.statusEvento?.id ?? ev.status_evento) == filtrosAtuais.statusEventoId
        );
      }

      // helpers para datas/status
      const tryParseDateTime = (dateStr, timeStr) => {
        if (!dateStr) return null;
        const ds = String(dateStr).trim();
        const t = String(timeStr || "").trim();
        const isoFullMatch = ds.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}(?::\d{2})?))?/);
        if (isoFullMatch) { const datePart = isoFullMatch[1]; const timePart = isoFullMatch[2] || t || "00:00"; const d = new Date(`${datePart}T${timePart}`); if (!isNaN(d.getTime())) return d; }
        const isoMatch = ds.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
        if (isoMatch) { const [, y, m, d] = isoMatch; const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":"); const dObj = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)); if (!isNaN(dObj.getTime())) return dObj; }
        const brMatch = ds.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
        if (brMatch) { const [, day, month, year] = brMatch; const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":"); const dObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hh), Number(mm), Number(ss)); if (!isNaN(dObj.getTime())) return dObj; }
        try { const dObj = new Date(t ? `${ds} ${t}` : ds); if (!isNaN(dObj.getTime())) return dObj; } catch (e) { console.debug("Ignorado:", e); }
        return null;
      };

      const computeStatusFromDate = (ev) => {
        const dateStr = ev.dia || ev.data_evento || ev.day || "";
        if (!dateStr) return null;
        const start = tryParseDateTime(dateStr, ev.horaInicio || ev.hora_inicio || ev.hora || "");
        const end = tryParseDateTime(dateStr, ev.horaFim || ev.hora_fim || ev.horaFim || "") || tryParseDateTime(dateStr, "23:59");
        const now = new Date();
        if (start && end) { if (now < start) return "Aberto"; if (now >= start && now <= end) return "Em andamento"; if (now > end) return "Encerrado"; }
        else if (start) { if (now < start) return "Aberto"; if (now >= start) return "Em andamento"; }
        return null;
      };

      const parseEventTimestamp = (ev) => {
        const dateStr = ev.dia || ev.data_evento || ev.day || "";
        const dt = tryParseDateTime(dateStr, ev.horaInicio || ev.hora_inicio || ev.hora || "");
        if (dt) return dt.getTime();
        const fallback = tryParseDateTime(dateStr, "00:00");
        return fallback ? fallback.getTime() : 0;
      };

      // normalizar endereço/categoria/status text
      const dataComDadosCompletos = (data || []).map(evento => {
        const categoriaNome =
          evento.categoria?.nome ||
          categorias.find(c => String(c.idCategoria) === String(evento.categoria?.idCategoria ?? evento.categoriaId ?? evento.categoria?.id))?.nome ||
          "";
        const statusSituacao =
          evento.statusEvento?.situacao ||
          statusList.find(s => String(s.idStatusEvento) === String(evento.statusEvento?.idStatusEvento ?? evento.statusEventoId ?? evento.status_evento))?.situacao ||
          "";
        const enderecoObj = evento.endereco || evento.enderecoEvento || evento.local || null;
        let enderecoFormatado = "Local não informado";
        if (enderecoObj && typeof enderecoObj === "object") {
          const logradouro = enderecoObj.logradouro || enderecoObj.rua || "";
          const numero = enderecoObj.numero ? `${enderecoObj.numero}` : "";
          const bairro = enderecoObj.bairro ? `${enderecoObj.bairro}` : "";
          const partes = [];
          if (logradouro) partes.push(logradouro + (numero ? `, ${numero}` : ""));
          if (bairro) partes.push(bairro);
          if (partes.length) enderecoFormatado = partes.join(" - ");
        } else if (typeof enderecoObj === "string" && enderecoObj.trim()) {
          enderecoFormatado = enderecoObj;
        }
        return { ...evento, categoriaNome, statusSituacao, local: enderecoFormatado, enderecoFormatado };
      });

      // buscar imagens e contagens (não falhar caso dê erro)
      const eventosComImg = await Promise.all((dataComDadosCompletos || []).map(async (evento) => {
        const copy = { ...evento, imagemUrl: null };
        const id = evento.idEvento || evento.id || evento.id_evento;
        if (!id) return copy;
        try {
          const imgResponse = await api.get(`/eventos/foto/${encodeURIComponent(id)}`, { responseType: "blob" });
          if (imgResponse.status === 200 && imgResponse.data) copy.imagemUrl = URL.createObjectURL(imgResponse.data);
        } catch (e) { console.debug("Ignorado:", e); }
        try {
          const count = await fetchInscritosCargo2Count(id);
          copy.qtdInscritosCargo2 = count;
          if (!copy.qtdInteressado) copy.qtdInteressado = count;
        } catch (errCount) { console.debug("Erro ao buscar contagem de inscritos:", errCount); }
        return copy;
      }));

      // computar statusEfetivo priorizando servidor
      const processed = (eventosComImg || []).map(ev => {
        const ts = parseEventTimestamp(ev) || 0;
        const computed = computeStatusFromDate(ev);
        const serverStatusText = (ev.statusEvento?.situacao || ev.statusSituacao || ev.situacao || "").toString();
        const effectiveStatus = (serverStatusText || computed || "").toString();
        return { ...ev, _startTs: ts, statusEfetivo: effectiveStatus };
      });

      // aplicar filtros combinados do UI localmente (nome, datas, categoria, status)
      let filtered = processed;
      if (filtrosAtuais.nome) {
        const q = String(filtrosAtuais.nome).toLowerCase();
        filtered = filtered.filter(ev =>
          (String(ev.nomeEvento || ev.nome || ev.nome_evento || "").toLowerCase().includes(q)) ||
          (String(ev.descricao || "").toLowerCase().includes(q))
        );
      }
      if (filtrosAtuais.categoriaId) {
        const cid = String(filtrosAtuais.categoriaId);
        filtered = filtered.filter((ev) => String(ev.categoria?.idCategoria ?? ev.categoriaId ?? ev.categoria?.id ?? "") === cid);
      }
      if (filtrosAtuais.statusEventoId) {
        const sid = String(filtrosAtuais.statusEventoId);
        filtered = filtered.filter((ev) => String(ev.statusEvento?.idStatusEvento ?? ev.statusId ?? ev.statusEventoId ?? ev.status_evento ?? "") === sid);
      }
      if (filtrosAtuais.dataInicio) {
        const startD = tryParseDateTime(filtrosAtuais.dataInicio, "00:00");
        if (startD) { const startTs = startD.getTime(); filtered = filtered.filter(ev => (ev._startTs || 0) >= startTs); }
      }
      if (filtrosAtuais.dataFim) {
        const endD = tryParseDateTime(filtrosAtuais.dataFim, "23:59");
        if (endD) { const endTs = endD.getTime(); filtered = filtered.filter(ev => (ev._startTs || 0) <= endTs); }
      }

      // ordenar próximos eventos primeiro
      const targetList = filtered.slice();
      const nowTs = Date.now();
      targetList.sort((a,b) => {
        const ta = a._startTs || 0; const tb = b._startTs || 0;
        const aheadA = Math.max(ta - nowTs, 0); const aheadB = Math.max(tb - nowTs, 0);
        if (aheadA === aheadB) return ta - tb;
        return aheadA - aheadB;
      });

      // detectar ids de status "encerrado" a partir do statusList
      const closedStatusIds = new Set((statusList || []).filter(s => String(s.situacao || s.nome || "").toLowerCase().includes("encerr")).map(s => String(s.idStatusEvento ?? s.id ?? s.value)));

      const getStatusIds = (ev) => [
        ev.status_evento, ev.statusEventoId, ev.statusId, ev.statusEvento?.idStatusEvento, ev.statusEvento?.id
      ].map(v => (v === undefined || v === null ? "" : String(v)));

      const getStatusText = (ev) => String(ev.statusEfetivo || ev.statusSituacao || ev.statusEvento?.situacao || ev.situacao || "").toLowerCase();

      const isClosed = (ev) => {
        const ids = getStatusIds(ev);
        if (ids.some(id => id && (id === "2" || closedStatusIds.has(id)))) return true;
        return getStatusText(ev).includes("encerr");
      };

      const isOpenOrOngoing = (ev) => {
        const txt = getStatusText(ev);
        if (txt.includes("aberto") || txt.includes("em andamento") || txt.includes("andamento")) return true;
        const ids = getStatusIds(ev);
        if (ids.some(id => id && (id === "2" || closedStatusIds.has(id)))) return false;
        return true;
      };

      const selForFilter = filtrosAtuais.statusEventoId ? (statusList || []).find(s => String(s.idStatusEvento ?? s.id ?? s.value) === String(filtrosAtuais.statusEventoId)) : null;
      const selText = selForFilter ? String(selForFilter.situacao || selForFilter.nome || "").toLowerCase() : "";

      let visible = targetList;
      if (!filtrosAtuais.statusEventoId) {
        visible = targetList.filter(ev => isOpenOrOngoing(ev));
      } else if (selText && selText.includes("encerr")) {
        visible = targetList.filter(ev => isClosed(ev));
      } else {
        visible = targetList;
      }

      // debug counts
      try { console.debug("[buscarEventos B] total:", targetList.length, "visible:", visible.length, "closed total:", targetList.filter(isClosed).length); } catch (e) { console.debug("Ignorado:", e); }

      setEventos(visible.map(p => { const c = { ...p }; delete c._startTs; return c; }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, categorias, statusList]);

  const handleFiltroChange = (field, value) => {
    setFiltrosUI(prev => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => buscarEventos();

  const swalConfirmDefaults = {
    showCancelButton: true,
    buttonsStyling: false,
    customClass: { confirmButton: "sw-btn sw-btn-confirm", cancelButton: "sw-btn sw-btn-cancel" },
  };

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

    try {
      const res = await api.post(`/participacoes/${encodeURIComponent(id)}/inscrever`, null, {
        params: { idUsuario: userId, idStatusInscricao },
        validateStatus: () => true,
      });

      const contentType = res.headers?.["content-type"] || "";
      const body = contentType.includes("application/json") ? res.data : (typeof res.data === "string" ? res.data : JSON.stringify(res.data));

      if (res.status >= 200 && res.status < 300) {
        triggerApiRefresh();
        Swal.fire("Inscrição enviada", "Você foi inscrito no evento.", "success");
        return res.data;
      }

      let errMsg = "Não foi possível inscrever.";
      if (body) {
        if (typeof body === "string" && body.trim()) errMsg = body;
        else if (typeof body === "object") errMsg = body.message || body.error || JSON.stringify(body);
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
    let descricao = evento.descricao || evento.descricaoEvento || "Sem descrição.";
    let dataFormat = evento.data_evento || evento.dia || "";
    let horaInicio = evento.hora_inicio || evento.horaInicio || "-";
    let horaFim = evento.hora_fim || evento.horaFim || "-";
    let imgUrl = evento.imagemUrl || null;
    let localStr = evento.local || evento.enderecoFormatado || "Local não informado";
    let vagas = evento.qtdVaga ?? evento.qtd_vaga ?? "Evento aberto ao público";
    let categoria = evento.categoriaNome || evento.categoria?.nome || "-";
    let status = evento.statusSituacao || evento.statusEvento?.situacao || "-";
    let publico = evento.publico || evento.publicoAlvo || "Público";

    const id = evento.idEvento || evento.id || evento.id_evento;
    if (id) {
      try {
        Swal.fire({ title: "Carregando...", html: "Buscando informações completas do evento...", allowOutsideClick: false, didOpen: () => Swal.showLoading(), showConfirmButton: false });
        const resp = await api.get(`/eventos/${encodeURIComponent(id)}`);
        if (resp.status === 200) {
          const full = resp.data || {};
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
          } else if (typeof full.enderecoFormatado === "string" && full.enderecoFormatado.trim()) {
            localStr = full.enderecoFormatado;
          }
        }
      } catch (err) {
        console.error("Erro ao buscar detalhe do evento:", err);
      } finally {
        Swal.close();
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
        closeButton: "swal2-close my-swal-close",
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
          ...swalConfirmDefaults,
        }).then((confirm) => {
          if (confirm.isConfirmed) {
            const id2 = evento.idEvento || evento.id || evento.id_evento;
            inscreverEvento(id2);
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
      ...swalConfirmDefaults,
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