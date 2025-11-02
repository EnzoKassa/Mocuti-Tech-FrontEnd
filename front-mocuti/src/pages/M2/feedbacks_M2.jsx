import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";
import { NavLateral } from "../../components/NavLateral";
import EventosTable from "../../components/table_Feedbacks_M2";
import ModalFeedback from "../../components/modal/Modal_Feedback_M2";
import ModalVisualizacao from "../../components/modal/Modal_FeedbackVisul_M2";
import "../../styles/FeedbacksM2.css";

// Imagens usadas no menu
import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import convite from "../../assets/images/convitesLogo.svg";

const NOTAS_MAP = { like: 1, dislike: 2 };

const FeedbacksM2 = () => {
  const { user } = useAuth();
  const idUsuario =
    user?.id ||
    localStorage.getItem("idUsuario") ||
    sessionStorage.getItem("idUsuario");

  const [participacoes, setParticipacoes] = useState([]);
  const [eventosPassados, setEventosPassados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);

  const rotasPersonalizadas = [
    { texto: "Eventos", img: Calendario, rota: "/moderador/eventos" },
    { texto: "Convites", img: convite, rota: "/moderador/convites" },
    { texto: "Meu Perfil", img: MeuPerfil, rota: "/moderador/perfil" },
    { texto: "Feedbacks", img: feedback, rota: "/moderador/feedbacks" },
  ];

  useEffect(() => {
    if (!idUsuario) return;

    const fetchEventos = async () => {
      try {
        const { data: paraComentar } = await axios.get(
          `http://localhost:8080/participacoes/participacao-comentar/${idUsuario}`
        );
        const { data: passados } = await axios.get(
          `http://localhost:8080/participacoes/participacao-passados/${idUsuario}`
        );
        const normalize = (arr) =>
          arr.map((p) => ({ ...p, nota: p.nota?.tipoNota || null }));
        setParticipacoes(normalize(paraComentar));
        setEventosPassados(normalize(passados));
      } catch (err) {
        setError("Erro ao buscar participações: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [idUsuario]);

  const handleFeedback = async (p) => {
    try {
      const notaString = typeof p.nota === "string" ? p.nota : null;

      const body = {
        idUsuario: parseInt(idUsuario),
        idEvento: p.id.eventoId,
        comentario: p.comentario || null,
        idNota: notaString ? NOTAS_MAP[notaString] : null,
      };

      const { data: updated } = await axios.post(
        "http://localhost:8080/feedback",
        body,
        { headers: { "Content-Type": "application/json" } }
      );

      setParticipacoes((prev) =>
        prev.map((ev) =>
          ev.id.eventoId === p.id.eventoId
            ? {
                ...ev,
                feedbackId: updated.idFeedback,
                nota: notaString,
                comentario: updated.comentario,
              }
            : ev
        )
      );

      if (modalData && modalData.id.eventoId === p.id.eventoId) {
        setModalData((prev) => ({
          ...prev,
          nota: notaString,
          comentario: prev.comentario,
        }));
      }
    } catch (err) {
      console.error("Erro no feedback:", err);
    }
  };

  if (loading) return <p>Carregando participações...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>

    <div className="MainFeedbackM2">
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />
     
        <div className="scroll-page">
          <div className="feedback">
            <div className="m2-feedback-container">
              <div className="feedback-title">Feedbacks</div>
              <h1>Eventos para comentar</h1>
              <EventosTable
                eventos={participacoes}
                onFeedback={handleFeedback}
                onDetalhes={(p) => setModalData(p)}
                editable={true}
              />

              <h1>Eventos passados</h1>
              <EventosTable
                eventos={eventosPassados}
                onDetalhes={(p) => setModalData({ ...p, isPassado: true })}
                editable={false}
              />

              {modalData && modalData.isPassado && (
                <ModalVisualizacao
                  modalData={modalData}
                  onClose={() => setModalData(null)}
                />
              )}

              {modalData && !modalData.isPassado && (
                <ModalFeedback
                  modalData={modalData}
                  onClose={() => setModalData(null)}
                  onSave={handleFeedback}
                />
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default FeedbacksM2;


