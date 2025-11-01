import React from "react";
import {
  BiLike,
  BiSolidLike,
  BiDislike,
  BiSolidDislike,
} from "react-icons/bi";
import "../styles/EventosTable.css";

const EventosTable = ({ eventos, onFeedback, onDetalhes, editable }) => {
  return (
    <div className="feedback-table-wrapper">
      <table className="feedback-table">
        {/* colgroup garante colunas estáveis e alinhamento consistente */}
        <colgroup>
          <col className="col-name" />
          <col className="col-nota" />
          <col className="col-actions" />
        </colgroup>

        <thead>
          <tr>
            <th>Nome Evento</th>
            <th>Nota</th>
            <th>Mais Informações</th>
          </tr>
        </thead>

        <tbody>
          {eventos.map((p) => (
            <tr key={`${p.id.usuarioId}-${p.id.eventoId}`}>
              {/* NOME do evento - agora com wrapper para controle de overflow/alinhamento */}
              <td>
                <div className="nome-evento">{p.nomeEvento}</div>
              </td>

              {/* NOTA - se editável mostra botões, senão mostra ícones de leitura */}
              <td className="nota-cell">
                {editable ? (
                  <div className="feedback-toggle-buttons">
                    <button
                      className={`nota-button ${p.nota === "like" ? "active" : ""}`}
                      onClick={() =>
                        onFeedback({ ...p, nota: p.nota === "like" ? null : "like" })
                      }
                    >
                      {p.nota === "like" ? <BiSolidLike /> : <BiLike />}
                    </button>

                    <button
                      className={`nota-button ${p.nota === "dislike" ? "active" : ""}`}
                      onClick={() =>
                        onFeedback({ ...p, nota: p.nota === "dislike" ? null : "dislike" })
                      }
                    >
                      {p.nota === "dislike" ? <BiSolidDislike /> : <BiDislike />}
                    </button>
                  </div>
                ) : (
                  // leitura: mostra os dois ícones (mesmo tamanho), sem ação
                  <div className="feedback-toggle-buttons read-only">
                    <span className="nota-read">
                      {p.nota === "like" ? <BiSolidLike /> : <BiLike />}
                    </span>
                    <span className="nota-read">
                      {p.nota === "dislike" ? <BiSolidDislike /> : <BiDislike />}
                    </span>
                  </div>
                )}
              </td>

              {/* AÇÃO - botão centralizado */}
              <td>
                <div className="cell-actions">
                  <button className="feedback-button" onClick={() => onDetalhes(p)}>
                    + Mais Informações
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventosTable;


