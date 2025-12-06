import React, { useEffect, useState } from "react";
import "../styles/TabelaEventos.css";
import { IoBusinessOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import api from "../api/api"; // Axios já configurado com baseURL

export function TabelaEventos({ eventos = [], onTogglePresenca }) {
  const [detalhesEventos, setDetalhesEventos] = useState({}); // guarda dados completos por evento

  const formatarData = (dataStr) => {
    if (!dataStr) return "-";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // Buscar dados completos + foto
  useEffect(() => {
    const fetchDetalhes = async () => {
      const novoDetalhes = {};
      for (const ev of eventos) {
        try {
          const res = await api.get(`/eventos/${ev.eventoId}`);
          const detalhe = res.data;

          // buscar foto
          let imagemUrl = null;
          try {
            const imgRes = await api.get(`/eventos/foto/${ev.eventoId}`, {
              responseType: "blob",
            });
            imagemUrl = URL.createObjectURL(imgRes.data);
          } catch {
            console.warn(`Foto não encontrada para evento ${ev.eventoId}`);
          }

          novoDetalhes[ev.eventoId] = { ...detalhe, imagemUrl };
        } catch (err) {
          console.error(
            `Erro ao buscar detalhes do evento ${ev.eventoId}:`,
            err
          );
        }
      }
      setDetalhesEventos(novoDetalhes);
    };

    if (eventos.length > 0) fetchDetalhes();
  }, [eventos]);

  const mostrarDetalhes = (evento) => {
    const data = detalhesEventos[evento.eventoId];
    if (!data) {
      Swal.fire({
        title: "Erro!",
        text: "Não foi possível carregar as informações do evento.",
        icon: "error",
        confirmButtonColor: "#FF4848",
      });
      return;
    }

    const titulo = evento.nome || "Evento";
    const descricao = data.descricao || "Sem descrição";
    const dataFormat = formatarData(data.dia);
    const horaInicio = data.horaInicio || "-";
    const horaFim = data.horaFim || "-";
    const vagas = data.qtdVaga ?? "Evento aberto ao público";
    const categoria = data.categoria?.nome || "-";
    const status = data.statusEvento?.situacao || "-";
    const publico = data.publicoAlvo || "Público";
    const imgUrl = data.imagemUrl || null;

    let localStr = "Local não informado";
    if (data.endereco) {
      const e = data.endereco;
      const partes = [];
      if (e.logradouro)
        partes.push(e.logradouro + (e.numero ? `, ${e.numero}` : ""));
      if (e.bairro) partes.push(e.bairro);
      localStr = partes.join(" - ");
    }

    const imgHtml = imgUrl
      ? `<img src="${imgUrl}" alt="${titulo}" class="sw-img" />`
      : `<div class="sw-img sw-noimg">Sem imagem</div>`;

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
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "my-swal compact-swal",
        title: "swal2-title my-swal-title",
        content: "swal2-content my-swal-content",
        closeButton: "swal2-close my-swal-close",
      },
      buttonsStyling: false,
    });
  };

  return (
    <div className="tabela-container">
      <table className="tabela-eventos">
        <thead>
          <tr>
            <th>Eventos ⬇</th>
            <th>Data</th>
            <th>Presença</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((ev) => (
            <tr key={ev.eventoId}>
              <td>
                <div className="evento-col">
                  <IoBusinessOutline className="evento-icon" />
                  {ev.nome}
                </div>
              </td>
              <td>
                {detalhesEventos[ev.eventoId]
                  ? formatarData(detalhesEventos[ev.eventoId].dia)
                  : "-"}
              </td>
              <td>
                <div
                  className={`switch-3 ${
                    ev.status === 1
                      ? "pendente"
                      : ev.status === 2
                      ? "confirmada"
                      : "cancelada"
                  }`}
                  onClick={() => onTogglePresenca(ev)}
                  role="button"
                  aria-label={`Alterar status do evento ${ev.nome}`}
                >
                  <div className="ball" />
                </div>
              </td>
              <td>
                <button
                  className="btn-mais-info"
                  onClick={() => mostrarDetalhes(ev)}
                >
                  Mais Informações
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
