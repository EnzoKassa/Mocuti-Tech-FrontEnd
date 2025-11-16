import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import Swal from "sweetalert2";
import { fetchInscritosCargo2Count, BASE_URL, apiRefresh, triggerApiRefresh } from "../../api/api";
import "../../styles/meusEventos.css";

export default function MeusEventosBeneficiario() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const idUsuario = user?.id || localStorage.getItem("idUsuario") || sessionStorage.getItem("idUsuario");

  const botoesNav = [
    { onClick: () => navigate("/usuario/eventos"), label: "Eventos", className: "btn-inicio" },
    { onClick: () => navigate("/usuario/perfil"), label: "Meu Perfil", className: "btn-sobre" },
    { onClick: () => navigate("/usuario/meus-eventos"), label: "Meus Eventos", className: "btn-linha" },
    { onClick: () => navigate("/usuario/feedback"), label: "Feedback", className: "btn-comentarios" }
  ];

  const [participacoes, setParticipacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeEventos = async (arr) =>
    Promise.all(
      (arr || []).map(async (p) => {
        let imagemUrl = null;
        let eventoDetalhes = null;

        const extractEventId = (obj) => {
          if (!obj) return null;
          return obj.idEvento ??
                 obj.evento?.idEvento ??
                 obj.eventoId ??
                 obj.id ??
                 obj.evento?.id ??
                 obj.id_evento ??
                 obj.evento_id ??
                 null;
        };

        const eventoId = extractEventId(p);

        try {
          if (eventoId) {
            const res = await fetch(`${BASE_URL}/eventos/${eventoId}`);
            if (res.ok) eventoDetalhes = await res.json();
            const imgRes = await fetch(`${BASE_URL}/eventos/foto/${eventoId}`);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              imagemUrl = URL.createObjectURL(blob);
            }
          }
        } catch (err) {
          console.warn("Erro ao buscar detalhes/imagem:", err);
        }

        let inscritosCount = 0;
        try {
          const idForCount = eventoId ?? extractEventId(p);
          if (idForCount) {
            // debug: log do id consultado e resultado
            console.debug("fetchInscritosCargo2Count -> idForCount:", idForCount);
            inscritosCount = await fetchInscritosCargo2Count(idForCount);
            console.debug("fetchInscritosCargo2Count -> result:", inscritosCount);
            inscritosCount = Number(inscritosCount || 0);
          }
        } catch (errCount) {
          console.debug("Erro ao buscar contagem de inscritos (meus_eventos):", errCount);
        }

        return {
          ...p,
          ...(eventoDetalhes || {}),
          imagemUrl,
          idEvento: eventoId ?? p.idEvento ?? p.id,
          qtdInscritosCargo2: inscritosCount,
          qtdInscritos: inscritosCount,
          qtdInteressado: p.qtdInteressado ?? inscritosCount,
          inscritosCount,
          participantesCount: inscritosCount,
          inscritos: inscritosCount,
          qtdParticipantes: inscritosCount,
          participantes: inscritosCount,
          interessadosCount: inscritosCount,
          // cria/garante um array 'interessados' caso o componente verifique .length
          interessados: (eventoDetalhes && Array.isArray(eventoDetalhes.interessados) && eventoDetalhes.interessados.length)
                        ? eventoDetalhes.interessados
                        : (Array.isArray(p.interessados) ? p.interessados : new Array(Number(inscritosCount || 0)).fill(null))
        };
      })
    );

  const fetchEventos = async () => {
    if (!idUsuario) {
      setParticipacoes([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const urlInscritos = `${BASE_URL}/participacoes/eventos-inscritos/${encodeURIComponent(idUsuario)}`;
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || null;
      const inscritosRes = await fetch(urlInscritos, { headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" } });

      const inscritos = inscritosRes.ok ? await inscritosRes.json() : [];

      console.debug("meus_eventos_B -> inscritos raw:", { urlInscritos, status: inscritosRes.status, inscritosSample: (inscritos && inscritos.slice ? inscritos.slice(0,5) : inscritos) });
      
      const normInscritos = await normalizeEventos(inscritos);

      console.debug("meus_eventos_B -> normInscritos sample:", normInscritos && normInscritos.slice ? normInscritos.slice(0,5) : normInscritos);
      
      // helper para parse de data/hora (suporta YYYY-MM-DD, ISO T, DD/MM/YYYY)
      const tryParseDateTime = (dateStr, timeStr) => {
        if (!dateStr) return null;
        const ds = String(dateStr).trim();
        const t = String(timeStr || "").trim();

        // ISO full (2026-11-26T14:00:00 or "2026-11-26 14:00:00")
        const isoFullMatch = ds.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}(?::\d{2})?))?/);
        if (isoFullMatch) {
          const datePart = isoFullMatch[1];
          const timePart = isoFullMatch[2] || t || "00:00";
          const candidate = `${datePart}T${timePart}`;
          const d = new Date(candidate);
          if (!isNaN(d.getTime())) return d;
        }

        // YYYY-MM-DD
        const isoMatch = ds.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
        if (isoMatch) {
          const [, y, m, d] = isoMatch;
          const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":");
          const dObj = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
          if (!isNaN(dObj.getTime())) return dObj;
        }

        // DD/MM/YYYY or DD-MM-YYYY
        const brMatch = ds.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
        if (brMatch) {
          const [, day, month, year] = brMatch;
          const [hh = "0", mm = "0", ss = "0"] = (t || "00:00").split(":");
          const dObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hh), Number(mm), Number(ss));
          if (!isNaN(dObj.getTime())) return dObj;
        }

        try {
          const candidate = t ? `${ds} ${t}` : ds;
          const dObj = new Date(candidate);
          if (!isNaN(dObj.getTime())) return dObj;
        } catch { /* ignore */ }
        return null;
      };

      const getEventTimestamp = (p) => {
        const dateStr = p.dia || p.data_evento || p.day || p.data || "";
        const timeStr = p.horaInicio || p.hora_inicio || p.hora || p.horaInicioEvento || "";
        const dt = tryParseDateTime(dateStr, timeStr) || tryParseDateTime(dateStr, "00:00");
        return dt ? dt.getTime() : 0;
      };

      // ordenar do mais antigo para o mais novo (inverter se desejar o contrário)
      const ordenados = [...normInscritos]
        .map(p => ({ ...p, __evtTs: getEventTimestamp(p) }))
        .sort((a, b) => (a.__evtTs || 0) - (b.__evtTs || 0))
        // eslint-disable-next-line no-unused-vars
        .map(({ __evtTs, ...rest }) => rest);

      setParticipacoes(ordenados);
    } catch (err) {
      console.error("Erro ao buscar participações:", err);
      setParticipacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
   const onRefresh = () => fetchEventos();
   apiRefresh.addEventListener("refresh", onRefresh);
   return () => apiRefresh.removeEventListener("refresh", onRefresh);
  }, [idUsuario]);
  
  const cancelarInscricao = async (idEvento) => {
    if (!idUsuario) {
      Swal.fire("Atenção", "Você precisa estar logado para cancelar a inscrição.", "warning");
      return;
    }
    const choice = await Swal.fire({
      title: "Confirmação",
      text: "Tem certeza que deseja cancelar sua inscrição neste evento?",
      icon: "warning",
      confirmButtonColor: "#FF4848",
      cancelButtonColor: "#4FBD34",
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Manter inscrição",
    });
    if (!choice.isConfirmed) return;

    try {
      const url = `${BASE_URL}/participacoes/${encodeURIComponent(idEvento)}/cancelar-inscricao?idUsuario=${encodeURIComponent(idUsuario)}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setParticipacoes((prev) => prev.filter((ev) => String(ev.idEvento) !== String(idEvento)));
        Swal.fire("Inscrição cancelada", "Sua inscrição foi cancelada.", "success");
        triggerApiRefresh();
       } else {
         Swal.fire("Erro", "Não foi possível cancelar a inscrição de um evento que já está em andamento ou encerrado.", "error");
       }
    } catch (err) {
      console.error("Erro ao cancelar inscrição:", err);
      Swal.fire("Erro", "Falha ao conectar com o servidor.", "error");
    }
  };

  const mostrarDetalhes = (evento) => {
    const titulo = evento.nomeEvento || evento.nome || "Evento";
    const descricao = evento.descricao || evento.descricaoEvento || "Sem descrição.";
    const dataFormat = evento.dia || evento.data_evento || "";
    const horaInicio = evento.horaInicio || evento.hora_inicio || "-";
    const horaFim = evento.horaFim || evento.hora_fim || "-";

    let local = "Local não informado";
    const e = evento.endereco || evento.enderecoEvento || evento.enderecoFormatado || evento.local || null;
    if (e && typeof e === "object") {
      const rua = e.logradouro || e.rua || "";
      const numero = (e.numero !== undefined && e.numero !== null) ? String(e.numero) : "";
      const bairro = e.bairro || "";
      const parts = [];
      if (rua) parts.push(rua + (numero ? `, ${numero}` : ""));
      if (bairro) parts.push(bairro);
      if (parts.length) local = parts.join(" - ");
    } else if (typeof e === "string" && e.trim()) {
      local = e;
    }

    const categoria = evento.categoria?.nome || evento.categoriaNome || "-";
    const imgHtml = evento.imagemUrl ? `<img src="${evento.imagemUrl}" alt="${titulo}" class="sw-img" />` : `<div class="sw-img sw-noimg">Sem imagem</div>`;

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
          <div class="sw-row"><span class="label">Local:</span><span class="value">${local}</span></div>
          <div class="sw-row"><span class="label">Categoria:</span><span class="value">${categoria}</span></div>
        </div>
      </div>
    `;

    Swal.fire({
      title: titulo,
      html,
      width: 760,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: "Cancelar Inscrição",
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
        cancelarInscricao(evento.idEvento || evento.id);
      }
    });
  };

  useEffect(() => {
    return () => {
      participacoes.forEach(p => {
        if (p && p.imagemUrl) {
          try { URL.revokeObjectURL(p.imagemUrl); } catch (e) { /* ignore */ }
        }
      });
    };
  }, [participacoes]);

  return (
    <div className="scroll-page-usuario">
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />

      <div className="meus-eventos-beneficiario">
        {loading ? (
          <p>Carregando eventos...</p>
        ) : (
          <div className="feedback-container">
            <div className="eventos-unificado" style={{ background: "#F5F5F5", padding: 0 , boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
              <h1 style={{ marginTop: 0, padding: "0 0 0 100px" }}>Meus Eventos</h1>
              <div style={{ marginTop: 8 }}>
                <EspacoEventosBeneficiario
                  eventos={participacoes}
                  mostrarParticipar={false}
                  hideParticipar={true}
                  onOpenModal={mostrarDetalhes}
                  onCancelarInscricao={cancelarInscricao}
                  s
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


