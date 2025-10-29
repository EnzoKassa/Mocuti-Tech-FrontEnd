import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";
import "../../styles/Feedbacks_M1.css";
import "../../styles/FeedbacksM2.css"; // aproveitando estilos do modal

import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import Visao from "../../assets/images/visaoGeral.svg";
import Lista from "../../assets/images/listausuariom1.svg";

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

import {
  BiLike,
  BiSolidLike,
  BiDislike,
  BiSolidDislike,
} from "react-icons/bi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

// CONFIG
const API_BASE = "http://localhost:8080";
const ID_EVENTO_INICIAL = 2;

// HELPERS DE API
async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url} → ${t}`);
  }
  return res.json();
}

async function buscarEventoPorId(id, signal) {
  return fetchJson(`${API_BASE}/eventos/${id}`, { signal });
}

async function buscarListaPresencaEvento(idEvento, signal) {
  const data = await fetchJson(
    `${API_BASE}/usuarios/${idEvento}/lista-presenca`,
    { signal }
  );

  if (!Array.isArray(data)) {
    return [];
  }
  return data;
}

async function buscarFeedbacksDoEvento(idEvento, signal) {
  try {
    const byQuery = await fetchJson(
      `${API_BASE}/feedback?eventoId=${idEvento}`,
      { signal }
    );
    if (Array.isArray(byQuery)) return byQuery;
  } catch {}

  const all = await fetchJson(`${API_BASE}/feedback`, { signal });

  return (Array.isArray(all) ? all : []).filter((f) => {
    const id =
      f?.evento?.idEvento ??
      f?.evento?.id_evento ??
      f?.idEvento ??
      f?.id_evento;
    return Number(id) === Number(idEvento);
  });
}

// NOVO: buscar todos eventos para o modal inicial
async function buscarTodosEventos(signal) {
  const data = await fetchJson(`${API_BASE}/eventos`, { signal }).catch(() => {
    return [];
  });
  if (!Array.isArray(data)) {
    // backend pode responder { mensagem: "..." }
    return [];
  }
  // normalização de campos
  return data
    .map((e) => ({
      id:
        e?.idEvento ??
        e?.id_evento ??
        e?.id ??
        e?.eventoId ??
        e?.evento_id ??
        null,
      nome:
        e?.nomeEvento ??
        e?.nome_evento ??
        e?.nome ??
        (e?.titulo || `Evento ${e?.idEvento ?? e?.id ?? "—"}`),
      raw: e,
    }))
    .filter((ev) => ev.id != null);
}

export default function Feedbacks_M1() {
  const [currentEventoId, setCurrentEventoId] = useState(ID_EVENTO_INICIAL);

  const [evento, setEvento] = useState(null);
  const [listaPresenca, setListaPresenca] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);

  // modal de visualização de um feedback
  const [modalData, setModalData] = useState(null);

  // NOVO: modal inicial para escolher evento
  const [mostrarSeletorEventos, setMostrarSeletorEventos] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [eventosLoading, setEventosLoading] = useState(false);
  const [eventosErro, setEventosErro] = useState(null);

  const rotasPersonalizadas = [
    { texto: "Visão Geral", rota: "/admin/dashboard", img: Visao },
    { texto: "Eventos", rota: "/admin/eventos", img: Calendario },
    { texto: "Usuários", rota: "/admin/lista-usuarios", img: Lista },
    { texto: "Feedbacks", rota: "/admin/feedbacks", img: feedback },
    { texto: "Meu Perfil", rota: "/admin/meu-perfil", img: MeuPerfil },
  ];

  // NOVO: busca da lista de eventos quando o seletor abrir
  useEffect(() => {
    if (!mostrarSeletorEventos) return;

    let vivo = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setEventosLoading(true);
        setEventosErro(null);
        const lista = await buscarTodosEventos(ctrl.signal);
        if (!vivo) return;
        setEventos(lista);
      } catch (e) {
        if (!vivo) return;
        console.error("[ERRO LISTA EVENTOS]", e);
        setEventosErro("Falha ao carregar lista de eventos.");
      } finally {
        if (vivo) setEventosLoading(false);
      }
    })();

    return () => {
      vivo = false;
      ctrl.abort();
    };
  }, [mostrarSeletorEventos]);

  // carrega dados do evento selecionado
  useEffect(() => {
    if (!currentEventoId) return;

    let vivo = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErro(null);

        const results = await Promise.allSettled([
          buscarEventoPorId(currentEventoId, ctrl.signal),
          buscarListaPresencaEvento(currentEventoId, ctrl.signal),
          buscarFeedbacksDoEvento(currentEventoId, ctrl.signal),
        ]);

        if (!vivo) return;

        const [evRes, listaRes, fbRes] = results;

        if (evRes.status === "fulfilled") {
          setEvento(evRes.value ?? null);
        } else {
          setEvento(null);
        }

        if (listaRes.status === "fulfilled") {
          const normalizado = Array.isArray(listaRes.value)
            ? listaRes.value
            : [];
          setListaPresenca(normalizado);
        } else {
          setListaPresenca([]);
        }

        if (fbRes.status === "fulfilled") {
          setFeedbacks(Array.isArray(fbRes.value) ? fbRes.value : []);
        } else {
          setFeedbacks([]);
        }
      } catch (e) {
        if (!vivo) return;
        console.error("[ERRO GERAL FETCH M1]", e);
        setErro("Falha ao carregar dados do evento/feedbacks.");
      } finally {
        if (vivo) setLoading(false);
      }
    })();

    return () => {
      vivo = false;
      ctrl.abort();
    };
  }, [currentEventoId]);

  // agregados de like/dislike/total
  const agregados = useMemo(() => {
    let like = 0;
    let dislike = 0;
    let total = 0;
    for (const f of feedbacks) {
      const nota = (f?.nota?.tipoNota || f?.nota?.tipo_nota || "").toLowerCase();
      if (nota === "like") like += 1;
      else if (nota === "dislike") dislike += 1;
      total += 1;
    }
    return { like, dislike, total };
  }, [feedbacks]);

  // KPIs de presença
  function contarPresentes(arr) {
    return arr.filter((p) => {
      const insc = p.is_inscrito ?? p.isInscrito ?? p.inscrito;
      const pres = p.is_presente ?? p.isPresente ?? p.presente;
      return (insc === 1 || insc === true) && (pres === 1 || pres === true);
    }).length;
  }

  const kpisPresenca = useMemo(() => {
    const participantes = Array.isArray(listaPresenca) ? listaPresenca : [];

    const totalInscritos = participantes.filter((p) => {
      const insc = p.is_inscrito ?? p.isInscrito ?? p.inscrito;
      return insc === 1 || insc === true;
    }).length;

    const totalPresentes = contarPresentes(participantes);

    const totalAusentes = Math.max(totalInscritos - totalPresentes, 0);

    return {
      inscritos: totalInscritos,
      presentes: totalPresentes,
      ausentes: totalAusentes,
    };
  }, [listaPresenca]);

  // Chart.js config
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

  const nomeEventoHeader =
    evento?.nome_evento ?? evento?.nomeEvento ?? `Evento ${currentEventoId}`;

  // NOVO: ação Selecionar no modal
  function selecionarEvento(id) {
    setCurrentEventoId(id);
    setMostrarSeletorEventos(false);
  }

  return (
    <div className="TelaComNavLateral pagina-feedbacks">
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />

      <div className="MainContentFeedbackM1">
        {/* Header do evento */}
        <div className="headerEvento">
          <div className="headerLeft">
            <div className="headerLegenda">Evento</div>
            <div className="headerTitulo" title={nomeEventoHeader}>
              {nomeEventoHeader}
            </div>
          </div>

          <div className="headerMeta">
            <div className="metaLabel">Feedbacks:</div>
            <div className="metaValor">{agregados.total}</div>

            {/* === NOVO: botão para reabrir o seletor de eventos === */}
            <button
              className="btnTrocarEvento"
              onClick={() => setMostrarSeletorEventos(true)}
              aria-label="Trocar evento"
              title="Trocar evento"
            >
              Trocar evento
            </button>
          </div>
        </div>

        {/* KPIs + gráfico */}
        <div className="boxTopFeedback">
          <div className="boxDashboardFeedback">
            <div className="dashPalestra">
              <div className="cardMini azul">
                <div className="cardTitle">Total de inscritos</div>
                <div className="cardValue big">{kpisPresenca.inscritos}</div>
              </div>

              <div className="cardMini verde">
                <div className="cardTitle">Total de presentes</div>
                <div className="cardValue big">{kpisPresenca.presentes}</div>
              </div>

              <div className="cardMini vermelho">
                <div className="cardTitle">Total de ausentes</div>
                <div className="cardValue big">{kpisPresenca.ausentes}</div>
              </div>

              <div className="cardMini amarelo">
                <div className="cardTitle">Total de feedbacks</div>
                <div className="cardValue big">{agregados.total}</div>
              </div>
            </div>

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

        {/* Lista de feedbacks */}
        <div className="boxLowFeedback">
          <div className="tituloFeedback tituloFeedbackLow">
            Lista de feedbacks do evento
          </div>

          <div className="boxListaFeedback">
            <div className="colunas">
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

              // normaliza nota: "like" | "dislike" | ""
              const notaAtual = (
                fb?.nota?.tipoNota || fb?.nota?.tipo_nota || fb?.nota || ""
              ).toLowerCase();

              return (
                <div className="linhas" key={fb.idFeedback ?? i}>
                  <div className="colunaFeedback">{nomeEventoLinha}</div>
                  <div className="colunaNome">{nomeUsuarioLinha}</div>
                  <div className="colunaEmail">{emailUsuarioLinha}</div>
                  <div className="boxBotaoFeedback">
                    <button
                      className="botaoMaisInfoFeedback"
                      onClick={() =>
                        setModalData({
                          ...fb,
                          nota: notaAtual,
                          comentario: fb.comentario || "",
                        })
                      }
                    >
                      + Mais Informações
                    </button>
                  </div>
                </div>
              );
            })}

            {!feedbacks.length && !loading && (
              <div className="linhas linhasVazia">
                Nenhum feedback para este evento.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalhe do feedback (já existia) */}
      {modalData && (
        <div
          className="feedback-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("feedback-modal-overlay")) {
              setModalData(null);
            }
          }}
        >
          <div className="feedback-modal">
            <button
              className="feedback-modal-close"
              onClick={() => setModalData(null)}
            >
              ×
            </button>
            <h2>Descrição do Feedback</h2>

            <label>Comentário</label>
            <div className="feedback-modal-content">
              <textarea value={modalData.comentario} readOnly />
            </div>

            <div className="feedback-modal-botoes">
              <p>Nota do Evento</p>
              <div className="feedback-modal-actions">
                <button
                  className={`nota-button ${
                    modalData.nota === "like" ? "nota-ativo" : "nota-neutra"
                  }`}
                  disabled
                >
                  {modalData.nota === "like" ? <BiSolidLike /> : <BiLike />}
                  <span>Gostei</span>
                </button>
                <button
                  className={`nota-button ${
                    modalData.nota === "dislike" ? "nota-ativo" : "nota-neutra"
                  }`}
                  disabled
                >
                  {modalData.nota === "dislike" ? (
                    <BiSolidDislike />
                  ) : (
                    <BiDislike />
                  )}
                  <span>Não Gostei</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOVO: Modal inicial de seleção de evento */}
      {mostrarSeletorEventos && (
        <div
          className="seletor-evento-overlay"
          aria-modal="true"
          role="dialog"
          onClick={(e) => {
            // bloqueia clique fora de fechar; é um pré-modal obrigatório até escolher
          }}
        >
          <div className="seletor-evento-modal" role="document">
            <h2 className="seletor-title">Selecione um evento</h2>

            {eventosLoading && (
              <div className="seletor-loading">Carregando eventos…</div>
            )}

            {eventosErro && (
              <div className="seletor-erro">
                {eventosErro}
                <button
                  className="seletor-retry"
                  onClick={() => setMostrarSeletorEventos(true)}
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!eventosLoading && !eventosErro && (
              <>
                {(!eventos || eventos.length === 0) ? (
                  <div className="seletor-vazio">Nenhum evento encontrado.</div>
                ) : (
                  <div className="seletor-tabela">
                    <div className="seletor-head">
                      <div className="col-id">ID</div>
                      <div className="col-nome">Nome</div>
                      <div className="col-acao"></div>
                    </div>

                    <div className="seletor-body">
                      {eventos.map((ev) => (
                        <div className="seletor-row" key={ev.id}>
                          <div className="col-id">{ev.id}</div>
                          <div className="col-nome" title={ev.nome}>
                            {ev.nome}
                          </div>
                          <div className="col-acao">
                            <button
                              className="btn-selecionar-evento"
                              onClick={() => selecionarEvento(ev.id)}
                              aria-label={`Selecionar evento ${ev.nome}`}
                            >
                              Selecionar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
