import React, { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { AuthContext } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import FiltroBeneficiario from "../../components/FiltroBeneficiario";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import "../../styles/EventosBeneficiario.css";

const botoesNav = [
  { href: "#Eventos", label: "Eventos", className: "btn-inicio" },
  { href: "#MeuPerfil", label: "Meu Perfil", className: "btn-sobre" },
  { href: "#MeusEventos", label: "Meus Eventos", className: "btn-linha" }
];

const INITIAL_FILTERS = {
  nome: "",
  dataInicio: "",
  dataFim: "",
  categoriaId: "",
  statusEventoId: ""
};

export default function MeusEventosBeneficiario() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [filtrosUI, setFiltrosUI] = useState(INITIAL_FILTERS);
  const { user } = useContext(AuthContext);
  const userId = user?.idUsuario || user?.id || null;

  useEffect(() => {
    fetch("http://localhost:8080/categorias")
      .then(res => res.json())
      .then(setCategorias)
      .catch(err => console.error("Erro ao buscar categorias:", err));

    fetch("http://localhost:8080/status-eventos")
      .then(res => res.json())
      .then(setStatusList)
      .catch(err => console.error("Erro ao buscar status:", err));
  }, []);

  const buscarMeusEventos = async () => {
    try {
      if (!userId) {
        setEventos([]);
        return;
      }

      // const url = `http://localhost:8080/eventos-inscritos/${encodeURIComponent(userId)}`;
      const url = `http://localhost:8080/participacoes/eventos-inscritos/${encodeURIComponent(userId)}`;
      const response = await fetch(url);
      if (response.status === 204 || response.status === 404) {
        // sem eventos ou usuário sem participações
        setEventos([]);
        return;
      }
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      let data = await response.json();

      const dataComDadosCompletos = data.map(evento => {
        const categoriaNome = evento.categoria?.nome ||
          categorias.find(c => c.idCategoria == evento.categoria?.idCategoria)?.nome || '';

        const statusSituacao = evento.statusEvento?.situacao ||
          statusList.find(s => s.idStatusEvento == evento.statusEvento?.idStatusEvento)?.situacao || '';

        // formatar endereço: rua, numero - bairro
        const enderecoObj = evento.endereco || evento.enderecoEvento || evento.local || null;
        let enderecoFormatado = "Local não informado";
        if (enderecoObj && typeof enderecoObj === "object") {
          const logradouro = enderecoObj.logradouro || enderecoObj.rua || "";
          const numero = enderecoObj.numero ? `${enderecoObj.numero}` : "";
          const bairro = enderecoObj.bairro ? `${enderecoObj.bairro}` : "";
          const partes = [];
          if (logradouro) partes.push(logradouro + (numero ? `, ${numero}` : ""));
          if (bairro) partes.push(bairro);
          if (partes.length) enderecoFormatado = partes.join(" - ");
        } else if (typeof enderecoObj === "string" && enderecoObj.trim()) {
          enderecoFormatado = enderecoObj;
        }

        return {
          ...evento,
          categoriaNome,
          statusSituacao,
          inscrito: true,
          local: enderecoFormatado,
          enderecoFormatado
        };
      });

      const eventosComImg = await Promise.all(
        dataComDadosCompletos.map(async (evento) => {
          let eventoCompletado = { ...evento, imagemUrl: null };
          try {
            const id = evento.idEvento || evento.id_evento || evento.id;
            if (!id) return eventoCompletado;
            const imgResponse = await fetch(`http://localhost:8080/eventos/foto/${id}`);
            if (imgResponse.ok) {
              const blob = await imgResponse.blob();
              eventoCompletado.imagemUrl = URL.createObjectURL(blob);
            }
          } catch (errorImg) {
            console.warn(`Erro ao buscar foto para evento ${evento.idEvento || evento.id_evento}:`, errorImg);
          }
          return eventoCompletado;
        })
      );

      const eventosFiltrados = aplicarFiltrosClient(eventosComImg, filtrosUI);
      setEventos(eventosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar meus eventos:", error);
      setEventos([]);
    }
  };

  useEffect(() => {
    buscarMeusEventos();

  }, [userId, categorias, statusList]);

  const handleFiltroChange = (field, value) => {
    setFiltrosUI(prev => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => {
    buscarMeusEventos();
  };

  // Enviar feedback (POST /feedback)
  const enviarFeedback = async (payload) => {
    try {
      const res = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get("content-type") || "";
      let body = null;
      if (contentType.includes("application/json")) body = await res.json().catch(() => null);
      else body = await res.text().catch(() => null);

      if (res.ok) {
        Swal.fire("Obrigado!", "Seu feedback foi enviado.", "success");
        return true;
      }

      let errMsg = "Não foi possível enviar feedback.";
      if (body) {
        if (typeof body === "string" && body.trim()) errMsg = body;
        else if (typeof body === "object") errMsg = body.message || body.error || JSON.stringify(body);
      } else errMsg = `Erro ${res.status}`;
      Swal.fire("Erro", errMsg, "error");
      return false;
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      Swal.fire("Erro", "Falha ao conectar com o servidor.", "error");
      return false;
    }
  };

  const cancelarInscricao = async (idEvento) => {
    if (!userId) {
      Swal.fire("Atenção", "Você precisa estar logado para cancelar a inscrição.", "warning");
      return;
    }

    const confirmOpts = {
      title: "Confirmação",
      text: "Tem certeza que deseja cancelar sua inscrição neste evento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar inscrição",
      cancelButtonText: "Manter inscrição",
      customClass: {
        confirmButton: "sw-btn sw-btn-confirm",
        cancelButton: "sw-btn sw-btn-cancel"
      },
      buttonsStyling: false
    };

    const choice = await Swal.fire(confirmOpts);
    if (!choice.isConfirmed) return;

    try {
      const url = `http://localhost:8080/participacoes/${encodeURIComponent(idEvento)}/cancelar-inscricao?idUsuario=${encodeURIComponent(userId)}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        // remover evento da lista
        setEventos(prev => prev.filter(ev => {
          const id = ev.idEvento || ev.id_evento || ev.id;
          return Number(id) !== Number(idEvento);
        }));
        Swal.fire("Inscrição cancelada", "Sua inscrição foi cancelada.", "success");
      } else {

        const ct = res.headers.get("content-type") || "";
        let body = null;
        if (ct.includes("application/json")) body = await res.json().catch(()=>null);
        else body = await res.text().catch(()=>null);
        let errMsg = `Erro ${res.status}`;
        if (body) {
          if (typeof body === "string") errMsg = body;
          else errMsg = body.message || body.error || JSON.stringify(body);
        }
        Swal.fire("Erro", errMsg, "error");
      }
    } catch (err) {
      console.error("Erro ao cancelar inscrição:", err);
      Swal.fire("Erro", "Falha ao conectar com o servidor.", "error");
    }
  };

  // Mostrar detalhes (com botão Realizar Feedback)
  const mostrarDetalhes = (evento) => {
    const titulo = evento.nomeEvento || evento.nome || evento.nome_evento || "Evento";
    const descricao = evento.descricao || evento.descricaoEvento || evento.descricao_evento || "Sem descrição.";
    const dataFormat = evento.data_evento || evento.dia || "";
    const horaInicio = evento.hora_inicio || evento.horaInicio || "-";
    const horaFim = evento.hora_fim || evento.horaFim || "-";
    const local = evento.local || evento.endereco || "Local não informado";
    const categoria = evento.categoriaNome || evento.categoria?.nome || "-";

    const imgHtml = evento.imagemUrl ? `<img src="${evento.imagemUrl}" alt="${titulo}" class="sw-img" />` : `<div class="sw-img sw-noimg">Sem imagem</div>`;

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
      confirmButtonText: "Realizar Feedback",
      cancelButtonText: "Cancelar Inscrição",
      customClass: {
        popup: "my-swal compact-swal",
        title: "swal2-title my-swal-title",
        content: "swal2-content my-swal-content",
        confirmButton: "sw-btn sw-btn-confirm",
        cancelButton: "sw-btn sw-btn-cancel",
        closeButton: "swal2-close my-swal-close"
      },
      buttonsStyling: false,
    }).then((result) => {
      // confirmar para realizar feedback
      if (result.isConfirmed) {
        // abrir modal de feedback (form)
        const fbHtml = `
          <div style="text-align:left;">
            <label style="display:block; font-weight:600; margin-bottom:8px;">Comentário</label>
            <textarea id="sw-feedback-text" placeholder="Digite seu comentário" style="width:100%; height:120px; padding:10px; border:1px solid #e6e6e6; border-radius:4px; resize:vertical;"></textarea>
            <div style="margin-top:18px; text-align:center;">
              <div style="margin-bottom:8px; color:#666;">Gostou do evento?</div>
              <div style="display:flex; gap:24px; justify-content:center; align-items:center;">
                <button id="sw-like" type="button" style="min-width:120px; padding:10px 16px; border-radius:4px; border:1px solid #ddd; background:#fff; cursor:pointer;">👍 Gostei</button>
                <button id="sw-dislike" type="button" style="min-width:120px; padding:10px 16px; border-radius:4px; border:1px solid #ddd; background:#fff; cursor:pointer;">👎 Não Gostei</button>
              </div>
            </div>
          </div>
        `;

        let gostei = null; // true = like, false = dislike, null = none

        Swal.fire({
          title: "Descrição do Feedback",
          html: fbHtml,
          showCancelButton: true,
          confirmButtonText: "Enviar Feedback",
          cancelButtonText: "Fechar",
          customClass: {
            popup: "my-swal compact-swal",
            title: "swal2-title my-swal-title",
            content: "swal2-content my-swal-content",
            confirmButton: "sw-btn sw-btn-confirm",
            cancelButton: "sw-btn sw-btn-cancel",
            closeButton: "swal2-close my-swal-close"
          },
          buttonsStyling: false,
          didOpen: () => {
            const likeBtn = document.getElementById("sw-like");
            const dislikeBtn = document.getElementById("sw-dislike");

            const updateButtons = () => {
              if (!likeBtn || !dislikeBtn) return;
              likeBtn.style.background = gostei === true ? "#3fb040" : "#fff";
              likeBtn.style.color = gostei === true ? "#fff" : "#333";
              dislikeBtn.style.background = gostei === false ? "#e74c3c" : "#fff";
              dislikeBtn.style.color = gostei === false ? "#fff" : "#333";
              likeBtn.style.boxShadow = gostei === true ? "0 6px 14px rgba(63,176,64,0.18)" : "none";
              dislikeBtn.style.boxShadow = gostei === false ? "0 6px 14px rgba(231,76,60,0.12)" : "none";
            };

            likeBtn?.addEventListener("click", () => {
              gostei = gostei === true ? null : true;
              updateButtons();
            });
            dislikeBtn?.addEventListener("click", () => {
              gostei = gostei === false ? null : false;
              updateButtons();
            });

            updateButtons();
          }
        }).then(async (fbResult) => {
          if (fbResult.isConfirmed) {
            const comentario = document.getElementById("sw-feedback-text")?.value || "";
            const payload = {
              idUsuario: Number(userId),
              idEvento: Number(evento.idEvento || evento.id_evento || evento.id),
              comentario,
              gostei
            };
            
            await enviarFeedback(payload);
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // usuário clicou em "Cancelar Inscrição" — confirmar ação
        const idEv = evento.idEvento || evento.id_evento || evento.id;
        cancelarInscricao(idEv);
      }
    });
  };
  
  const aplicarFiltrosClient = (lista, filtros) => {
    if (!lista || !Array.isArray(lista)) return [];
    const { nome, dataInicio, dataFim, categoriaId, statusEventoId } = filtros || {};
    return lista.filter(ev => {
      // nome busca em nomeEvento / nome
      if (nome && nome.trim()) {
        const n = nome.trim().toLowerCase();
        const target = (ev.nomeEvento || ev.nome || "").toString().toLowerCase();
        if (!target.includes(n)) return false;
      }

      // data range: compara com ev.dia / ev.data_evento
      if (dataInicio) {
        const evData = ev.dia || ev.data_evento || "";
        if (!evData) return false;
        if (new Date(evData) < new Date(dataInicio)) return false;
      }
      if (dataFim) {
        const evData = ev.dia || ev.data_evento || "";
        if (!evData) return false;

        const evDate = new Date(evData);
        const endDate = new Date(dataFim);
        endDate.setHours(23,59,59,999);
        if (evDate > endDate) return false;
      }

      // categoria
      if (categoriaId) {
        const catIdStr = String(ev.categoria?.idCategoria || ev.categoria?.id || ev.categoriaId || "");
        if (catIdStr !== String(categoriaId)) return false;
      }

      // statusEvento
      if (statusEventoId) {
        const stIdStr = String(ev.statusEvento?.idStatusEvento || ev.statusEvento?.id || ev.statusEventoId || "");
        if (stIdStr !== String(statusEventoId)) return false;
      }

      return true;
    });
  };

  return (
    <>
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />
      <FiltroBeneficiario
        filtros={filtrosUI}
        onFiltroChange={handleFiltroChange}
        categorias={categorias}
        statusList={statusList}
        onPesquisar={handlePesquisar}
      />
      <EspacoEventosBeneficiario
        eventos={eventos}
        onMostrarDetalhes={mostrarDetalhes}
        showParticipar={false}
      />
    </>
  );
}
