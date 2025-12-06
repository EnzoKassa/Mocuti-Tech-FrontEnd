/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../styles/EspacoEventosBeneficiario.css";
import calendar from "../assets/images/calendar.png";
import people from "../assets/images/Person.png";
import api, { fetchInscritosCargo2Count } from "../api/api";
import { getCategoryColor, getStatusColor } from "../utils/badgeColors";

export default function EspacoEventosBeneficiario({
  eventos = [],
  onParticipar,
  onInscrever,
  onMostrarDetalhes,
  showParticipar = true,
  mostrarParticipar,
  hideParticipar = false,
  onOpenModal,
  showFeedbackButton = false, // NOVO: controla se o botão aparece
  onFeedbackClick, // opcional: callback ao clicar
  feedbackLabel = "Enviar Feedback",
}) {
  const exibirParticipar =
    hideParticipar === true
      ? false
      : typeof showParticipar === "boolean"
      ? showParticipar
      : typeof mostrarParticipar === "boolean"
      ? mostrarParticipar
      : true;

  const formatarData = (dataStr) => {
    if (!dataStr) return "";
    const datePart = dataStr.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      return `${d}/${m}/${y.slice(-2)}`;
    }
    const dObj = new Date(dataStr);
    if (!isNaN(dObj.getTime())) {
      const dia = String(dObj.getDate()).padStart(2, "0");
      const mes = String(dObj.getMonth() + 1).padStart(2, "0");
      const ano = String(dObj.getFullYear()).slice(-2);
      return `${dia}/${mes}/${ano}`;
    }
    return dataStr;
  };

  const formatarHora = (horaStr) => {
    if (!horaStr) return "";
    return horaStr.substring(0, 5);
  };

  const mostrarDetalhesLocal = (evento) => {
    const titulo = evento.nomeEvento || evento.nome || "Evento";
    const descricao =
      evento.descricao || evento.descricaoEvento || "Sem descrição.";
    const dataFormat = formatarData(evento.dia || evento.dataInicio || "");
    const horaInicio = evento.horaInicio
      ? formatarHora(evento.horaInicio)
      : "-";
    const horaFim = evento.horaFim ? formatarHora(evento.horaFim) : "-";
    const local =
      evento.local || evento.endereco || evento.rua || "Local não informado";
    const vagas = evento.qtdVaga ? evento.qtdVaga : "Evento aberto ao público";
    const publico = evento.publico || "Público";
    const categoria = evento.categoria?.nome || evento.categoriaNome || "-";
    const status = evento.statusEvento?.situacao || evento.status || "-";
    const img = evento.imagemUrl
      ? `<img src="${evento.imagemUrl}" alt="${titulo}" class="sw-img" />`
      : `<div class="sw-img sw-noimg">Sem imagem</div>`;

    const html = `
      <div class="sw-modal">
        <div class="sw-left">
          ${img}
          <div class="sw-desc">
            <h4>Descrição:</h4>
            <p>${descricao}</p>
          </div>
        </div>
        <div class="sw-right">
          <div class="sw-row"><strong>Data:</strong> ${dataFormat}</div>
          <div class="sw-row"><strong>Hora:</strong> ${horaInicio} - ${horaFim}</div>
          <div class="sw-row"><strong>Local:</strong> ${local}</div>
          <div class="sw-row"><strong>Nº de vagas:</strong> ${vagas}</div>
          <div class="sw-row"><strong>Status:</strong> ${status}</div>
          <div class="sw-row"><strong>Categoria:</strong> ${categoria}</div>
          <div class="sw-row"><strong>Público Alvo:</strong> ${publico}</div>
        </div>
      </div>
    `;

    Swal.fire({
      title: titulo,
      html,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: "Fechar",
      cancelButtonText: null,
      customClass: {
        popup: "my-swal compact-swal",
        title: "swal2-title my-swal-title",
        content: "swal2-content my-swal-content",
        closeButton: "swal2-close my-swal-close",
        confirmButton: "sw-btn sw-btn-confirm",
      },
      buttonsStyling: false,
    });
  };

  // Badge simples e segura (não altera comportamento externo)
  const [countsMap, setCountsMap] = useState({});

  // busca counts para eventos que não providenciam inscritosCount
  useEffect(() => {
    let mounted = true;
    const idsToFetch = (eventos || [])
      .map((ev) => ev?.idEvento ?? ev?.id ?? ev?.id_evento)
      .filter(Boolean)
      .filter(
        (id) =>
          countsMap[id] === undefined &&
          !(
            eventos.find((e) => (e.idEvento || e.id || e.id_evento) == id)
              ?.inscritosCount !== undefined
          )
      );

    if (idsToFetch.length === 0) return;

    (async () => {
      const newCounts = {};
      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const c = await fetchInscritosCargo2Count(id);
            newCounts[id] = Number.isFinite(Number(c)) ? Number(c) : 0;
          } catch (e) {
            newCounts[id] = 0;
          }
        })
      );
      if (!mounted) return;
      setCountsMap((prev) => ({ ...prev, ...newCounts }));
    })();

    return () => {
      mounted = false;
    };
  }, [eventos]); // eslint-disable-line react-hooks/exhaustive-deps

  const Badge = ({ text = "", bg = "#999", style = {} }) => (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: "#fff",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        lineHeight: "18px",
        marginRight: 8,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {text}
    </span>
  );

  // normaliza e retorna timestamp do evento (prioriza campos comuns)
  const getEventTimestamp = (ev) => {
    if (!ev) return Infinity;
    const candidates = [
      ev.data_evento,
      ev.dia,
      ev.dataInicio,
      ev.data_inicio,
      ev.data,
      ev.dataEvento,
    ].filter(Boolean);
    // também aceita campos com tempo em ISO
    const s = candidates.length ? candidates[0] : null;
    if (!s) return Infinity;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.getTime();
    // último recurso: tentar extrair yyyy-mm-dd com regex
    const m = String(s).match(/(\d{4}-\d{2}-\d{2})/);
    if (m) {
      const d2 = new Date(m[1]);
      if (!isNaN(d2.getTime())) return d2.getTime();
    }
    return Infinity;
  };

  // calcula lista visível: NÃO filtrar por status aqui (mostrar todos), mas ordenar
  const visibleEventos = Array.isArray(eventos)
    ? [...eventos].sort((a, b) => {
        const ta = getEventTimestamp(a);
        const tb = getEventTimestamp(b);
        return ta - tb;
      })
    : [];

  return (
    <div className="espaco-eventos-beneficiario-geral">
      <div className="espaco-eventos-beneficiario-engloba-eventos">
        <div className="espaco-eventos-beneficiario-eventos">
          <div className="espaco-eventos-beneficiario-lista">
            {(!eventos || eventos.length === 0) && (
              <p>Nenhum evento encontrado.</p>
            )}
            {visibleEventos.map((evento, idx) => {
              const qtdVaga = Number(
                evento.qtdVaga ??
                  evento.qtd_vaga ??
                  evento.qtdVagas ??
                  evento.qtd_vagas ??
                  evento.qtdVagasTotal ??
                  0
              );
              const qtdInteressado =
                Number(
                  evento.qtdInteressado ??
                    evento.qtd_interessado ??
                    evento.qtd_interessos ??
                    evento.qtdInteressos ??
                    0
                ) ||
                (Array.isArray(evento.interessados)
                  ? evento.interessados.length
                  : Array.isArray(evento.inscritos)
                  ? evento.inscritos.length
                  : 0);

              return (
                <div
                  className="eventos-beneficiario-lista"
                  key={evento.id_evento || evento.idEvento || idx}
                >
                  {evento.imagemUrl ? (
                    <img
                      src={evento.imagemUrl}
                      alt="Foto evento"
                      className="eventos-foto-beneficiario"
                    />
                  ) : (
                    <div className="evento-sem-imagem">Sem imagem</div>
                  )}

                  <div className="eventos-descricao-beneficiario">
                    <div className="eventos-titulo-beneficiario">
                      <h3>
                        {evento.nome_evento || evento.nomeEvento || evento.nome}
                      </h3>
                    </div>
                    <div className="eventos-tipocategoria-beneficiario">
                      <div
                        className="eventos-categoria-beneficiario"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 6,
                        }}
                      >
                        <span style={{ color: "#333", fontWeight: 600 }}>
                          Categoria:
                        </span>
                        <Badge
                          text={
                            evento.categoriaNome ||
                            evento.categoria?.nome ||
                            "Não informada"
                          }
                          bg={getCategoryColor(
                            evento.categoriaNome || evento.categoria?.nome || ""
                          )}
                        />
                      </div>
                      <div
                        className="eventos-status-beneficiario"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 6,
                        }}
                      >
                        <span style={{ color: "#333", fontWeight: 600 }}>
                          Status:
                        </span>
                        <Badge
                          text={
                            evento.status_evento ||
                            evento.statusEvento?.situacao ||
                            "Aberto"
                          }
                          bg={getStatusColor(
                            evento.status_evento ||
                              evento.statusEvento?.situacao ||
                              "Aberto"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="eventos-data-beneficiario">
                    <img
                      src={calendar}
                      style={{ width: "30%" }}
                      alt="Ícone de Calendário"
                    />
                    <a href="#">
                      {formatarData(evento.data_evento || evento.dia)}{" "}
                      {evento.hora_inicio || evento.horaInicio
                        ? `às ${formatarHora(
                            evento.hora_inicio || evento.horaInicio
                          )}`
                        : ""}
                    </a>
                  </div>

                  <div className="eventos-pessoas-beneficiario">
                    <img
                      src={people}
                      style={{ width: "40%" }}
                      alt="Ícone de Pessoas"
                    />
                    <a href="#">
                      <div
                        className="eventos-vagas"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <i className="icon-user" />
                        <span>
                          {(evento.inscritosCount ??
                            evento.inscritos ??
                            countsMap[
                              evento.idEvento ?? evento.id ?? evento.id_evento
                            ] ??
                            qtdInteressado ??
                            0) +
                            "/" +
                            (evento.vagas ??
                              evento.vagasMax ??
                              evento.numeroVagas ??
                              qtdVaga ??
                              0)}
                        </span>
                      </div>
                    </a>
                  </div>

                  <div className="eventos-tiposbotoes-beneficiario">
                    <button
                      style={{ backgroundColor: "#3DA5E1" }}
                      onClick={() =>
                        onMostrarDetalhes
                          ? onMostrarDetalhes(evento)
                          : onOpenModal
                          ? onOpenModal(evento)
                          : mostrarDetalhesLocal(evento)
                      }
                    >
                      Mais Informações
                    </button>

                    {exibirParticipar && (
                      <button
                        style={{
                          backgroundColor:
                            qtdVaga && qtdInteressado >= qtdVaga
                              ? "#999"
                              : "#4FBD34",
                          cursor:
                            qtdVaga && qtdInteressado >= qtdVaga
                              ? "not-allowed"
                              : "pointer",
                        }}
                        disabled={qtdVaga && qtdInteressado >= qtdVaga}
                        onClick={() => {
                          const full =
                            qtdVaga &&
                            Number(qtdInteressado ?? 0) >= Number(qtdVaga);
                          if (full) {
                            Swal.fire({
                              title: "Lotado",
                              text: "Este evento atingiu o número máximo de vagas.",
                              icon: "info",
                              confirmButtonColor: "#45AA48",
                            });

                            return;
                          }
                          if (onParticipar) {
                            onParticipar(evento);
                            return;
                          }
                          if (onInscrever) {
                            onInscrever(
                              evento.idEvento || evento.id || evento.id_evento
                            );
                            return;
                          }
                          Swal.fire({
                            title: "Atenção",
                            text: "Ação não disponível.",
                            icon: "info",
                            confirmButtonColor: "#FF4848",
                          });
                        }}
                      >
                        Quero Participar
                      </button>
                    )}

                    {showFeedbackButton && (
                      <button
                        style={{ backgroundColor: "#F5A623", marginTop: "6px" }}
                        onClick={() => {
                          if (onFeedbackClick) {
                            onFeedbackClick(evento); // dispara a função passada pela tela
                          }
                        }}
                      >
                        {feedbackLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
