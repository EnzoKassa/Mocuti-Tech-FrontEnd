import "../styles/FiltroBeneficiario.css";

export default function FiltroBeneficiario({
    filtros,
    onFiltroChange,
    categorias,
    statusList,
    onPesquisar
}) {
    return (
        <div className="espacofiltrobeneficiario">
        <div className="espacoentornofiltrobeneficiario">
        <div className="inputsespacobeneficiario">
        <div className="inputespacobeneficiarioseparacao1">
        <input
        placeholder="Pesquisar nome do evento..."
        type="text"
        value={filtros.nome}
        onChange={(e) => onFiltroChange("nome", e.target.value)}
        />
        </div>
        <div className="inputespacobeneficiarioseparacao2">
        <div className="inputespacobeneficiarioseparacao2-caixa1">
        Início:{" "}
        <input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => onFiltroChange("dataInicio", e.target.value)}
        />
        </div>
        <div className="inputespacobeneficiarioseparacao2-caixa2">
        Fim:{" "}
        <input
            type="date"
            value={filtros.dataFim}
            onChange={(e) => onFiltroChange("dataFim", e.target.value)}
        />
        </div>
        <div className="inputespacobeneficiarioseparacao2-caixa3">
        <select
            value={filtros.categoriaId}
            onChange={(e) => onFiltroChange("categoriaId", e.target.value)}
        >
            <option value="">Categoria</option>
            {categorias.map((cat) => (
            <option key={cat.idCategoria} value={cat.idCategoria}>
            {cat.nome}
            </option>
            ))}
        </select>
        </div>
        <div className="inputespacobeneficiarioseparacao2-caixa4">
        <select
            value={filtros.statusEventoId}
            onChange={(e) => onFiltroChange("statusEventoId", e.target.value)}
        >
            <option value="">Status</option>
            {statusList.map((st) => (
            <option key={st.idStatusEvento} value={st.idStatusEvento}>
            {st.situacao}
            </option>
            ))}
        </select>
        </div>
        </div>
        </div>
        <div className="botaoespacobeneficiario">
        <button onClick={onPesquisar}>Pesquisar</button>
        </div>
        </div>
        </div>
    );
    }