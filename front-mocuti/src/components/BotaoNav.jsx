import "../styles/BotaoNav.css";


export function BotaoNav({ texto, imgLink }) {
  return (
    <button className="btnLateralHome">
      <img src={imgLink} alt={texto} />
      {texto}
    </button>
  );
}