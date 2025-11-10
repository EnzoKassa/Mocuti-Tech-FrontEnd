import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { AuthContext } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import FiltroBeneficiario from "../../components/FiltroBeneficiario";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import "../../styles/EventosBeneficiario.css";
import { useNavigate } from "react-router-dom";
import api from '../../api/api'

const INITIAL_FILTERS = {
  nome: "",
  dataInicio: "",
  dataFim: "",
  categoriaId: "",
  statusEventoId: "",
};

export default function EventosBeneficiario() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [filtrosUI, setFiltrosUI] = useState(INITIAL_FILTERS);
  const { user } = useContext(AuthContext);
  const userId = user?.idUsuario || user?.id || null;
  const navigate = useNavigate();

  const botoesNav = [
    { onClick: () => navigate("/usuario/eventos"), label: "Eventos", className: "btn-inicio" },
    { onClick: () => navigate("/usuario/perfil"), label: "Meu Perfil", className: "btn-sobre" },
    { onClick: () => navigate("/usuario/meus-eventos"), label: "Meus Eventos", className: "btn-linha" },
    { onClick: () => navigate("/usuario/feedback"), label: "Feedback", className: "btn-comentarios" },
  ];

  // 🔹 Busca inicial de categorias e status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, statusRes] = await Promise.all([
          api.get("/categorias"),
          api.get("/status-eventos"),
        ]);

        setCategorias(categoriasRes.data);
        setStatusList(statusRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Buscar eventos com filtros
  const buscarEventos = async () => {
    try {
      const filtrosAtuais = filtrosUI;
      let url = "/eventos/por-eventos";
      const params = new URLSearchParams();

      if (filtrosAtuais.nome) params.append("nome", filtrosAtuais.nome);
      if (filtrosAtuais.dataInicio) params.append("dataInicio", filtrosAtuais.dataInicio);
      if (filtrosAtuais.dataFim) params.append("dataFim", filtrosAtuais.dataFim);

      const filtrosAdicionais = params.toString();

      if (filtrosAtuais.categoriaId && !filtrosAtuais.statusEventoId) {
        url = `/eventos/por-categoria?categoriaId=${filtrosAtuais.categoriaId}`;
        if (filtrosAdicionais) url += "&" + filtrosAdicionais;
      } else if (filtrosAtuais.statusEventoId && !filtrosAtuais.categoriaId) {
        url = `/eventos/status?statusEventoId=${filtrosAtuais.statusEventoId}`;
        if (filtrosAdicionais) url += "&" + filtrosAdicionais;
      } else if (filtrosAdicionais) {
        url += "?" + filtrosAdicionais;
      }

      const res = await api.get(url);
      let data = res.data;

      if (filtrosAtuais.categoriaId && filtrosAtuais.statusEventoId) {
        data = data.filter(
          (ev) =>
            ev.categoria?.idCategoria == filtrosAtuais.categoriaId &&
            ev.statusEvento?.idStatusEvento == filtrosAtuais.statusEventoId
        );
      }

      const dataComDadosCompletos = data.map((evento) => {
        const categoriaNome =
          evento.categoria?.nome ||
          categorias.find((c) => c.idCategoria == evento.categoria?.idCategoria)?.nome ||
          "";

        const statusSituacao =
          evento.statusEvento?.situacao ||
          statusList.find((s) => s.idStatusEvento == evento.statusEvento?.idStatusEvento)?.situacao ||
          "";

        const enderecoObj = evento.endereco || evento.enderecoEvento || evento.local || null;
        let enderecoFormatado = "Local não informado";
        if (enderecoObj && typeof enderecoObj === "object") {
          const logradouro = enderecoObj.logradouro || enderecoObj.rua || enderecoObj.logradoro || "";
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
          local: enderecoFormatado,
          enderecoFormatado,
        };
      });

      const eventosComImg = await Promise.all(
        dataComDadosCompletos.map(async (evento) => {
          let eventoCompletado = { ...evento, imagemUrl: null };
          try {
            if (!evento.idEvento) return eventoCompletado;

            const imgResponse = await api.get(`/eventos/foto/${evento.idEvento}`, {
              responseType: "blob",
            });

            if (imgResponse.status === 200 && imgResponse.data) {
              const blob = imgResponse.data;
              eventoCompletado.imagemUrl = URL.createObjectURL(blob);
            }
          } catch (errorImg) {
            console.warn(`Erro ao buscar foto para evento ${evento.idEvento}:`, errorImg);
          }

          return eventoCompletado;
        })
      );

      setEventos(eventosComImg);
      setFiltrosUI(INITIAL_FILTERS);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setEventos([]);
    }
  };

  useEffect(() => {
    buscarEventos();
  }, []);

  const handleFiltroChange = (field, value) => {
    setFiltrosUI((prev) => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => {
    buscarEventos();
  };

  const swalConfirmDefaults = {
    showCancelButton: true,
    buttonsStyling: false,
    customClass: {
      confirmButton: "sw-btn sw-btn-confirm",
      cancelButton: "sw-btn sw-btn-cancel",
    },
  };

  // 🔹 Inscrição no evento (Axios)
  const inscreverEvento = async (idEvento, idStatusInscricao = 1) => {
    if (!userId) {
      Swal.fire("Atenção", "Você precisa estar logado para se inscrever.", "warning");
      return;
    }

    const id = idEvento || null;
    if (!id) {
      Swal.fire("Erro", "ID do evento inválido.", "error");
      return;
    }

    try {
      const url = `/participacoes/${encodeURIComponent(id)}/inscrever?idUsuario=${encodeURIComponent(
        userId
      )}&idStatusInscricao=${encodeURIComponent(idStatusInscricao)}`;
      const res = await api.post(url);
      Swal.fire("Inscrição enviada", "Você foi inscrito no evento.", "success");
      return res.data;
    } catch (error) {
      let msg = "Erro ao enviar inscrição";
      if (error.response) {
        const contentType = error.response.headers["content-type"] || "";
        const data = error.response.data;
        if (contentType.includes("application/json")) {
          msg = data?.message || data?.error || msg;
        } else if (typeof data === "string") {
          msg = data;
        }
      }
      console.error("Erro ao enviar inscrição:", error);
      Swal.fire("Erro", msg, "error");
    }
  };

  // 🔹 Mostrar detalhes (Axios no lugar de fetch)
  const mostrarDetalhes = async (evento) => {
    const titulo = evento.nomeEvento || evento.nome || evento.nome_evento || "Evento";
    let descricao = evento.descricao || evento.descricaoEvento || "Sem descrição.";
    let dataFormat = evento.data_evento || evento.dia || "";
    let horaInicio = evento.hora_inicio || evento.horaInicio || "-";
    let horaFim = evento.hora_fim || evento.horaFim || "-";
    let imgUrl = evento.imagemUrl || null;
    let localStr = evento.local || evento.enderecoFormatado || "Local não informado";
    let vagas = evento.qtdVaga ?? evento.qtd_vaga ?? "Evento aberto ao público";
    let categoria = evento.categoriaNome || evento.categoria?.nome || "-";
    let status = evento.statusSituacao || evento.statusEvento?.situacao || "-";
    let publico = evento.publico || evento.publicoAlvo || "Público";

    const hasEnderecoObject = !!(evento.endereco && typeof evento.endereco === "object");
    if ((!evento.endereco && !evento.enderecoFormatado && localStr === "Local não informado") || !hasEnderecoObject) {
      const id = evento.idEvento || evento.id || evento.id_evento;
      if (id) {
        try {
          Swal.fire({
            title: "Carregando...",
            html: "Buscando informações completas do evento...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
            showConfirmButton: false,
          });

          const resp = await api.get(`/eventos/${encodeURIComponent(id)}`);
          const full = resp.data;
          descricao = full.descricao || descricao;
          dataFormat = full.data_evento || full.dia || dataFormat;
          horaInicio = full.hora_inicio || full.horaInicio || horaInicio;
          horaFim = full.hora_fim || full.horaFim || horaFim;
          imgUrl = imgUrl || full.imagemUrl || null;
          vagas = full.qtdVaga ?? full.qtd_vaga ?? vagas;
          categoria = full.categoria?.nome || categoria;
          status = full.statusEvento?.situacao || status;
          publico = full.publicoAlvo || full.publico || publico;

          const e = full.endereco || full.enderecoEvento || full.address || null;
          if (e && typeof e === "object") {
            const rua = e.logradouro || e.rua || "";
            const numero = e.numero ? String(e.numero) : "";
            const bairro = e.bairro || "";
            const parts = [];
            if (rua) parts.push(rua + (numero ? `, ${numero}` : ""));
            if (bairro) parts.push(bairro);
            if (parts.length) localStr = parts.join(" - ");
          } else if (typeof full.enderecoFormatado === "string" && full.enderecoFormatado.trim()) {
            localStr = full.enderecoFormatado;
          }
        } catch (err) {
          console.error("Erro ao buscar detalhe do evento:", err);
        } finally {
          Swal.close();
        }
      }
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
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: "Agendar",
      cancelButtonText: "Fechar",
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
        Swal.fire({
          title: "Tem certeza?",
          text: "Deseja participar do evento?",
          icon: "question",
          confirmButtonText: "Sim, agendar",
          cancelButtonText: "Cancelar",
          ...swalConfirmDefaults,
        }).then((confirm) => {
          if (confirm.isConfirmed) {
            const id = evento.idEvento || evento.id || evento.id_evento;
            inscreverEvento(id);
          }
        });
      }
    });
  };

  const handleParticiparClick = (evento) => {
    if (!userId) {
      Swal.fire("Atenção", "Você precisa estar logado para se inscrever.", "warning");
      return;
    }

    Swal.fire({
      title: "Tem certeza?",
      text: "Deseja participar do evento?",
      icon: "question",
      confirmButtonText: "Sim, agendar",
      cancelButtonText: "Cancelar",
      ...swalConfirmDefaults,
    }).then((result) => {
      if (result.isConfirmed) {
        const id = evento.idEvento || evento.id || evento.id_evento;
        inscreverEvento(id);
      }
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
        onParticipar={handleParticiparClick}
        onInscrever={inscreverEvento}
        onMostrarDetalhes={mostrarDetalhes}
      />
    </>
  );
}
