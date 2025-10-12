import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import Filtrobeneficiario from "../../components/FiltroBeneficiario";
import ModalFeedback from "../../components/modal/Modal_Feedback_M2";
import ModalVisualizacao from "../../components/modal/Modal_FeedbackVisul_M2";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import "../../styles/meusEventos.css";


export default function MeusEventosBeneficiario() {
  const navigate = useNavigate();
  
  const NOTAS_MAP = { like: 1, dislike: 2 };

  const botoesNav = [
  { onClick: () => navigate("/usuario/eventos"), label: "Eventos", className: "btn-inicio" },
  { onClick: () => navigate("/usuario/perfil"), label: "Meu Perfil", className: "btn-sobre" },
  { onClick: () => navigate("/usuario/meus-eventos"), label: "Meus Eventos", className: "btn-linha" },
];

  const { user } = useAuth();
  const idUsuario =
    user?.id ||
    localStorage.getItem("idUsuario") ||
    sessionStorage.getItem("idUsuario");

  const [participacoes, setParticipacoes] = useState([]);
  const [eventosPassados, setEventosPassados] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [categorias, setCategorias] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [filtros, setFiltros] = useState({
    nome: "",
    dataInicio: "",
    dataFim: "",
    categoriaId: "",
    statusEventoId: "",
  });

  // Carrega categorias e status
  useEffect(() => {
    fetch("http://localhost:8080/categorias")
      .then((res) => res.json())
      .then(setCategorias)
      .catch((err) => console.error("Erro ao carregar categorias:", err));

    fetch("http://localhost:8080/status-eventos")
      .then((res) => res.json())
      .then(setStatusList)
      .catch((err) => console.error("Erro ao carregar status:", err));
  }, []);

  // Normaliza os eventos adicionando todos os campos necessários
  const normalizeEventos = async (arr) =>
    Promise.all(
      arr.map(async (p) => {
        let imagemUrl = null;
        let eventoDetalhes = null;
        try {
          // Busca detalhes completos do evento
          const res = await fetch(
            `http://localhost:8080/eventos/${p.id.eventoId}`
          );
          if (res.ok) {
            eventoDetalhes = await res.json();
          }

          // Busca a imagem
          const imgRes = await fetch(
            `http://localhost:8080/eventos/foto/${p.id.eventoId}`
          );
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            imagemUrl = URL.createObjectURL(blob);
          }
        } catch (err) {
          setError("Erro ao buscar evento ou imagem: " + err.message);
        }

        return {
          ...p,
          ...eventoDetalhes, // espalha todos os campos do evento completo
          imagemUrl,
          nota: p.nota?.tipoNota || null,
        };
      })
    );

  const fetchEventos = async () => {
    if (!idUsuario) return;
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filtros.nome) params.append("nome", filtros.nome);
      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);
      if (filtros.categoriaId)
        params.append("categoriaId", filtros.categoriaId);
      if (filtros.statusEventoId)
        params.append("statusEventoId", filtros.statusEventoId);

      const [paraComentarRes, passadosRes] = await Promise.all([
        fetch(
          `http://localhost:8080/participacoes/participacao-comentar/${idUsuario}?${params}`
        ),
        fetch(
          `http://localhost:8080/participacoes/participacao-passados/${idUsuario}?${params}`
        ),
      ]);

      const [paraComentar, passados] = await Promise.all([
        paraComentarRes.json(),
        passadosRes.json(),
      ]);

      setParticipacoes(await normalizeEventos(paraComentar));
      setEventosPassados(await normalizeEventos(passados));
    } catch (err) {
      console.error("Erro ao buscar participações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [idUsuario]);

  // Toggle scroll body
  useEffect(() => {
    document.body.style.overflow = modalData ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [modalData]);

  const handleFiltroChange = (field, value) => {
    setFiltros((prev) => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => fetchEventos();

  const handleFeedback = async (p) => {
    try {
      const notaString = typeof p.nota === "string" ? p.nota : null;
      const body = {
        idUsuario: parseInt(idUsuario),
        idEvento: p.idEvento,
        comentario: p.comentario || null,
        idNota: notaString ? NOTAS_MAP[notaString] : null,
      };

      const res = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const updated = await res.json();

      setParticipacoes((prev) =>
        prev.map((ev) =>
          ev.idEvento === p.idEvento
            ? {
                ...ev,
                feedbackId: updated.idFeedback,
                nota: notaString,
                comentario: updated.comentario,
              }
            : ev
        )
      );

      if (modalData && modalData.idEvento === p.idEvento) {
        setModalData((prev) => ({
          ...prev,
          nota: notaString,
          comentario: updated.comentario,
        }));
      }
    } catch (err) {
      console.error("Erro no feedback:", err);
    }
  };

  return (
    <div className="scroll-page">
      <HeaderBeneficiario />
      <HeaderBeneficiarioBotoes botoes={botoesNav} />

      <Filtrobeneficiario
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        categorias={categorias}
        statusList={statusList}
        onPesquisar={handlePesquisar}
      />

      <div className="meus-eventos-beneficiario">
        {loading ? (
          <p>Carregando eventos...</p>
        ) : (
          <div className="feedback-container">
            <div className="feedback-title">Feedbacks</div>
            <h1>Eventos para comentar</h1>
            <EspacoEventosBeneficiario
              eventos={participacoes}
              mostrarParticipar={false}
              onOpenModal={(evento) => setModalData(evento)}
            />

            <h1>Eventos passados</h1>
            <EspacoEventosBeneficiario
              eventos={eventosPassados}
              mostrarParticipar={false}
              onOpenModal={(evento) =>
                setModalData({ ...evento, isPassado: true })
              }
            />
          </div>
        )}
      </div>

      {modalData && !modalData.isPassado && (
        <ModalFeedback
          modalData={modalData}
          onClose={() => setModalData(null)}
          onSave={handleFeedback}
        />
      )}

      {modalData && modalData.isPassado && (
        <ModalVisualizacao
          modalData={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}
