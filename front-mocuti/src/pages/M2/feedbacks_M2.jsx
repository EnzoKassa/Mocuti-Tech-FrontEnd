import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/feedback_M2.css";

const FeedbacksM2 = () => {
  const { user } = useAuth();
  const idUsuario =
    user?.id ||
    localStorage.getItem("idUsuario") ||
    sessionStorage.getItem("idUsuario");

  const [participacoes, setParticipacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);

  const NOTAS_MAP = {
    positivo: 1,
    negativo: 2,
  };

  useEffect(() => {
    if (!idUsuario) return;
    fetch(`http://localhost:8080/participacoes/filtradas/${idUsuario}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar participações");
        return res.json();
      })
      .then((data) => {
        setParticipacoes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [idUsuario]);

  const handleFeedback = async (p) => {
    try {
      const body = {
        idUsuario: parseInt(idUsuario),
        idEvento: p.id.eventoId,
        comentario: p.comentario || null,
        idNota: p.nota ? NOTAS_MAP[p.nota] : null,
      };

      const res = await fetch(`http://localhost:8080/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erro ao salvar feedback");

      const updated = await res.json();

      setParticipacoes((prev) =>
        prev.map((ev) =>
          ev.id.eventoId === p.id.eventoId
            ? {
                ...ev,
                feedbackId: updated.idFeedback,
                nota: updated.nota?.tipo || p.nota,
                comentario: updated.comentario,
              }
            : ev
        )
      );
    } catch (err) {
      console.error("Erro no feedback:", err);
    }
  };

  if (loading) return <p>Carregando participações...</p>;
  if (error) return <p>{error}</p>;
  if (participacoes.length === 0) return <p>Nenhuma participação encontrada.</p>;

  return (
    <div className="feedback-container">
      <h1>Feedbacks</h1>
      <div className="feedback-table-wrapper">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Nome Evento</th>
              <th>Email</th>
              <th>Nota</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {participacoes.map((p) => (
              <tr key={`${p.id.usuarioId}-${p.id.eventoId}`}>
                <td>{p.nomeEvento}</td>
                <td>{p.email}</td>
                <td className="text-center">
                  {p.nota === "positivo"
                    ? "👍"
                    : p.nota === "negativo"
                    ? "👎"
                    : "-"}
                </td>
                <td>
                  <button
                    className="feedback-button"
                    onClick={() => setModalData(p)}
                  >
                    + Mais Informações
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalData && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <button
              className="feedback-modal-close"
              onClick={() => setModalData(null)}
            >
              ×
            </button>
            <h2>Descrição do Feedback</h2>

            <div>
              <label>Nome</label>
              <input type="text" value={modalData.email} readOnly />
            </div>

            <div>
              <label>Comentário</label>
              <textarea value={modalData.comentario || ""} readOnly />
            </div>

            <div className="feedback-modal-actions">
              <button
                className={`nota-button ${
                  modalData.nota === "positivo"
                    ? "nota-positivo"
                    : "nota-neutra"
                }`}
              >
                👍 <span>Gostei</span>
              </button>
              <button
                className={`nota-button ${
                  modalData.nota === "negativo"
                    ? "nota-negativo"
                    : "nota-neutra"
                }`}
              >
                👎 <span>Não Gostei</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbacksM2;
