import "../styles/EspacoEventosBeneficiario.css";
import calendar from "../assets/images/calendar.png";
import people from "../assets/images/Person.png";

export default function EspacoEventosBeneficiario({
  eventos,
  mostrarParticipar = true,
  onOpenModal,
}) {
  return (
    <div className="espaco-eventos-beneficiario-geral">
      <div className="espaco-eventos-beneficiario-engloba-eventos">
        <div className="espaco-eventos-beneficiario-eventos">
          <div className="espaco-eventos-beneficiario-lista">
            {(!eventos || eventos.length === 0) && (
              <p>Nenhum evento encontrado.</p>
            )}
            {eventos &&
              eventos.map((evento, idx) => (
                <div
                  className="eventos-beneficiario-lista"
                  key={evento.idEvento || idx}
                >
                  <img
                    src={evento.imagemUrl || ""}
                    alt="Foto evento"
                    className="eventos-foto-beneficiario"
                  />
                  <div className="eventos-descricao-beneficiario">
                    <div className="eventos-titulo-beneficiario">
                      <h3>{evento.nomeEvento || evento.nome}</h3>
                    </div>
                    <div className="eventos-tipocategoria-beneficiario">
                      <div className="eventos-categoria-beneficiario">
                        Categoria: <a href="#">{evento.categoria?.nome}</a>
                      </div>
                      <div className="eventos-status-beneficiario">
                        Status: <a href="#">{evento.statusEvento?.situacao}</a>
                      </div>
                    </div>
                  </div>
                  <div className="eventos-data-beneficiario">
                    <img src={calendar} style={{ width: "30%" }} alt="" />
                    <a href="#">{evento.dia || evento.dataInicio}</a>
                  </div>
                  <div className="eventos-pessoas-beneficiario">
                    <img src={people} style={{ width: "40%" }} alt="" />
                    <a href="#">
                      {evento.qtdInteressado}/{evento.qtdVaga}
                    </a>
                  </div>

                  <div className="eventos-tiposbotoes-beneficiario">
                    <button
                      style={{ backgroundColor: "#3DA5E1" }}
                      onClick={() => onOpenModal(evento)}
                    >
                      Mais Informações
                    </button>

                    {mostrarParticipar && (
                      <button style={{ backgroundColor: "#4FBD34" }}>
                        Quero Participar
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
