import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import HeaderBeneficiario from "../../components/HeaderBeneficiario";
import HeaderBeneficiarioBotoes from "../../components/HeaderBeneficiarioBotoes";
import Filtrobeneficiario from "../../components/FiltroBeneficiario";
import ModalFeedback from "../../components/modal/Modal_Feedback_M2";
import ModalVisualizacao from "../../components/modal/Modal_FeedbackVisul_M2";
import EspacoEventosBeneficiario from "../../components/EspacoEventosBeneficiario";
import "../../styles/meusEventos.css";

const botoesNav = [
  { href: "#Eventos", label: "Eventos", className: "btn-inicio" },
  { href: "#MeuPerfil", label: "Meu Perfil", className: "btn-sobre" },
  { href: "#MeusEventos", label: "Meus Eventos", className: "btn-linha" },
];

const NOTAS_MAP = { like: 1, dislike: 2 };

export default function MeusEventosBeneficiario() {
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

      const normalize = async (arr) =>
        Promise.all(
          arr.map(async (p) => {
            let imagemUrl = null;
            try {
              const imgResponse = await fetch(
                `http://localhost:8080/eventos/foto/${p.id.eventoId}`
              );
              if (imgResponse.ok) {
                const blob = await imgResponse.blob();
                imagemUrl = URL.createObjectURL(blob);
              }
            } catch (error) {
              setError("Erro ao buscar imagem: " + error.message);
            }
            return {
              ...p,
              nota: p.nota?.tipoNota || null,
              imagemUrl,
            };
          })
        );

      setParticipacoes(await normalize(paraComentar));
      setEventosPassados(await normalize(passados));
    } catch (err) {
      console.error("Erro ao buscar participações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [idUsuario]);

  // Toggle body scroll quando modal abrir/fechar
  useEffect(() => {
    if (modalData) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalData]);

  const handleFiltroChange = (field, value) => {
    setFiltros((prev) => ({ ...prev, [field]: value }));
  };

  const handlePesquisar = () => {
    fetchEventos();
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

      const res = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const updated = await res.json();

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
          <>
            <h2>Eventos para comentar</h2>
            <EspacoEventosBeneficiario
              eventos={participacoes}
              mostrarParticipar={false}
              onOpenModal={(evento) => setModalData(evento)}
            />

            <h2>Eventos passados</h2>
            <EspacoEventosBeneficiario
              eventos={eventosPassados}
              mostrarParticipar={false}
              onOpenModal={(evento) =>
                setModalData({ ...evento, isPassado: true })
              }
            />
          </>
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
