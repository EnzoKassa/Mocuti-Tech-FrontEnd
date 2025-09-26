import React, { useState, useEffect } from "react";
import "../../styles/eventos_B.css";
import "../../styles/header_B.css";
import icone from "../../assets/images/IconeLugar.png";
import telefone from "../../assets/images/telefone.png";
import logoOng from "../../assets/images/logo.png";

const HeaderInfo = () => (
  <div className="header-info-bar">
    <div className="header-info-content">
      <span className="info-item">
        <img src={icone} alt="iconepesquisa" className="iconepesquisa" /> 
        Av dos Metalúrgicos 1081
      </span>
      <div className="social-contacts">
        <span className="info-item">
          <img src={telefone} alt="iconetelefone" className="iconetelefone" /> 
          11 99999-9999
        </span>
      </div>
    </div>
  </div>
);

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    categoria: "",
    status: "",
    texto: "",
  });

  const handlePesquisar = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:8080/eventos"; 
      const params = new URLSearchParams();

      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);
      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.status) params.append("status", filtros.status);
      if (filtros.texto) params.append("texto", filtros.texto);

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Buscar imagens de cada evento - TA AQ JHONY
      const eventosComImg = await Promise.all(
        data.map(async (evento) => {
          try {
            const imgResponse = await fetch(`http://localhost:8080/eventos/foto/${evento.idEvento}`);
            if (imgResponse.ok) {
              const blob = await imgResponse.blob();
              const imgUrl = URL.createObjectURL(blob);
              return { ...evento, imagemUrl: imgUrl };
            } else {
              return { ...evento, imagemUrl: null }; // sem foto
            }
          } catch {
            return { ...evento, imagemUrl: null };
          }
        })
      );

      setEventos(eventosComImg);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePesquisar();
  }, []);

  const formatarHora = (hora) => hora.substring(0, 5);
  const formatarData = (data) => data.split("-").reverse().join("/");

  return (
    <div className="page-container">
      <HeaderInfo />

      <header className="topbar">
        <div className="topbar-inner">
          <img src={logoOng} alt="Logo da ONG" className="logo" />
          <nav className="nav-tabs">
            <button className="tab active">Calendário</button>
            <button className="tab">Meu Perfil</button>
            <button className="tab">Meus Eventos</button>
          </nav>
          <div className="nav-placeholder"></div>
        </div>
      </header>

      <main className="main-content">
        {/* ======================= FILTROS ======================= */}
        <div className="filtros-container">
          <div className="search-bar-top">
            <input
              type="text"
              placeholder="Pesquisar sobre evento..."
              className="search-input-main"
              value={filtros.texto}
              onChange={(e) => setFiltros({ ...filtros, texto: e.target.value })}
            />
          </div>
          <div className="filtros-bottom-row">
            <input type="date" value={filtros.dataInicio} onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })} />
            <input type="date" value={filtros.dataFim} onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })} />
            <select value={filtros.categoria} onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}>
              <option value="">Categoria</option>
            </select>
            <select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
              <option value="">Status</option>
            </select>
            <button onClick={handlePesquisar} className="search-button">Pesquisar</button>
          </div>
        </div>

        <div className="lista-eventos">
          {loading ? (
            <p>Carregando eventos...</p>
          ) : eventos.length > 0 ? (
            eventos.map((evento) => (
              <div key={evento.idEvento} className="evento-card">
                {evento.imagemUrl ? (
                  <img src={evento.imagemUrl} alt={evento.nomeEvento} className="evento-imagem" />
                ) : (
                  <div className="evento-sem-imagem">Sem imagem</div>
                )}

                <div className="evento-info">
                  <h3>{evento.nomeEvento}</h3> 
                  <div className="tags">
                    <span className="tag status">{evento.statusEvento.situacao}</span>
                    <span className="tag categoria">{evento.categoria.nome}</span>
                  </div>
                  <div className="detalhes">
                    <span>📅 Início: {formatarData(evento.dia)} às {formatarHora(evento.horaInicio)}</span>
                    <span>👥 {evento.qtdInteressado}/{evento.qtdVaga}</span>
                  </div>
                </div>
                <div className="evento-acoes">
                  <button className="btn-info">Mais informações</button>
                  <button className="btn-participar">Quero participar</button>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum evento encontrado</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Eventos;
