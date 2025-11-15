import { useEffect, useState } from "react";
import api from "../../api/api";

const EventosPorStatus = () => {
  const [status, setStatus] = useState([]);
  const [statusEventoId, setStatusEventoId] = useState("");
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Buscar status no backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/status-eventos");
        setStatus(res.data);
      } catch {
        setErro("Erro ao buscar status");
      }
    };

    fetchStatus();
  }, []);

  // Buscar eventos por status
  useEffect(() => {
    if (!statusEventoId) return;

    const fetchEventos = async () => {
      try {
        setLoading(true);
        setErro(null);

        const res = await api.get("/eventos/status", {
          params: { statusEventoId },
        });

        setEventos(res.data);
      } catch {
        setErro("Erro ao buscar eventos");
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [statusEventoId]);

  return (
    <div>
      <h2>Filtrar eventos por status</h2>
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <select
        value={statusEventoId}
        onChange={(e) => setStatusEventoId(e.target.value)}
      >
        <option value="">Selecione um status</option>
        {status.map((s) => (
          <option key={s.idStatusEvento} value={s.idStatusEvento}>
            {s.situacao}
          </option>
        ))}
      </select>

      {loading && <p>Carregando eventos...</p>}

      <ul>
        {eventos.map((e, i) => (
          <li key={i}>
            {e.nome} - {e.dia}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventosPorStatus;
