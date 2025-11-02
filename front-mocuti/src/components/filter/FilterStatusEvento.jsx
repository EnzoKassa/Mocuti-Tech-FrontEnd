import { useEffect, useState } from "react";

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
                const response = await fetch("http://localhost:8080/status-eventos");
                if (!response.ok) throw new Error("Erro ao buscar status");
                const data = await response.json();
                setStatus(data);
            } catch (err) {
                setErro(err.message);
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

                const response = await fetch(
                    `http://localhost:8080/eventos/status?statusEventoId=${statusEventoId}`
                );
                if (!response.ok) throw new Error("Erro ao buscar eventos");

                const data = await response.json();
                setEventos(data);
            } catch (err) {
                setErro(err.message);
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

            <select value={statusEventoId} onChange={(e) => setStatusEventoId(e.target.value)}>
                <option value="">Selecione um status</option>
                {status.map((s) => (
                    <option key={s.idStatusEvento} value={s.idStatusEvento}>
                        {s.situacao}
                    </option>
                ))}
            </select>

            {loading && <p>Carregando eventos...</p>}

            <ul>
                {eventos.map((e, idx) => (
                    <li key={idx}>
                        {e.nome} - {e.dia}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventosPorStatus;


