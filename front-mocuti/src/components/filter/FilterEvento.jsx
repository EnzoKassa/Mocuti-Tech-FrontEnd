import { useEffect, useState } from "react";

// Debounce: só dispara a requisição 500ms depois que o usuário para de digitar
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

    // Função que faz a requisição
    const fetchEventos = async () => {
        try {
            setLoading(true);
            setErro(null);

            const params = new URLSearchParams();
            if (debouncedNome.length > 1) params.append("nome", debouncedNome);
            if (dataInicio) params.append("dataInicio", dataInicio);
            if (dataFim) params.append("dataFim", dataFim);

            const response = await fetch(`http://localhost:8080/eventos?${params.toString()}`);
            if (!response.ok) throw new Error("Erro ao buscar eventos");

            const data = await response.json();
            setEventos(data);
        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Dispara automaticamente quando o nome muda
    useEffect(() => {
        fetchEventos();
    }, [debouncedNome, dataInicio, dataFim]);

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Buscar Eventos</h1>

            <div className="flex flex-col gap-2 mb-4">
                {/* Input de nome */}
                <input
                    type="text"
                    placeholder="Digite o nome do evento..."
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                {/* Intervalo de datas */}
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
                {eventos.map((e, index) => (
                    <li
                        key={index} // se não tiver id, pode usar index
                        className="border p-2 rounded shadow-sm hover:bg-gray-100"
                    >
                        <strong>{e.nome}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}
