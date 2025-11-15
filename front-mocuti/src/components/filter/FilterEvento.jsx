import { useEffect, useState } from "react";
import api from "../../api/api";

// Debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function FiltroEventos() {
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const debouncedNome = useDebounce(nome, 500);

  // Buscar eventos
  const fetchEventos = async () => {
    setLoading(true);
    setErro(null);

    try {
      const params = {};
      if (debouncedNome.length > 1) params.nome = debouncedNome;
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;

      const res = await api.get("/eventos/por-eventos", { params });
      setEventos(res.data);
    } catch (err) {
      setErro("Erro ao buscar eventos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dispara quando filtros mudam
  useEffect(() => {
    fetchEventos();
  }, [debouncedNome, dataInicio, dataFim]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Buscar Eventos</h1>

      <div className="flex flex-col gap-2 mb-4">
        
        {/* Input Nome */}
        <input
          type="text"
          placeholder="Digite o nome do evento..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Datas */}
        <div className="flex gap-2">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={fetchEventos}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Buscar
          </button>
        </div>
      </div>

      {loading && <p className="mt-4">Carregando...</p>}
      {erro && <p className="mt-4 text-red-600">{erro}</p>}

      <ul className="mt-4 space-y-2">
        {eventos.map((e) => (
          <li
            key={e.id || e.idEvento || e.nome}
            className="border p-2 rounded shadow-sm hover:bg-gray-100"
          >
            <strong>{e.nome}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
