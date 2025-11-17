import Swal from "sweetalert2";
import axios from "axios";
import { useEffect, useState } from "react";
import { NavLateral } from "../../components/NavLateral";
import { TabelaEventos } from "../../components/ListaEventosm2";
import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import convite from "../../assets/images/convitesLogo.svg";

import "../../styles/convitesM2.css";

const Convites = () => {
  const [eventos, setEventos] = useState([]);

  const usuarioData = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );
  const usuarioId = usuarioData?.id;

  // Busca eventos do usuário
  useEffect(() => {
    if (!usuarioId) return;

    axios
      .get(`http://localhost:8080/participacoes/usuario/${usuarioId}`)
      .then((res) => {
        const adaptado = res.data.map((ev) => ({
          eventoId: ev.idEvento,
          nome: ev.nomeEvento,
          data: new Date(ev.dia).toLocaleDateString("pt-BR"),
      status: ev.status, // agora pega 1, 2 ou 3
        }));
        setEventos(adaptado);
      })
      .catch((err) => console.error("Erro ao buscar eventos:", err));
  }, [usuarioId]);

  // Atualiza status no backend e no front
  const atualizarPresenca = async (evento, novoStatus) => {
  try {
    await axios.patch("http://localhost:8080/participacoes/atualizar", {
      usuarioId,
      eventoId: evento.eventoId,
      statusInscricaoId: novoStatus,
    });

    setEventos((prev) =>
      prev.map((ev) =>
        ev.eventoId === evento.eventoId ? { ...ev, status: novoStatus } : ev
      )
    );

    Swal.fire({
      title: "Sucesso!", 
      text: "Status atualizado com sucesso.",
      icon: "success",
    confirmButtonColor: '#04bf29'});
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    Swal.fire("Erro!", "Não foi possível atualizar.", "error");
  }
};

  // Toggle do switch
const handleTogglePresenca = async (evento) => {
  let novoStatus = evento.status;

  if (evento.status === 1) {
    // pendente -> escolher entre confirmar ou cancelar
    const choice = await Swal.fire({
      title: "Alterar status da sua participação",
      html: `<b>${evento.nome}</b>`,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Confirmar",
            confirmButtonColor: '#04bf29',
      denyButtonText: "Cancelar",
      cancelButtonText: "Fechar",
    });

    if (choice.isConfirmed) novoStatus = 2; // confirmou
    else if (choice.isDenied) novoStatus = 3; // cancelou
    else return; // fechou, não faz nada
  } else if (evento.status === 2) {
    // confirmada -> só cancelar
    const choice = await Swal.fire({
      title: "Cancelar presença?",
      text: "Deseja cancelar sua participação?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar",
      confirmButtonColor: '#d33',
      cancelButtonText: "Voltar",
    });
    if (!choice.isConfirmed) return;
    novoStatus = 3;
  } else if (evento.status === 3) {
    // cancelada -> só confirmar
    const choice = await Swal.fire({
      title: "Confirmar presença?",
      html: `<b>${evento.nome}</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, confirmar",
      confirmButtonColor: '#04bf29',
      cancelButtonText: "Fechar",
    });
    if (!choice.isConfirmed) return;
    novoStatus = 2;
  }

  atualizarPresenca(evento, novoStatus);
};

  const rotasPersonalizadas = [
    { texto: "Eventos", img: Calendario, rota: "/moderador/eventos" },
    { texto: "Convites", img: convite, rota: "/moderador/convites" },
    { texto: "Feedbacks", img: feedback, rota: "/moderador/feedbacks" },
    { texto: "Meu Perfil", img: MeuPerfil, rota: "/moderador/perfil" },
  ];


  return (
    <div className="MainConvitesM2">
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />

      <div className="scroll-page">
        <div className="convite">
          <div className="m2-feedback-container">
            <div className="feedback-title">Convites</div>

            <TabelaEventos
              eventos={eventos}
              onTogglePresenca={handleTogglePresenca}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Convites;
