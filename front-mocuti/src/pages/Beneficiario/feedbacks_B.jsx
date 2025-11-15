import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import ModalFeedback from "../../components/modal/Modal_Feedback_M2";
import ModalVisualizacao from "../../components/modal/Modal_FeedbackVisul_M2";
import axios from "axios";
import "../../styles/meusEventos.css";
import Swal from "sweetalert2";

export default function FeedbackBeneficiario() {
  const NOTAS_MAP = { like: 1, dislike: 2 };

  const navigate = useNavigate();
  const { user } = useAuth();
  const idUsuario =
    user?.id ||
    localStorage.getItem("idUsuario") ||
    sessionStorage.getItem("idUsuario");

  const [participacoes, setParticipacoes] = useState([]);
  const [eventosPassados, setEventosPassados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);

  const botoesNav = [
    {
      onClick: () => navigate("/usuario/eventos"),
      label: "Eventos",
      className: "btn-inicio",
    },
    {
      onClick: () => navigate("/usuario/perfil"),
      label: "Meu Perfil",
      className: "btn-sobre",
    },
    {
      onClick: () => navigate("/usuario/meus-eventos"),
      label: "Meus Eventos",
      className: "btn-linha",
    },
    {
      onClick: () => navigate("/usuario/feedback"),
      label: "Feedback",
      className: "btn-comentarios",
    },
    
  ];

  useEffect(() => {
    if (!idUsuario) return;

    const fetchEventos = async () => {
      try {
        setLoading(true);
        const resParaComentar = await fetch(
          `http://localhost:8080/participacoes/participacao-comentar/${idUsuario}`
        );
        const resPassados = await fetch(
          `http://localhost:8080/participacoes/participacao-passados/${idUsuario}`
        );

        const dataParaComentar = resParaComentar.ok
          ? await resParaComentar.json()
          : [];
        const dataPassados = resPassados.ok ? await resPassados.json() : [];

        // Função para buscar detalhes + foto
        const enrichEvento = async (p) => {
          const eventoId = p.idEvento || p.id?.eventoId;
          if (!eventoId) return p;

          const res = await fetch(`http://localhost:8080/eventos/${eventoId}`);
          const eventoDetalhes = res.ok ? await res.json() : {};

          let imagemUrl = null;
          const imgRes = await fetch(
            `http://localhost:8080/eventos/foto/${eventoId}`
          );
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            imagemUrl = URL.createObjectURL(blob);
          }

          return {
            ...p,
            ...eventoDetalhes,
            imagemUrl,
            nota: p.nota?.tipoNota || null,
          };
        };

        const participacoesEnriquecidas = await Promise.all(
          dataParaComentar.map(enrichEvento)
        );
        const passadosEnriquecidos = await Promise.all(
          dataPassados.map(enrichEvento)
        );

        setParticipacoes(participacoesEnriquecidas);
        setEventosPassados(passadosEnriquecidos);
      } catch (err) {
        console.error("Erro ao buscar eventos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [idUsuario]);

  // Função para formatar datas
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

  // Função para formatar horas
  const formatarHora = (horaStr) => {
    if (!horaStr) return "";
    return horaStr.substring(0, 5);
  };

  const mostrarDetalhes = async (participacao) => {
    try {
      const eventoId = participacao.idEvento || participacao.id?.eventoId;
      if (!eventoId) return;

      // Pega os detalhes do evento
      const res = await fetch(`http://localhost:8080/eventos/${eventoId}`);
      if (!res.ok) throw new Error("Não foi possível buscar o evento");
      const evento = await res.json();

      // Pega a foto do evento
      let imagemUrl = null;
      const imgRes = await fetch(
        `http://localhost:8080/eventos/foto/${eventoId}`
      );
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        imagemUrl = URL.createObjectURL(blob);
      }

      const html = `
      <div class="sw-modal">
        <div class="sw-left">
          ${
            imagemUrl
              ? `<img src="${imagemUrl}" alt="${evento.nomeEvento}" class="sw-img"/>`
              : `<div class="sw-img sw-noimg">Sem imagem</div>`
          }
          <div class="sw-desc">
            <h4>Descrição:</h4>
            <p>${evento.descricao || "Sem descrição."}</p>
          </div>
        </div>
        <div class="sw-right">
          <div class="sw-row"><strong>Data:</strong> ${formatarData(
            evento.dia
          )}</div>
          <div class="sw-row"><strong>Hora:</strong> ${formatarHora(
            evento.horaInicio
          )} - ${formatarHora(evento.horaFim)}</div>
          <div class="sw-row"><strong>Local:</strong> ${
            evento.endereco?.logradouro || "-"
          }</div>
          <div class="sw-row"><strong>Nº de vagas:</strong> ${
            evento.qtdVaga || "-"
          }</div>
          <div class="sw-row"><strong>Status:</strong> ${
            evento.statusEvento?.situacao || "-"
          }</div>
          <div class="sw-row"><strong>Categoria:</strong> ${
            evento.categoria?.nome || "-"
          }</div>
          <div class="sw-row"><strong>Público Alvo:</strong> ${
            evento.publicoAlvo || "-"
          }</div>
        </div>
      </div>
    `;

      Swal.fire({
        title: evento.nomeEvento,
        html,
        showCloseButton: true,
        confirmButtonText: "Fechar",
        customClass: {
          popup: "my-swal compact-swal",
          title: "swal2-title my-swal-title",
          content: "swal2-content my-swal-content",
          closeButton: "swal2-close my-swal-close",
          confirmButton: "sw-btn sw-btn-confirm",
        },
        buttonsStyling: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Erro",
        "Não foi possível carregar detalhes do evento",
        "error"
      );
    }
  };

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

  // Função para abrir modal de feedback
  // Para eventos para comentar
  const abrirFeedbackEdit = (evento) => {
    setModalData({ ...evento, isPassado: false });
  };

  // Para eventos passados
  const abrirFeedbackView = (evento) => {
    setModalData({ ...evento, isPassado: true });
  };
  if (loading) return <p>Carregando eventos...</p>;

  return (
    <div className="scroll-page-usuario">
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />

      <div className="meus-eventos-beneficiario">
        <div className="feedback-container">
          <div
            className="eventos-unificado"
            style={{
              background: "#F5F5F5",
              padding: 0,
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            <h1 style={{ marginTop: 0, padding: "0 0 0 100px", marginBottom: "10px" }}>
              Eventos para comentar
            </h1>
            <div style={{ marginTop: 8 }}>
              <EspacoEventosBeneficiario
                eventos={participacoes}
                mostrarParticipar={false}
                hideParticipar={true}
                onOpenModal={mostrarDetalhes} // Mostra infos
                showFeedbackButton={true} // Botão aparece só aqui
                onFeedbackClick={abrirFeedbackEdit} // Abre modal M2
              />
            </div>

            <h1 style={{ marginTop: 32, paddingLeft: "100px", marginBottom: "10px" }}>
              Eventos passados
            </h1>
            <div style={{ marginTop: 8 }}>
              <EspacoEventosBeneficiario
                eventos={eventosPassados}
                mostrarParticipar={false}
                hideParticipar={true}
                onOpenModal={mostrarDetalhes}
                showFeedbackButton={true} // Botão aparece só aqui
                onFeedbackClick={abrirFeedbackView} // Abre modal M2
                feedbackLabel="Ver comentário" // ou "Avaliar", "Responder", etc
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Feedback */}
      {modalData && !modalData.isPassado && (
        <ModalFeedback
          modalData={modalData}
          onClose={() => setModalData(null)}
          onSave={(p) => {
            // Atualiza feedback
            setParticipacoes((prev) =>
              prev.map((ev) =>
                ev.id.eventoId === p.id.eventoId
                  ? { ...ev, nota: p.nota, comentario: p.comentario }
                  : ev
              )
            );
            setModalData(null);
          }}
        />
      )}

      {/* Modal Feedback */}
      {modalData &&
        (modalData.isPassado ? (
          <ModalVisualizacao
            modalData={modalData}
            onClose={() => setModalData(null)}
          />
        ) : (
          <ModalFeedback
            modalData={modalData}
            onClose={() => setModalData(null)}
            onSave={handleFeedback} // só eventos para comentar
          />
        ))}
    </div>
  );
}
