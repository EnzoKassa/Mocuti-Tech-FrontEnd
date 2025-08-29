import React, { useEffect, useState } from "react";
import "../../styles/EventoBeneficiario.css";
import image3 from "../../assets/images/image3.png";

const EventoBeneficiario = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEventos() {
      try {
        const resEventos = await fetch("http://localhost:8080/eventos");
        if (!resEventos.ok) throw new Error("Erro ao buscar eventos");
        const eventosData = await resEventos.json();
        setEventos(eventosData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEventos();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="content">
      <h1>Eventos</h1>

      {/* filtros */}
      <div className="filters">
        <div className="juntar">
          <div className="search-container">
            <input type="text" placeholder="Pesquisar evento" />
            <img src={image3} alt="Buscar" className="search-icon" />
          </div>
          <div className="date-filter">
            <span className="label">de:</span>
            <input type="date" />
            <span className="label">até:</span>
            <input type="date" />
            <select>
              <option>Categoria</option>
            </select>
            <select>
              <option>Status</option>
            </select>
          </div>
        </div>
        <div className="botao-pesquisar">
          <button>Pesquisar</button>
        </div>
      </div>

      {/* Cards */}
      {eventos.map((evento) => (
        <div key={evento.idEvento} className="event-card">
          <img src={image3} alt="Evento" />
          <div className="event-info">
            <div className="event-main">
              <div className="event-title-tags">
                <h3>{evento.nomeEvento}</h3>
                <div className="tags">
                  <span className="tag green">{evento.statusEvento?.situacao}</span>
                  <span className="tag orange">{evento.categoria?.nome}</span>
                </div>
              </div>
              <div className="event-details">
                <div className="detail">
                  <img src="calendar.png" alt="Calendário" />
                  <span>
                    {evento.dia} {evento.horaInicio} - {evento.horaFim}
                  </span>
                </div>
                <div className="detail">
                  <img src="person.png" alt="Participantes" />
                  <span>
                    {evento.qtdInteressado}/{evento.qtdVaga}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="event-extra">
            <button>Mais informações</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventoBeneficiario;