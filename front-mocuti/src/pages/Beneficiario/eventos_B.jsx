import React, { useEffect, useState } from "react";
import "../../styles/EventoBeneficiario.css";
import image3 from "../../assets/images/image3.png";
// import calendar from "../../assets/images/calendar";
// import frame from "../../assets/images/frame";
// import PersonIcon from "../../assets/images/search";

const EventoBeneficiario = () => {
  const [eventos, setEventos] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [statusEventos, setStatusEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEventos() {
      try {
        // eventos
        const resEventos = await fetch("http://localhost:8080/eventos");
        if (!resEventos.ok) throw new Error("Erro ao buscar eventos");
        const eventosData = await resEventos.json();
        setEventos(eventosData);

        // enderecos
        const resEnderecos = await fetch("http://localhost:8080/endereco");
        if (!resEnderecos.ok) throw new Error("Erro ao buscar endereços");
        const enderecosData = await resEnderecos.json();
        setEnderecos(enderecosData);

        // categorias
        const resCategorias = await fetch("http://localhost:8080/categorias");
        if (!resCategorias.ok) throw new Error("Erro ao buscar categorias");
        const categoriasData = await resCategorias.json();
        setCategorias(categoriasData);

        // status evento
        const resStatus = await fetch("http://localhost:8080/status-eventos");
        if (!resStatus.ok) throw new Error("Erro ao buscar status de evento");
        const statusData = await resStatus.json();
        setStatusEventos(statusData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEventos();
  }, []);

  // funções auxiliares para resolver as FKs
  const getEndereco = (id) => {
    const e = enderecos.find((x) => x.id === id);
    return e ? `${e.logradouro}, ${e.numero} - ${e.bairro} / ${e.estado}` : "";
  };

  const getCategoria = (id) => {
    const c = categorias.find((x) => x.id === id);
    return c ? c.nome : "";
  };

  const getStatus = (id) => {
    const s = statusEventos.find((x) => x.id === id);
    return s ? s.situacao : "";
  };

  return (
    <div className="content">
      <h1>Eventos</h1>

      <div className="filters">
        <div className="juntar">
          <div className="search-container">
            <input type="text" placeholder="Pesquisar evento" />
            <img  src={image3} alt="Buscar" className="search-icon" />
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

      {/* Card */}
      {eventos.map((evento) => (
        <div key={evento.idEvento} className="event-card">
          <img src={image3} alt="Evento" />
          <div className="event-info">
            <div className="event-main">
              <div className="event-title-tags">
                <h3>{evento.nomeEvento}</h3>
                <div className="tags">
                  <span className="tag green">{getStatus(evento.tatus_evento)}</span>
                  <span className="tag orange">{getCategoria(evento.ategoria_evento)}</span>
                </div>
              </div>
              <div className="event-details">
                <div className="detail">
                  <img src="calendar.png" alt="Calendário" />
                  <span>{evento.dataEvento}</span>
                </div>
                <div className="detail">
                  <img src="person.png" alt="Participantes" />
                  <span>{evento.qtdParticipantes}/{evento.qtdVagas}</span>
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