import "../styles/FiltroBeneficiario.css";

export default function FiltroBeneficiario() {
    return (
        <div className="espacofiltrobeneficiario">
            <div className="espacoentornofiltrobeneficiario">
                <div className="inputsespacobeneficiario">
                    <div className="inputespacobeneficiarioseparacao1">
                        <input placeholder="Pesquisar nome do evento..." type="text"/>
                    </div>
                    <div className="inputespacobeneficiarioseparacao2">
                        <div className="inputespacobeneficiarioseparacao2-caixa1">
                            DE: <input type="date"/>
                        </div>
                        <div className="inputespacobeneficiarioseparacao2-caixa2">
                            ATÉ: <input type="date"/>
                        </div>
                        <div className="inputespacobeneficiarioseparacao2-caixa3">
                            <select name="Categoria" id="">
                                <option value="">Categoria</option>
                                <option value="evento">Evento</option>
                                <option value="oficina">Oficina</option>
                            </select>
                        </div>
                        <div className="inputespacobeneficiarioseparacao2-caixa4">
                            <select name="Status" id="">
                                <option value="">Status</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="botaoespacobeneficiario">
                    <button>Pesquisar</button>
                </div>
            </div>
        </div>
    );
}