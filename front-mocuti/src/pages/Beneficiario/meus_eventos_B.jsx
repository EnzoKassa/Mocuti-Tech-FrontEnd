import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import Swal from "sweetalert2";
import "../../styles/meusEventos.css";

export default function MeusEventosBeneficiario() {
  const navigate = useNavigate();

  const NOTAS_MAP = { like: 1, dislike: 2 };

  const botoesNav = [
    { onClick: () => navigate("/usuario/eventos"), label: "Eventos", className: "btn-inicio" },
    { onClick: () => navigate("/usuario/perfil"), label: "Meu Perfil", className: "btn-sobre" },
    { onClick: () => navigate("/usuario/meus-eventos"), label: "Meus Eventos", className: "btn-linha" },
  ];

  const { user } = useAuth();
  const idUsuario = user?.id || localStorage.getItem("idUsuario") || sessionStorage.getItem("idUsuario");

  const [participacoes, setParticipacoes] = useState([]);
  const [eventosPassados, setEventosPassados] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeEventos = async (arr) =>
    Promise.all(
      (arr || []).map(async (p) => {
        let imagemUrl = null;
        let eventoDetalhes = null;
        try {
          const eventoId = p.idEvento || p.id?.eventoId || p.id?.evento_id || (p.id && (p.id.eventoId || p.id));
          if (eventoId) {
            const res = await fetch(`http://localhost:8080/eventos/${eventoId}`);
            if (res.ok) eventoDetalhes = await res.json();
            const imgRes = await fetch(`http://localhost:8080/eventos/foto/${eventoId}`);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              imagemUrl = URL.createObjectURL(blob);
            }
          }
        } catch (err) {
          console.warn("Erro ao buscar detalhes/imagem:", err);
        }

        // calcula janela de feedback: hoje e últimos 5 dias
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const windowStart = new Date(today);
        windowStart.setDate(windowStart.getDate() - 5);

        // tenta extrair data do evento (dia / data_evento / inicio)
        const rawDate = (eventoDetalhes && (eventoDetalhes.dia || eventoDetalhes.data_evento)) || p.dia || p.data_evento || null;
        let eventDate = null;
        if (rawDate) {
          eventDate = new Date(rawDate);
          if (!isNaN(eventDate)) {
            eventDate.setHours(0, 0, 0, 0);
          } else {
            eventDate = null;
          }
        }

        const podeDarFeedback = !!(eventDate && eventDate >= windowStart && eventDate <= today);

        return {
          ...p,
          ...(eventoDetalhes || {}),
          imagemUrl,
          nota: p.nota?.tipoNota || p.nota || null,
          idEvento: p.idEvento || p.id?.eventoId || (eventoDetalhes && eventoDetalhes.idEvento) || p.id,
          podeDarFeedback,
        };
      })
    );

  const fetchEventos = async () => {
    console.log("[meus_eventos_B] fetchEventos start, idUsuario:", idUsuario);
    if (!idUsuario) {
      console.warn("[meus_eventos_B] idUsuario indefinido");
      setParticipacoes([]);
      setEventosPassados([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // busca todos os eventos em que o usuário está inscrito e os passados
      const urlInscritos = `http://localhost:8080/participacoes/eventos-inscritos/${encodeURIComponent(idUsuario)}`;
      const urlPassados = `http://localhost:8080/participacoes/participacao-passados/${encodeURIComponent(idUsuario)}`;
      console.log("[meus_eventos_B] fetching", urlInscritos, urlPassados);

      const [inscritosRes, passadosRes] = await Promise.all([fetch(urlInscritos), fetch(urlPassados)]);

      const inscritos = inscritosRes.ok ? await inscritosRes.json() : [];
      const passados = passadosRes.ok ? await passadosRes.json() : [];

      const normInscritos = await normalizeEventos(inscritos);
      const normPassados = await normalizeEventos(passados);

      setParticipacoes(normInscritos);
      setEventosPassados(normPassados);
    } catch (err) {
      console.error("Erro ao buscar participações:", err);
      setParticipacoes([]);
      setEventosPassados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [idUsuario]);

  const enviarFeedback = async (payload) => {
    const ev = participacoes.find((e) => String(e.idEvento) === String(payload.idEvento));
    if (ev && ev.podeDarFeedback === false) {
      Swal.fire("Atenção", "Ainda não é possível enviar feedback para este evento.", "warning");
      return false;
    }

    try {
      const res = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const updated = await res.json();
      setParticipacoes((prev) =>
        prev.map((ev2) =>
          String(ev2.idEvento) === String(payload.idEvento)
            ? { ...ev2, feedbackId: updated.idFeedback, nota: payload.gostei ? "like" : "dislike", comentario: payload.comentario }
            : ev2
        )
      );
      Swal.fire("Obrigado!", "Seu feedback foi enviado.", "success");
      return true;
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      Swal.fire("Erro", "Falha ao enviar feedback.", "error");
      return false;
    }
  };

  const cancelarInscricao = async (idEvento) => {
    if (!idUsuario) {
      Swal.fire("Atenção", "Você precisa estar logado para cancelar a inscrição.", "warning");
      return;
    }
    const choice = await Swal.fire({
      title: "Confirmação",
      text: "Tem certeza que deseja cancelar sua inscrição neste evento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Manter inscrição",
    });
    if (!choice.isConfirmed) return;

    try {
      const url = `http://localhost:8080/participacoes/${encodeURIComponent(idEvento)}/cancelar-inscricao?idUsuario=${encodeURIComponent(idUsuario)}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setParticipacoes((prev) => prev.filter((ev) => String(ev.idEvento) !== String(idEvento)));
        setEventosPassados((prev) => prev.filter((ev) => String(ev.idEvento) !== String(idEvento)));
        Swal.fire("Inscrição cancelada", "Sua inscrição foi cancelada.", "success");
      } else {
        const text = await res.text().catch(() => `Erro ${res.status}`);
        Swal.fire("Erro", text, "error");
      }
    } catch (err) {
      console.error("Erro ao cancelar inscrição:", err);
      Swal.fire("Erro", "Falha ao conectar com o servidor.", "error");
    }
  };

  // SweetAlert modal (mostra detalhes + permite enviar feedback ou cancelar)
  const mostrarDetalhes = (evento) => {
    const titulo = evento.nomeEvento || evento.nome || "Evento";
    const descricao = evento.descricao || evento.descricaoEvento || "Sem descrição.";
    const dataFormat = evento.dia || evento.data_evento || "";
    const horaInicio = evento.horaInicio || evento.hora_inicio || evento.horaInicio || "-";
    const horaFim = evento.horaFim || evento.hora_fim || "-";
    // extrai rua, número, bairro se objeto endereco presente
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
      confirmButtonText: "Realizar Feedback",
      cancelButtonText: "Cancelar Inscrição",
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
        const fbHtml = `
          <div style="text-align:left;">
            <label style="display:block; font-weight:600; margin-bottom:8px;">Comentário</label>
            <textarea id="sw-feedback-text" placeholder="Digite seu comentário" style="width:100%; height:120px; padding:10px; border:1px solid #e6e6e6; border-radius:4px; resize:vertical;"></textarea>
            <div style="margin-top:18px; text-align:center;">
              <div style="margin-bottom:8px; color:#666;">Gostou do evento?</div>
              <div style="display:flex; gap:24px; justify-content:center; align-items:center;">
                <button id="sw-like" type="button" style="min-width:120px; padding:10px 16px; border-radius:4px; border:1px solid #ddd; background:#fff; cursor:pointer;">👍 Gostei</button>
                <button id="sw-dislike" type="button" style="min-width:120px; padding:10px 16px; border-radius:4px; border:1px solid #ddd; background:#fff; cursor:pointer;">👎 Não Gostei</button>
              </div>
            </div>
          </div>
        `;

        let gostei = null;
        Swal.fire({
          title: "Descrição do Feedback",
          html: fbHtml,
          showCancelButton: true,
          confirmButtonText: "Enviar Feedback",
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
          didOpen: () => {
            const likeBtn = document.getElementById("sw-like");
            const dislikeBtn = document.getElementById("sw-dislike");
            const updateButtons = () => {
              if (!likeBtn || !dislikeBtn) return;
              likeBtn.style.background = gostei === true ? "#3fb040" : "#fff";
              likeBtn.style.color = gostei === true ? "#fff" : "#333";
              dislikeBtn.style.background = gostei === false ? "#e74c3c" : "#fff";
              dislikeBtn.style.color = gostei === false ? "#fff" : "#333";
            };
            likeBtn?.addEventListener("click", () => { gostei = gostei === true ? null : true; updateButtons(); });
            dislikeBtn?.addEventListener("click", () => { gostei = gostei === false ? null : false; updateButtons(); });
            updateButtons();
          }
        }).then(async (fbResult) => {
          if (fbResult.isConfirmed) {
            const comentario = document.getElementById("sw-feedback-text")?.value || "";
            const payload = {
              idUsuario: Number(idUsuario),
              idEvento: Number(evento.idEvento || evento.id_evento || evento.id),
              comentario,
              gostei
            };
            await enviarFeedback(payload);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            const idEv = evento.idEvento || evento.id_evento || evento.id;
            cancelarInscricao(idEv);
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const idEv = evento.idEvento || evento.id_evento || evento.id;
        cancelarInscricao(idEv);
      }
    });
  };

  return (
    <div className="scroll-page-usuario">
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />

      <div className="meus-eventos-beneficiario">
        {loading ? (
          <p>Carregando eventos...</p>
        ) : (
          <div className="feedback-container">
            <div className="eventos-unificado" style={{ background: "#F5F5F5", padding: 24, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
              <h1 style={{ marginTop: 0 }}>Meus Eventos</h1>

              <div style={{ marginTop: 8 }}>
                <EspacoEventosBeneficiario
                  eventos={participacoes}
                  mostrarParticipar={false}
                  hideParticipar={true}
                  onOpenModal={mostrarDetalhes}
                  onCancelarInscricao={cancelarInscricao}
                  onRealizarFeedback={enviarFeedback}
                />
              </div>
              <h1 style={{ marginTop: 0 }}>Eventos Passados</h1>
              <div style={{ marginTop: 12 }}>
                <EspacoEventosBeneficiario
                  eventos={eventosPassados}
                  mostrarParticipar={false}
                  hideParticipar={true}
                  onOpenModal={(evento) => mostrarDetalhes({ ...evento, isPassado: true })}
                  onCancelarInscricao={cancelarInscricao}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


