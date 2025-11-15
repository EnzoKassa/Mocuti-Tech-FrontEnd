/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../styles/EspacoEventosBeneficiario.css";
import calendar from "../assets/images/calendar.png";
import people from "../assets/images/Person.png";
import { fetchInscritosCargo2Count } from "../api/api";

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
        confirmButton: "sw-btn sw-btn-confirm"
      },
      buttonsStyling: false,
    });
  };

  return (
    <div className="espaco-eventos-beneficiario-geral">
      <div className="espaco-eventos-beneficiario-engloba-eventos">
        <div className="espaco-eventos-beneficiario-eventos">
          <div className="espaco-eventos-beneficiario-lista">
            {(!eventos || eventos.length === 0) && (
              <p>Nenhum evento encontrado.</p>
            )}
            {eventos.map((evento, idx) => {
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
                      <div className="eventos-categoria-beneficiario">
                        Categoria:{" "}
                        <a href="#">
                          {evento.categoriaNome ||
                            evento.categoria?.nome ||
                            "Não informada"}
                        </a>
                      </div>
                      <div className="eventos-status-beneficiario">
                        Status:{" "}
                        <a href="#">
                          {evento.status_evento ||
                            evento.statusEvento?.situacao ||
                            "Aberto"}
                        </a>
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
                      {qtdInteressado}/{qtdVaga || 0}
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
                            Swal.fire(
                              "Lotado",
                              "Este evento atingiu o número máximo de vagas.",
                              "info"
                            );
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
                          Swal.fire("Atenção", "Ação não disponível.", "info");
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
                        Enviar Feedback
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

