import "../styles/EspacoEventosBeneficiario.css";
import calendar from "../assets/images/calendar.png";
import people from "../assets/images/Person.png";

export default function EspacoEventosBeneficiario({ eventos }) {
const formatarData = (dataStr) => {
// ... (função formatarData permanece a mesma, pois a data está vindo corretamente)
if (!dataStr) return "";

const datePart = dataStr.split('T')[0]; 
if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
const [y, m, d] = datePart.split("-");
return `${d}/${m}/${y.slice(-2)}`;
}

const dObj = new Date(dataStr);
if (!isNaN(dObj.getTime())) {
const dia = String(dObj.getDate()).padStart(2, "0");
const mes = String(dObj.getMonth() + 1).padStart(2, "0");
const ano = String(dObj.getFullYear()).slice(-2);
return `${dia}/${mes}/${ano}`;
}
return dataStr;
};

const formatarHora = (horaStr) => {
if (!horaStr) return "";
return horaStr.substring(0, 5);
};

return (
<div className="espaco-eventos-beneficiario-geral">
<div className="espaco-eventos-beneficiario-engloba-eventos">
<div className="espaco-eventos-beneficiario-eventos">
<div className="espaco-eventos-beneficiario-lista">
{(!eventos || eventos.length === 0) && <p>Nenhum evento encontrado.</p>}
{eventos &&
eventos.map((evento, idx) => (
<div className="eventos-beneficiario-lista" key={evento.idEvento || idx}>
{evento.imagemUrl ? (
<img src={evento.imagemUrl} alt="Foto evento" className="eventos-foto-beneficiario" />
) : (
<div className="evento-sem-imagem">Sem imagem</div>
)}

<div className="eventos-descricao-beneficiario">
<div className="eventos-titulo-beneficiario">
<h3>{evento.nomeEvento || evento.nome}</h3>
</div>
<div className="eventos-tipocategoria-beneficiario">
<div className="eventos-categoria-beneficiario">
{/* LEITURA REVISADA: Lendo a nova propriedade simples */}
Categoria: <a href="#">{evento.categoriaNome || evento.categoria?.nome}</a>
</div>
<div className="eventos-status-beneficiario">
{/* LEITURA REVISADA: Lendo a nova propriedade simples */}
Status: <a href="#">{evento.statusSituacao || evento.statusEvento?.situacao}</a>
</div>
</div>
</div>

<div className="eventos-data-beneficiario">
<img src={calendar} style={{ width: "30%" }} alt="Ícone de Calendário" />
<a href="#">
{formatarData(evento.dia || evento.dataInicio)}{" "}
{evento.horaInicio ? `às ${formatarHora(evento.horaInicio)}` : ""}
</a>
</div>

<div className="eventos-pessoas-beneficiario">
<img src={people} style={{ width: "40%" }} alt="Ícone de Pessoas" />
<a href="#">
{evento.qtdInteressado ?? 0}/{evento.qtdVaga ?? 0}
</a>
</div>

<div className="eventos-tiposbotoes-beneficiario">
<button style={{ backgroundColor: "#3DA5E1" }}>Mais Informações</button>
<button style={{ backgroundColor: "#4FBD34" }}>Quero Participar</button>
</div>
</div>
))}
</div>
</div>
</div>
</div>
);
}