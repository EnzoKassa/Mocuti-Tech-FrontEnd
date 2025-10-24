import React, { useEffect, useMemo, useState } from "react";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";
import "../../styles/Feedbacks_M1.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const API_BASE = "http://localhost:8080";
const ID_EVENTO = 1;

// util de fetch com erro claro
async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url} → ${t}`);
  }
  return res.json();
}

// APIs
async function buscarEventoPorId(id, signal) {
  return fetchJson(`${API_BASE}/eventos/${id}`, { signal });
}
async function buscarPresencaPorEvento(id, signal) {
  // { idEvento, nomeEvento, totalInscritos, presentes, ausentes, taxaPresencaPct }
  return fetchJson(`${API_BASE}/eventos/presenca-evento/${id}`, { signal });
}
async function buscarFeedbacksDoEvento(idEvento, signal) {
  try {
    const byQuery = await fetchJson(`${API_BASE}/feedback?eventoId=${idEvento}`, { signal });
    if (Array.isArray(byQuery)) return byQuery;
  } catch {}
  const all = await fetchJson(`${API_BASE}/feedback`, { signal });
  return (Array.isArray(all) ? all : []).filter((f) => {
    const id = f?.evento?.idEvento ?? f?.evento?.id_evento ?? f?.idEvento ?? f?.id_evento;
    return Number(id) === Number(idEvento);
  });
}

export default function Feedbacks_M1() {
  const [evento, setEvento] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [presenca, setPresenca] = useState(null);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== Modal =====
  const [modalAberto, setModalAberto] = useState(false);
  const [feedbackSelecionado, setFeedbackSelecionado] = useState(null);
  function abrirModal(fb) {
    setFeedbackSelecionado(fb);
    setModalAberto(true);
  }
  function fecharModal() {
    setModalAberto(false);
    setFeedbackSelecionado(null);
  }

  useEffect(() => {
    let vivo = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErro(null);

        // tolera falhas parciais
        const results = await Promise.allSettled([
          buscarEventoPorId(ID_EVENTO, ctrl.signal),
          buscarPresencaPorEvento(ID_EVENTO, ctrl.signal),
          buscarFeedbacksDoEvento(ID_EVENTO, ctrl.signal),
        ]);
        if (!vivo) return;

        const [evRes, prRes, fbRes] = results;

        if (evRes.status === "fulfilled") setEvento(evRes.value ?? null);
        if (prRes.status === "fulfilled") setPresenca(prRes.value ?? null);
        if (fbRes.status === "fulfilled") setFeedbacks(Array.isArray(fbRes.value) ? fbRes.value : []);
      } catch (e) {
        if (!vivo) return;
        console.error(e);
        setErro("Falha ao carregar dados do evento/feedbacks.");
      } finally {
        if (vivo) setLoading(false);
      }
    })();

    return () => {
      vivo = false;
      ctrl.abort();
    };
  }, []);

  // agrega likes/dislikes/total
  const agregados = useMemo(() => {
    let like = 0, dislike = 0, total = 0;
    for (const f of feedbacks) {
      const nota = (f?.nota?.tipoNota || f?.nota?.tipo_nota || "").toLowerCase();
      if (nota === "like") like += 1;
      else if (nota === "dislike") dislike += 1;
      total += 1;
    }
    return { like, dislike, total };
  }, [feedbacks]);

  // chart (barras) — 3 datasets para a legenda mostrar Likes/Dislikes/Total
  const chartData = useMemo(
    () => ({
      labels: ["Likes", "Dislikes", "Total"],
      datasets: [
        {
          label: "Likes",
          data: [agregados.like, 0, 0],
          backgroundColor: "#22c55e",
          borderRadius: 8,
          maxBarThickness: 56,
        },
        {
          label: "Dislikes",
          data: [0, agregados.dislike, 0],
          backgroundColor: "#ef4444",
          borderRadius: 8,
          maxBarThickness: 56,
        },
        {
          label: "Total",
          data: [0, 0, agregados.total],
          backgroundColor: "#3b82f6",
          borderRadius: 8,
          maxBarThickness: 56,
        },
      ],
    }),
    [agregados]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: "Feedbacks do evento (Likes, Dislikes, Total)",
          font: { size: 16, weight: "600" },
        },
        tooltip: { mode: "index", intersect: false },
      },
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0 } },
        y: {
          beginAtZero: true,
          precision: 0,
          grid: { color: "#e5e7eb" },
          ticks: {
            stepSize: 1,
            callback: (v) => (Number.isInteger(v) ? v : null),
          },
        },
      },
    }),
    []
  );

  // dados dos cards
  const nomeEvento = evento?.nome_evento ?? evento?.nomeEvento ?? `Evento ${ID_EVENTO}`;
  const inscritos = Number(presenca?.totalInscritos ?? 0);
  const presentes = Number(presenca?.presentes ?? 0);
  const ausentes = Number(presenca?.ausentes ?? Math.max(inscritos - presentes, 0));

  return (
    <div className="TelaComNavLateral pagina-feedbacks">
      <NavLateral />

      <div className="MainContent conteudo-feedbacks">
        {/* Header com fundo #F2F4F8 */}
        <div className="headerEvento">
          <div className="headerLeft">
            <div className="headerLegenda">Evento</div>
            <div className="headerTitulo" title={nomeEvento}>
              {nomeEvento}
            </div>
          </div>

          <div className="headerMeta">
            <div className="metaLabel">Feedbacks:</div>
            <div className="metaValor">{agregados.total}</div>
          </div>
        </div>

        {/* Topo: cards + gráfico */}
        <div className="boxTopFeedback">
          <div className="boxDashboardFeedback">
            {/* Cards à esquerda */}
            <div className="dashPalestra">
              <div className="cardMini azul">
                <div className="cardTitle">Total de inscritos</div>
                <div className="cardValue big">{inscritos}</div>
              </div>

              <div className="cardMini verde">
                <div className="cardTitle">Total de presentes</div>
                <div className="cardValue big">{presentes}</div>
              </div>

              <div className="cardMini vermelho">
                <div className="cardTitle">Total de ausentes</div>
                <div className="cardValue big">{ausentes}</div>
              </div>

              <div className="cardMini amarelo">
                <div className="cardTitle">Total de feedbacks</div>
                <div className="cardValue big">{agregados.total}</div>
              </div>
            </div>

            {/* Gráfico à direita */}
            <div className="dashQuantidadeFeedback">
              {loading ? (
                <div className="boxLoading">Carregando gráfico…</div>
              ) : (
                <div className="chartCard">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>

          {erro && <div className="alertErro">{erro}</div>}
        </div>

        {/* Lista */}
        <div className="boxLowFeedback">
          <div className="tituloFeedback tituloFeedbackLow">Lista de feedbacks do evento</div>

          <div className="boxListaFeedback">
            <div className="colunas">
              {/* PRIMEIRA COLUNA = NOME DO EVENTO */}
              <div className="colunaFeedback colunaHeader">Evento</div>
              <div className="colunaNome colunaHeader">Nome</div>
              <div className="colunaEmail colunaHeader">E-mail</div>
              <div className="colunaAcoes colunaHeader"></div>
            </div>

            {(feedbacks.length ? feedbacks : []).map((fb, i) => {
              const nomeEventoLinha =
                fb?.evento?.nomeEvento ??
                fb?.evento?.nome_evento ??
                `Evento ${fb?.evento?.idEvento ?? fb?.evento?.id_evento ?? "—"}`;
              const nomeUsuarioLinha =
                fb?.usuario?.nomeCompleto ||
                fb?.nomeUsuario ||
                fb?.participante ||
                fb?.nome ||
                "—";
              const emailUsuarioLinha =
                fb?.usuario?.email || fb?.emailUsuario || fb?.email || "—";

              return (
                <div className="linhas" key={fb.idFeedback ?? i}>
                  <div className="colunaFeedback">{nomeEventoLinha}</div>
                  <div className="colunaNome">{nomeUsuarioLinha}</div>
                  <div className="colunaEmail">{emailUsuarioLinha}</div>
                  <div className="boxBotaoFeedback">
                    <button
                      className="botaoMaisInfoFeedback"
                      onClick={() => abrirModal(fb)}
                    >
                      + Mais Informações
                    </button>
                  </div>
                </div>
              );
            })}

            {!feedbacks.length && !loading && (
              <div className="linhas linhasVazia">Nenhum feedback para este evento.</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <ModalFeedback
        open={modalAberto}
        onClose={fecharModal}
        feedback={feedbackSelecionado}
      />
    </div>
  );
}

/* ===== Modal acessível ===== */
function ModalFeedback({ open, onClose, feedback }) {
  const closeBtnRef = React.useRef(null);
  const tituloId = "modal-feedback-title";

  // fecha no ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // foca no botão fechar
  useEffect(() => {
    if (open && closeBtnRef.current) closeBtnRef.current.focus();
  }, [open]);

  // trava rolagem
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const nomeEvento =
    feedback?.evento?.nomeEvento ??
    feedback?.evento?.nome_evento ??
    `Evento ${feedback?.evento?.idEvento ?? feedback?.evento?.id_evento ?? "—"}`;

  const nomeUsuario =
    feedback?.usuario?.nomeCompleto ||
    feedback?.nomeUsuario ||
    feedback?.participante ||
    feedback?.nome ||
    "—";

  const emailUsuario =
    feedback?.usuario?.email || feedback?.emailUsuario || feedback?.email || "—";

  const comentario = feedback?.comentario || "—";
  const nota = (feedback?.nota?.tipoNota || feedback?.nota?.tipo_nota || "").toLowerCase();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      onClick={handleBackdropClick}
    >
      <div className="modalCard">
        <button
          className="modalClose"
          onClick={onClose}
          aria-label="Fechar modal"
          ref={closeBtnRef}
        >
          ×
        </button>

        <h2 className="modalTitulo" id={tituloId}>Descrição do Feedback</h2>

        <div className="modalGrid">
          <div className="modalGrupo">
            <label className="modalLabel">Evento</label>
            <div className="modalInput">{nomeEvento}</div>
          </div>

          <div className="modalGrupo">
            <label className="modalLabel">Nome</label>
            <div className="modalInput">{nomeUsuario}</div>
          </div>

          <div className="modalGrupo">
            <label className="modalLabel">E-mail</label>
            <div className="modalInput">{emailUsuario}</div>
          </div>

          <div className="modalGrupo col-span-2">
            <label className="modalLabel">Comentário</label>
            <textarea className="modalTextarea" disabled value={comentario} />
          </div>
        </div>

        <div className="modalRating">
          <div className="ratingTitulo">Gostou do evento?</div>
          <div className="ratingOpcoes">
            <div className={`ratingItem ${nota === "like" ? "ativo like" : ""}`}>
              <span>👍</span>
              <small>Gostei</small>
            </div>
            <div className={`ratingItem ${nota === "dislike" ? "ativo dislike" : ""}`}>
              <span>👎</span>
              <small>Não Gostei</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}