import { useEffect, useState } from "react";

const EventosPorCategoria = () => {
    const [categorias, setCategorias] = useState([]);
    const [categoriaId, setCategoriaId] = useState("");
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    // Buscar categorias no backend
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch("http://localhost:8080/categorias");
                if (!response.ok) throw new Error("Erro ao buscar categorias");
                const data = await response.json();
                setCategorias(data);
            } catch (err) {
                setErro(err.message);
            }
        };

        fetchCategorias();
    }, []);

    // Buscar eventos por categoria
    useEffect(() => {
        if (!categoriaId) return;

        const fetchEventos = async () => {
            try {
                setLoading(true);
                setErro(null);

                const response = await fetch(
                    `http://localhost:8080/eventos/por-categoria?categoriaId=${categoriaId}`
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
    }, [categoriaId]);

    return (
        <div>
            <h2>Filtrar eventos por categoria</h2>
            {erro && <p style={{ color: "red" }}>{erro}</p>}

            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                    <option key={c.idCategoria} value={c.idCategoria}>
                        {c.nome}
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

export default EventosPorCategoria;