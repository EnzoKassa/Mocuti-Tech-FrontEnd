import "../styles/BotaoNav.css";


export function BotaoNav({ texto, imgLink, onClick }) {
  return (
    <button className="btnLateralHome" onClick={onClick}>
      <img src={imgLink} alt={texto} />
      {texto}
    </button>
  );
}

