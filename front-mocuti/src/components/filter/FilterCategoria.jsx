import { useEffect, useState } from "react";
import api from "../../api/api";

const EventosPorCategoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Buscar categorias
  useEffect(() => {
    api.get("/categorias")
      .then(res => setCategorias(res.data))
      .catch(() => setErro("Erro ao carregar categorias 😕"));
  }, []);

  // Buscar eventos por categoria
  useEffect(() => {
    if (!categoriaId) return;

    setLoading(true);
    setErro(null);

    api.get(`/eventos/por-categoria?categoriaId=${categoriaId}`)
      .then(res => setEventos(res.data))
      .catch(() => setErro("Erro ao carregar eventos 😕"))
      .finally(() => setLoading(false));

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
        {eventos.map((e) => (
          <li key={e.idEvento || e.id}>
            {e.nome} — {e.dia}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventosPorCategoria;
