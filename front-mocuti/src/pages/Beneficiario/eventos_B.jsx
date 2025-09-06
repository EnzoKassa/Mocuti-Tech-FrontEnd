import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar_B";
import "../../styles/sideevent.css";

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'aberto': return 'green';
    case 'agendado': return 'blue';
    case 'fechado': return 'gray';
    case 'cancelado': return 'red';
    default: return 'gray';
  }
};

const getCategoriaClass = (categoria) => {
  switch (categoria?.toLowerCase()) {
    case 'palestra': return 'orange';
    case 'oficina': return 'purple';
    case 'doação': return 'yellow';
    case 'esporte': return 'green';
    default: return 'blue';
  }
};

function EventosBeneficiario() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    pesquisa: "",
    dataInicio: "",
    dataFim: "",
    categoria: "",
    status: ""
  });

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const resEventos = await fetch("http://localhost:8080/eventos");
      if (!resEventos.ok) throw new Error("Erro ao buscar eventos");
      const eventosData = await resEventos.json();
      setEventos(eventosData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handlePesquisar = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:8080/eventos";
      const params = new URLSearchParams();

      if (filtros.pesquisa) params.append("nome", filtros.pesquisa);
      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);
      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.status) params.append("status", filtros.status);

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const resEventos = await fetch(url);
      if (!resEventos.ok) throw new Error("Erro ao buscar eventos");
      const eventosData = await resEventos.json();
      setEventos(eventosData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMaisInformacoes = async (idEvento) => {
    try {
      const resEvento = await fetch(`http://localhost:8080/eventos/${idEvento}`);
      if (!resEvento.ok) throw new Error("Erro ao buscar detalhes do evento");
      const eventoDetalhes = await resEvento.json();
      alert(`Detalhes do evento: ${eventoDetalhes.nomeEvento}`);
    } catch (err) {
      alert("Erro ao carregar detalhes do evento: " + err.message);
    }
  };

  return (
    <div className="app">
      {/* Botão toggle para mobile */}
      <button
        className={`sidebar-toggle ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar */}
      <div className={`sidebar-container ${sidebarOpen ? "open" : ""}`}>
        <Sidebar />
      </div>

      {/* Conteúdo principal */}
      <div className={`main-content ${!sidebarOpen ? "sidebar-hidden" : ""}`}>
        <div className="content">
          <h1>Eventos</h1>
          {/* Filtros */}
          <div className="filters">
            <div className="juntar">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Pesquisar evento"
                  value={filtros.pesquisa}
                  onChange={(e) => handleFiltroChange("pesquisa", e.target.value)}
                />
                <img src="/search-icon.png" alt="Buscar" className="search-icon" />
              </div>
              <div className="date-filter">
                <span className="label">de:</span>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
                />
                <span className="label">até:</span>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
                />
                <select
                  value={filtros.categoria}
                  onChange={(e) => handleFiltroChange("categoria", e.target.value)}
                >
                  <option value="">Categoria</option>
                  <option value="Palestra">Palestra</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Doação">Doação</option>
                  <option value="Esporte">Esporte</option>
                </select>
                <select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange("status", e.target.value)}
                >
                  <option value="">Status</option>
                  <option value="Aberto">Aberto</option>
                  <option value="Agendado">Agendado</option>
                  <option value="Fechado">Fechado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <div className="botao-pesquisar">
              <button onClick={handlePesquisar}>Pesquisar</button>
            </div>
          </div>
          {/* Lista de Eventos com scroll */}
          <div className="eventos-lista">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : error ? (
              <div className="error">Erro: {error}</div>
            ) : eventos.length === 0 ? (
              <div className="no-events">Nenhum evento encontrado</div>
            ) : (
              eventos.map((evento) => (
                <div key={evento.idEvento} className="event-card">
                  <img
                    src={evento.imagem || "/default-event.jpg"}
                    alt={evento.nomeEvento}
                    onError={(e) => {
                      e.target.src = "/default-event.jpg";
                    }}
                  />
                  <div className="event-info">
                    <div className="event-main">
                      <div className="event-title-tags">
                        <h3>{evento.nomeEvento}</h3>
                        <div className="tags">
                          <span className={`tag ${getStatusClass(evento.statusEvento?.situacao)}`}>
                            {evento.statusEvento?.situacao || "Sem status"}
                          </span>
                          <span className={`tag ${getCategoriaClass(evento.categoria?.nome)}`}>
                            {evento.categoria?.nome || "Sem categoria"}
                          </span>
                        </div>
                      </div>
                      <div className="event-details">
                        <div className="detail">
                          <img src="/calendar-icon.png" alt="Calendário" />
                          <span>
                            {evento.dia} {evento.horaInicio} - {evento.horaFim}
                          </span>
                        </div>
                        <div className="detail">
                          <img src="/person-icon.png" alt="Participantes" />
                          <span>
                            {evento.qtdInteressado || 0}/{evento.qtdVaga || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="event-extra">
                    <button onClick={() => handleMaisInformacoes(evento.idEvento)}>
                      Mais informações
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            display: window.innerWidth <= 1024 ? "block" : "none"
          }}
        />
      )}
    </div>
  );
}

export default EventosBeneficiario;
