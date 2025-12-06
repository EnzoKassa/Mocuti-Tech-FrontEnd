import React, { useState } from "react";
import mocutiRodape from "../assets/images/mocuti-rodape.svg";
import { Link } from "react-router-dom";
import natal from "../assets/images/natal.png";
import parceiro from "../assets/images/parceiros.svg";
import varal from "../assets/images/varal.png";
import inicio from "../assets/images/fundo-inicio.svg";
import { NavHome } from "../components/NavBarHome";

const Home = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  // ============================
  // ACESSIBILIDADE
  // ============================
  const [fontSize, setFontSize] = useState(100);

  const aumentarFonte = () => {
    const novo = Math.min(fontSize + 10, 200);
    setFontSize(novo);
    document.documentElement.style.fontSize = novo + "%";
  };

  const diminuirFonte = () => {
    const novo = Math.max(fontSize - 10, 50);
    setFontSize(novo);
    document.documentElement.style.fontSize = novo + "%";
  };

  // ============================
  // EMAIL
  // ============================
  const handleEnviarEmail = () => {
    if (!email || !mensagem) {
      alert("Por favor, preencha todos os campos antes de enviar.");
      return;
    }

    const destinatario = "ryan.oliviera@sptech.school";
    const assunto = `Contato via site - ${email}`;
    const corpo = encodeURIComponent(`Email: ${email}\n\nMensagem:\n${mensagem}`);
    const link = `mailto:${destinatario}?subject=${encodeURIComponent(
      assunto
    )}&body=${corpo}`;

    window.location.href = link;
  };

  return (
    <div className="w-full overflow-x-hidden font-[Montserrat]">

      <NavHome />

      {/* BOTÕES ACESSIBILIDADE */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <button
          onClick={aumentarFonte}
          className="w-12 h-12 rounded-md bg-[#001F4D] text-white text-[18px] font-bold shadow-lg hover:bg-[#012d73] transition"
        >
          A+
        </button>

        <button
          onClick={diminuirFonte}
          className="w-12 h-12 rounded-md bg-[#001F4D] text-white text-[18px] font-bold shadow-lg hover:bg-[#012d73] transition"
        >
          A-
        </button>
      </div>

      {/* INÍCIO */}
      <section
        id="inicio"
        className="flex justify-start items-center w-screen h-screen bg-cover bg-center pl-[5%]"
        style={{ backgroundImage: `url(${inicio})` }}
      >
        <div className="w-1/2 h-full flex justify-center items-end flex-col">
          <div className="w-full h-[60%] flex flex-col justify-center items-center bg-white/80 backdrop-blur-sm rounded-tr-[30px] rounded-bl-[30px] border-2 border-[#4FBD34]">

            <div className="w-[90%] h-[40%] flex flex-col justify-start items-start p-[2%]">
              <h1 className="text-5xl font-extrabold">Bem-vindo ao Mocuti</h1>
              <h3 className="text-2xl font-extrabold">
                Participe dos nossos eventos, compartilhe ideias e faça parte
                dessa mudança!
              </h3>
            </div>

            <div className="w-[90%] h-[20%] flex flex-col justify-start items-start pl-[2%]">
              <p className="text-base font-semibold">
                Desde a nossa fundação, concentramos nosso foco em fortalecer a
                identidade do território, dando voz e protagonismo aos moradores.
              </p>
            </div>

            <div className="w-[90%] flex flex-col justify-center items-start pl-[2%]">
              <a
                href="#sobre"
                className="w-[300px] h-[60px] flex items-center justify-center text-white text-base font-semibold bg-[#4FBD34] hover:bg-[#0b9b13] transition rounded-none [clip-path:polygon(3%_0,98%_0,100%_52%,98%_100%,3%_100%,0_45%)]"
              >
                Saiba Mais
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE NÓS */}
      <div id="sobre" className="w-screen h-[80vh] flex justify-center items-center">
        <div className="w-[80%] h-[80%] flex justify-around items-center gap-[5%] bg-white">
          <div className="w-[45%] h-full flex flex-col justify-center items-center">
            <div className="w-full h-1/2 flex flex-col justify-center items-start">
              <h1 className="text-3xl font-extrabold">Sobre Nós</h1>

              <p className="text-base font-normal">
O Movimento Cultural de Cidade Tiradentes MOCUTI é uma ONG fundada em 1989 e registrada oficialmente em 1997, localizada na zona leste de São Paulo. Desde sua criação, atua em atividades culturais, comunitárias e sociais, com o objetivo de valorizar a cultura local, promover educação e combater desigualdades.

              </p>

              <p className="text-base font-normal mt-3">
Seu propósito central é fortalecer a identidade do território e dar protagonismo aos moradores de Cidade Tiradentes. Para isso, desenvolve projetos inclusivos e sustentáveis que buscam empoderar a comunidade e estimular a participação ativa na construção de um ambiente mais justo e culturalmente rico.
              </p>
            </div>

            <div className="w-full h-[20%] flex justify-start items-center">
              <a
                href="#linha-do-tempo"
                className="w-[300px] h-[60px] flex items-center justify-center text-white text-base font-semibold bg-[#3DA5E1] hover:bg-[#2a8acc] transition rounded-none [clip-path:polygon(3%_0,98%_0,100%_52%,98%_100%,3%_100%,0_45%)]"
              >
                Saiba Mais Sobre Nossa História
              </a>
            </div>
          </div>

          <div className="w-[40%] h-full flex justify-center items-center">
            <img src={parceiro} alt="" />
          </div>
        </div>
      </div>

      {/* LINHA DO TEMPO */}
      <div id="linha-do-tempo" className="w-screen h-[65vh] flex flex-col justify-center items-center gap-10">
        <div className="w-[80%] flex items-center justify-start">
          <h1 className="text-3xl font-extrabold">Linha do Tempo</h1>
        </div>

        <div className="w-[80%] flex flex-col justify-center items-center">
          <div className="flex justify-start items-center gap-[5%] w-[80%] mb-4">
            <div className="w-[40%] text-left flex alin-items-center justify-center">
              <p className="text-base">
                <strong className="text-[#3DA5E1]">1997 - Fundação MOCUTI</strong><br />
                Nasce o MOCUTI...
              </p>
            </div>

            <div className="w-[40%] text-left flex alin-items-center justify-center">
              <p className="text-base">
                <strong className="text-[#FFBB00]">1998 - Primeira Campanha</strong><br />
                Realizamos nossa primeira campanha...
              </p>
            </div>
          </div>

          <div className="flex justify-end items-center gap-[5%] w-[80%]">
            <div className="w-[40%] text-left flex alin-items-center justify-center">
              <p className="text-base">
                <strong className="text-[#FF4848]">1999 - Sede Comunitária</strong><br />
                Inauguramos nossa sede...
              </p>
            </div>

            <div className="w-[40%] text-left flex alin-items-center justify-center">
              <p className="text-base">
                <strong className="text-[#4FBD34]">2000 - Pré-vestibular</strong><br />
                Primeiro curso pré-vestibular...
              </p>
            </div>
          </div>
        </div>

        <div className="w-[80%] flex items-center justify-start mt-6">
          <a
            href="#eventos"
            className="w-[300px] h-[60px] flex items-center justify-center text-white text-base font-semibold bg-[#FFBB00] hover:bg-[#e1a600] transition rounded-none [clip-path:polygon(3%_0,98%_0,100%_52%,98%_100%,3%_100%,0_45%)]"
          >
            Conheça Nossos Eventos
          </a>
        </div>
      </div>

      {/* NOSSOS EVENTOS */}
      <div id="eventos" className="min-h-screen w-screen gap-7 flex flex-col justify-center items-center overflow-hidden">

        <div className="w-1/2 h-1/4 flex justify-center items-center">
          <h1 className="text-3xl font-extrabold">Nossos Eventos</h1>
        </div>

        <div className="flex gap-8 items-center justify-center w-screen h-1/2 overflow-x-auto whitespace-nowrap px-8">
          {[
            { img: inicio, title: "Natal Consciente", bg: "#4FBD34" },
            { img: natal, title: "Natal Consciente", bg: "#3DA5E1" },
            { img: inicio, title: "Infância sem Racismo", bg: "#FFBB00" },
            { img: varal, title: "Varal Solidário", bg: "#FF4848" },
            { img: inicio, title: "Apadrinhamento", bg: "#4FBD34" },
          ].map((event, index) => (
            <div
              key={index}
              className="flex-none w-[30vw] h-[90%] flex flex-col rounded-2xl overflow-hidden"
              style={{ backgroundColor: event.bg }}
            >
              <div className="h-[80%] w-full">
                <img
                  src={event.img}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[20%] w-full flex justify-center items-center">
                <p className="text-lg font-semibold">{event.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[20%] w-[20vw] flex justify-center items-center">
          <Link
            to="/login"
            className="w-[300px] h-[60px] flex items-center justify-center text-white text-base font-semibold bg-[#4FBD34] hover:bg-[#0b9b13] transition rounded-none [clip-path:polygon(3%_0,98%_0,100%_52%,98%_100%,3%_100%,0_45%)]"
          >
            Eventos Agendados
          </Link>
        </div>

        {/* RODAPÉ */}
        <div className="h-[50vh] w-screen bg-[#E2E2E2] flex justify-center items-center">
          <div className="w-[25vw] h-full flex justify-start items-center">
            <img src={mocutiRodape} alt="" />
          </div>

          <div className="w-[33vw] h-full flex flex-col justify-center items-start gap-4 font-semibold">
            <p className="text-base">Caso existir dúvidas, entre em contato:</p>
            <input
              type="text"
              placeholder="Email:"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[3vh] bg-white border border-gray-300 text-base px-2 rounded"
            />
            <textarea
              placeholder="Mensagem:"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full h-[8vh] bg-white border border-gray-300 text-base px-2 py-2 rounded resize-none text-left align-top"
            ></textarea>


    <button
  onClick={handleEnviarEmail}
  className="h-[4vh] w-[35%] bg-[#4FBD34] text-white flex justify-center items-center font-semibold text-center"
>
  Enviar Email
</button>
          </div>

          <div className="w-[25vw] h-full flex flex-row justify-end items-center text-base">
            <div className="w-[40%] h-[80%] flex flex-col justify-center items-start gap-[10%]">
              <a href="#sobre">Sobre Nós</a>
              <a href="#inicio">Home</a>
              <a href="#eventos">Nossos Eventos</a>
            </div>
            <div className="w-[40%] h-[80%] flex flex-col justify-center items-start gap-[10%]">
              <Link to="/login">Login</Link>
              <Link to="/cadastro">Cadastro</Link>
              <a href="#">ㅤ</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
