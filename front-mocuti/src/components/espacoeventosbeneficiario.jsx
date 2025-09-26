import "../styles/espacoeventosbeneficiario.css";

export default function EspacoEventosBeneficiario() {
    return(
    <div className="espaco-eventos-beneficiario-geral">
        <div className="espaco-eventos-beneficiario-engloba-eventos">
            <div className="espaco-eventos-beneficiario-eventos">
                <div className="espaco-eventos-beneficiario-lista">
                    <div className="eventos-beneficiario-lista">
                        <img src="" alt="" className="eventos-foto-beneficiario"/>
                        <div className="eventos-descricao-beneficiario">
                            <div className="eventos-titulo-beneficiario">
                                <h3>Titulo do evento</h3>
                            </div>
                            <div className="eventos-tipocategoria-beneficiario">
                                <div className="eventos-categoria-beneficiario">
                                    Categoria:
                                    </div>
                                <div className="eventos-status-beneficiario">
                                    Status:
                                    </div>
                            </div>
                        </div>
                        <div className="eventos-data-beneficiario"></div>
                        <div className="eventos-pessoas-beneficiario"></div>
                        <div className="eventos-tiposbotoes-beneficiario">
                            <button></button>
                            <button></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}