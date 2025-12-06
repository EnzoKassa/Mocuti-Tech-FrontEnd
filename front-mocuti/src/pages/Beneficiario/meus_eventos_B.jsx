/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import EspacoEventosBeneficiario from "../../components/espacoeventosbeneficiario";
import Swal from "sweetalert2";
import "../../styles/meusEventos.css";
import api, { apiRefresh, fetchInscritosCargo2Count } from "../../api/api";

export default function MeusEventosBeneficiario() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const idUsuario =
    user?.id ||
    localStorage.getItem("idUsuario") ||
    sessionStorage.getItem("idUsuario");

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

  const [participacoes, setParticipacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Normaliza e busca detalhes + imagem
  const normalizeEventos = async (arr) =>
    Promise.all(
      (arr || []).map(async (p) => {
        let imagemUrl = null;
        let eventoDetalhes = null;

        try {
          const eventoId =
            p.idEvento ||
            p.id?.eventoId ||
            p.id?.evento_id ||
            (p.id && (p.id.eventoId || p.id));
          if (eventoId) {
            // detalhes do evento
            const res = await api.get(`/eventos/${eventoId}`);
            if (res.status === 200) eventoDetalhes = res.data;

            // imagem do evento
            const imgRes = await api.get(`/eventos/foto/${eventoId}`, {
              responseType: "blob",
            });
            if (imgRes.status === 200 && imgRes.data) {
              imagemUrl = URL.createObjectURL(imgRes.data);
            }
          }
        } catch (err) {
          console.warn("Erro ao buscar detalhes/imagem:", err);
        }

        let inscritosCount = 0;
        try {
          const idForCount = eventoId ?? extractEventId(p);
          if (idForCount) {
            // debug: log do id consultado e resultado
            console.debug(
              "fetchInscritosCargo2Count -> idForCount:",
              idForCount
            );
            inscritosCount = await fetchInscritosCargo2Count(idForCount);
            console.debug(
              "fetchInscritosCargo2Count -> result:",
              inscritosCount
            );
            inscritosCount = Number(inscritosCount || 0);
          }
        } catch (errCount) {
          console.debug(
            "Erro ao buscar contagem de inscritos (meus_eventos):",
            errCount
          );
        }

        return {
          ...p,
          ...(eventoDetalhes || {}),
          imagemUrl,
          idEvento:
            p.idEvento ||
            p.id?.eventoId ||
            (eventoDetalhes && eventoDetalhes.idEvento) ||
            p.id,
        };
      })
    );

  // 🔹 Busca eventos do usuário
  const fetchEventos = async () => {
    if (!idUsuario) {
      setParticipacoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const urlInscritos = `/participacoes/eventos-inscritos/${encodeURIComponent(
        idUsuario
      )}`;
      const inscritosRes = await api.get(urlInscritos);
      const inscritos = inscritosRes.status === 200 ? inscritosRes.data : [];

      const normInscritos = await normalizeEventos(inscritos);
      setParticipacoes(normInscritos);
    } catch (err) {
      console.error("Erro ao buscar participações:", err);
      setParticipacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    const onRefresh = () => fetchEventos();
    apiRefresh.addEventListener("refresh", onRefresh);
    return () => apiRefresh.removeEventListener("refresh", onRefresh);
  }, [idUsuario]);

  const cancelarInscricao = async (idEvento) => {
    if (!idUsuario) {
      Swal.fire({
        title: "Atenção",
        text: "Você precisa estar logado para cancelar a inscrição.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#f8bb86",
      });
      return;
    }

    const choice = await Swal.fire({
      title: "Confirmação",
      text: "Tem certeza que deseja cancelar sua inscrição neste evento?",
      icon: "warning",
      confirmButtonColor: "#FFC107",
      cancelButtonColor: "gray",
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Manter inscrição",
      // reverseButtons: true,
    });
    if (!choice.isConfirmed) return;

    try {
      const url = `/participacoes/${encodeURIComponent(
        idEvento
      )}/cancelar-inscricao?idUsuario=${encodeURIComponent(idUsuario)}`;
      const res = await api.delete(url);
      if (res.status === 200 || res.status === 204) {
        setParticipacoes((prev) =>
          prev.filter((ev) => String(ev.idEvento) !== String(idEvento))
        );
        Swal.fire({
          title: "Inscrição cancelada",
          text: "Sua inscrição foi cancelada.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#45AA48", // verde padrão de sucesso
        });
      } else {
        Swal.fire({
          title: "Erro",
          text: "Não foi possível cancelar a inscrição de um evento que já está em andamento ou encerrado.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#FF4848",
        });
      }
    } catch (err) {
      console.error("Erro ao cancelar inscrição:", err);

      const msg =
        err.response?.data?.message ||
        "Não foi possível cancelar a inscrição de um evento que já está em andamento ou encerrado.";
      Swal.fire({
        title: "Erro",
        text: msg,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#FF4848", // vermelho padrão
      });
    }
  };

  // 🔹 Exibe modal de detalhes
  const mostrarDetalhes = (evento) => {
    const titulo = evento.nomeEvento || evento.nome || "Evento";
    const descricao =
      evento.descricao || evento.descricaoEvento || "Sem descrição.";
    const dataFormat = evento.dia || evento.data_evento || "";
    const horaInicio = evento.horaInicio || evento.hora_inicio || "-";
    const horaFim = evento.horaFim || evento.hora_fim || "-";

    let local = "Local não informado";
    const e =
      evento.endereco ||
      evento.enderecoEvento ||
      evento.enderecoFormatado ||
      evento.local ||
      null;

    if (e && typeof e === "object") {
      const rua = e.logradouro || e.rua || "";
      const numero =
        e.numero !== undefined && e.numero !== null ? String(e.numero) : "";
      const bairro = e.bairro || "";
      const parts = [];
      if (rua) parts.push(rua + (numero ? `, ${numero}` : ""));
      if (bairro) parts.push(bairro);
      if (parts.length) local = parts.join(" - ");
    } else if (typeof e === "string" && e.trim()) {
      local = e;
    }

    const categoria = evento.categoria?.nome || evento.categoriaNome || "-";
    const imgHtml = evento.imagemUrl
      ? `<img src="${evento.imagemUrl}" alt="${titulo}" class="sw-img" />`
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
      confirmButtonText: "Cancelar Inscrição",
      cancelButtonText: "Fechar",
      reverseButtons: true,
      customClass: {
        popup: "my-swal compact-swal",
        title: "swal2-title my-swal-title",
        content: "swal2-content my-swal-content",
        confirmButton: "sw-btn sw-btn-confirm",
        cancelButton: "sw-btn sw-btn-cancel",
        closeButton: "swal2-close my-swal-close",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        cancelarInscricao(evento.idEvento || evento.id);
      }
    });
  };

  useEffect(() => {
    return () => {
      participacoes.forEach((p) => {
        if (p && p.imagemUrl) {
          try {
            URL.revokeObjectURL(p.imagemUrl);
          } catch (e) {
            console.debug("Ignorado:", e);
          }
        }
      });
    };
  }, [participacoes]);

  return (
    <div className="scroll-page-usuario">
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />

      <div className="meus-eventos-beneficiario">
        {loading ? (
          <p>Carregando eventos...</p>
        ) : (
          <div className="feedback-container">
            <div
              className="eventos-unificado"
              style={{
                background: "#F5F5F5",
                padding: 0,
                boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              }}
            >
              <h1
                style={{
                  marginTop: 0,
                  padding: "0 0 0 100px",
                  marginBottom: "10px",
                }}
              >
                Meus Eventos
              </h1>
              <div style={{ marginTop: 8 }}>
                <EspacoEventosBeneficiario
                  eventos={participacoes}
                  mostrarParticipar={false}
                  hideParticipar={true}
                  onOpenModal={mostrarDetalhes}
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
