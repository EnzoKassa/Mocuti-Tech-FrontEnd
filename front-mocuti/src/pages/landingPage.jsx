import React, { useEffect, useState } from "react";
import "../styles/bottom.css";
import mocutiRodape from "../assets/images/mocuti-rodape.svg";
import natal from "../assets/images/natal.png";
import carnaval from "../assets/images/carnaval.jpeg";
import apadrinhamento from "../assets/images/apadrinhamento.jpeg";
import infancia from "../assets/images/infancia.jpeg";
import parceiro from "../assets/images/parceiros.svg";
import telefone from "../assets/images/telefone.svg";
import varal from "../assets/images/varal.png";
import zap from "../assets/images/Wattsapp.svg";
import face from "../assets/images/Facebook.svg";
import email from "../assets/images/Email.svg";
import insta from "../assets/images/Instagram.svg";
import inicio from "../assets/images/fundo-inicio.svg";
import logo from "../assets/images/image (1).svg";
import location from "../assets/images/location.svg";
import menu from "../assets/images/menu.png";
import { useRef } from "react";


import { useNavigate } from 'react-router-dom';




const Home = () => {

  const navigate = useNavigate();
  const carouselRef = useRef(null); // ✅ dentro do componente

  const scrollCarousel = (direction) => { // ✅ dentro do componente
    const container = carouselRef.current;
    if (!container) return;

    const cardWidth = container.firstChild.offsetWidth + 20; // largura + gap
    container.scrollBy({
      left: direction * cardWidth,
      behavior: "smooth"
    });
  };




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


  return (
    <div className="landing-body">
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

      {/* <div> */}
      {/* Navbar */}
      <div className="nav-home">
        <div className="nav-box">
          <div
            className="nav-endereco"
            onClick={() => window.open("https://www.google.com/maps/place/Av+dos+Metalurgicos,+1081", "_blank")}
            style={{ cursor: "pointer" }}
          >
            <img src={location} alt="Localização" />
            Av dos Metalúrgicos, 1081
          </div>
          <div className="nav-contato">
            <img src={telefone} alt="Telefone" /> 11 98971-1297

            <a href="https://www.instagram.com/anarita.producoes" target="_blank" rel="noopener noreferrer">
              <img src={insta} alt="Instagram" />
            </a>

            <a href="https://wa.me/5511989711297" target="_blank" rel="noopener noreferrer">
              <img src={zap} alt="WhatsApp" />
            </a>

            <a href="https://www.facebook.com/share/1CUjDLGFhT/" target="_blank" rel="noopener noreferrer">
              <img src={face} alt="Facebook" />
            </a>

            <a href="mailto:sitemocuti@gmail.com">
              <img src={email} alt="Email" />
            </a>
          </div>
        </div>
        <div className="nav-links-home">
          <div className="nav-box-botoes">
            <div className="nav-box-logo">
              <img src={logo} alt="" />
            </div>


            <div className="nav-links-botoes-home">
              <a href="#inicio" className="botoes-nav btn-inicio">Início</a>
              <a href="#sobre" className="botoes-nav btn-sobre">Sobre Nós</a>
              <a href="#linha-do-tempo" className="botoes-nav btn-linha">Linha do Tempo</a>
              <a href="#eventos" className="botoes-nav btn-eventos">Eventos</a>
            </div>

            <div className="nav-box-cadastro">
              <a onClick={() => navigate('/cadastro')} className="botoes-cadastro-nav">Criar Conta</a>
              <a onClick={() => navigate('/login')} className="botoes-cadastro-nav-blue">Entrar</a>
            </div>
          </div>
        </div>
      </div>


      <div className="nav-home-mobile">
        <div className="nav-mobile-header">
          <img src={logo} alt="Logo" />
          <button className="menu-toggle"> <img className="img-menu-mobile" src={menu} alt="" /></button>
        </div>
        <div className="nav-mobile-botoes">
          <a href="#inicio" className="botoes-nav btn-inicio">Início</a>
          <a href="#sobre" className="botoes-nav btn-sobre">Sobre Nós</a>
          <a href="#linha-do-tempo" className="botoes-nav btn-linha">Linha do Tempo</a>
          <a href="#eventos" className="botoes-nav btn-eventos">Eventos</a>
          <a onClick={() => navigate('/cadastro')} className="botoes-cadastro-nav">Criar Conta</a>
          <a onClick={() => navigate('/login')} className="botoes-cadastro-nav-blue">Entrar</a>
        </div>
      </div>

      {/* Tela Início com fundo SVG */}
      <section
        className="tela-inicio"
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          flexDirection: "row",
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${inicio})`,
          backgroundSize: "cover",
          paddingLeft: "5%",
        }}
      >
        <div className="alinhar-esquerda-inicio">
          <div className="box-texto-inicio">
            <div className="box-texto-inicio-title">
              <h1>Bem-vindo ao Mocuti</h1>
              <h3>Participe dos nossos eventos, compartilhe ideias e faça parte dessa mudança!</h3>
            </div>
            <div className="box-texto-inicio-texto">
              <p>Desde a nossa fundação, concentramos nosso foco em fortalecer a identidade do território, dando voz e protagonismo aos moradores do bairro de forma inclusiva e sustentável. Somos uma rede viva, feita de histórias, encontros e ações que transformam.</p>
            </div>
            <div className="box-alinharmento-texto-button">
              <a href="#sobre" className="btn-diferenciado">
                Saiba Mais
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nós */}
      <div className="sobre-nos" id="sobre">
        <div className="box-sobre-nos">
          <div className="box-sobre-nos-left">
            <div className="box-sobre-nos-textos">
              <h1>Sobre Nós</h1>
              <p>
                Movimento Cultural de Cidade Tiradentes, ou Mocuti, é uma
                organização não governamental sem fins lucrativos localizada no
                bairro Cidade Tiradentes, distrito da zona leste da cidade de
                São Paulo fundada em 1989 e oficialmente registrada no ano de
                1997.
              </p>
              <p>
                O movimento exerce diversas atividades de aspecto cultural,
                comunitário e social na região, tendo como propósito valorizar a
                cultura territorial, empoderar o público com projetos educativos
                e combater desigualdades. Desde sua fundação a associação tem
                concentrado seu foco em buscar a “identidade do território” a
                fim de dar protagonismo aos moradores do bairro de maneira
                inclusiva e sustentável.
              </p>
            </div>
            <div className="box-sobre-nos-botoes">
              <a href="#linha-do-tempo" className="btn-diferenciado" style={{ backgroundColor: "#3DA5E1" }}>
                Saiba Mais Sobre Nossa História
              </a>
            </div>
          </div>
          <div className="box-sobre-nos-imagem">
            <img src={parceiro} alt="" />
          </div>
        </div>
      </div>

      {/* Linha do Tempo */}
      <div id="linha-do-tempo" className="linha-do-tempo">
        <div className="titulo-linha-do-tempo">
          <h1>Linha do Tempo</h1>
        </div>
        <div className="conteudo-linha-do-tempo">
          <div className="top-linha-do-tempo">
            <div className="item-linha-do-tempo">
              <p>
                <strong style={{ color: "#3DA5E1" }}>1997 - Fundação MOCUTI</strong>
                <br />
                Nasce o MOCUTI com o objetivo de apoiar famílias em situação de
                vulnerabilidade social.
              </p>
            </div>
            <div className="item-linha-do-tempo">
              <p>
                <strong style={{ color: "#FFBB00" }}>1998 - Primeira Campanha de Alimentos</strong>
                <br />
                Realizamos nossa primeira grande campanha, arrecadando e distribuindo mais de 3 toneladas de alimentos.
              </p>
            </div>
          </div>
          <div className="low-linha-do-tempo">
            <div className="item-linha-do-tempo">
              <p>
                <strong style={{ color: "#FF4848" }}>1997 - Abertura de Sede Comunitária</strong>
                <br />
                Inauguramos nossa sede própria com espaço para oficinas, apoio psicológico e reforço escolar.
              </p>
            </div>
            <div className="item-linha-do-tempo">
              <p>
                <strong style={{ color: "#4FBD34" }}>1999 - Curso Pré-vestibular</strong>
                <br />
                Primeiro curso pré-vestibular em parceria com o Educafro, ajudando diversos jovens a iniciar em uma universidade.
              </p>
            </div>
          </div>
        </div>
        <div className="botao-linha-do-tempo">
          <a href="#eventos" className="btn-diferenciado" style={{ backgroundColor: "#FFBB00" }}>
            Conheça Nossos Eventos
          </a>
        </div>
      </div>

      {/* Nossos Eventos */}
      <div className="nossos-eventos">
        <div className="titulos-nossos-eventos">
          <h1>Nossos Eventos</h1>
        </div>

        <div className="carrossel-wrapper">
          <button className="carrossel-btn prev" onClick={() => scrollCarousel(-1)}>
            &#10094;
          </button>

          <div className="carrossel-container" ref={carouselRef}>
            <div className="carrossel">
              {[carnaval, natal, infancia, varal, apadrinhamento].map((img, index) => (
                <div
                  key={index}
                  className="card-nossos-eventos"
                  style={{
                    backgroundColor: ["#4FBD34", "#3DA5E1", "#FFBB00", "#FF4848", "#4FBD34"][index],
                  }}
                >
                  <div className="box-img-card-eventos">
                    <img src={img} alt={`Evento ${index + 1}`} />
                  </div>
                  <div className="titulo-card-eventos">
                    <p>
                      {["Carnaval", "Natal Consciente", "Infância sem Racismo", "Varal Solidário", "Apadrinhamento"][index]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="carrossel-btn next" onClick={() => scrollCarousel(1)}>
            &#10095;
          </button>
        </div>

        <div className="box-botao-nossos-eventos">
          <a className="btn-diferenciado" onClick={() => navigate('/login')} style={{ backgroundColor: "#4FBD34" }}>
            Eventos Agendados
          </a>
        </div>
      </div>

      {/* Rodapé */}
      <div className="rodape">
        <div className="box-logo-rodape">
          <img src={mocutiRodape} />
        </div>
        <div className="form-rodape">
          <p>Caso existir dúvidas, entre em contato:</p>

          <input
            type="email"
            id="email"
            className="Email"
            placeholder="Email:"
          />

          <textarea
            id="mensagem"
            className="mensagem"
            placeholder="Mensagem:"
            rows="5"
          ></textarea>

          <button
            className="botao-form"
            onClick={() => {
              const email = document.getElementById("email").value;
              const mensagem = document.getElementById("mensagem").value;

              const mailto = `mailto:sitemocuti@gmail.com?subject=Contato via Site MOCUTI&body=Remetente: ${email}%0D%0A%0D%0AMensagem:%0D%0A${encodeURIComponent(
                mensagem
              )}`;

              window.location.href = mailto;
            }}
          >
            Enviar Email
          </button>
        </div>

        <div className="box-links-rodape">
          <div className="links">
            <a href="">Inicio</a>
            <a href="">Sobre Nós</a>
            <a href="">Linha do Tempo</a>
          </div>
          <div className="links">
            <a href="">Nossos Eventos</a>
            <a href="">Cadastro</a>
            <a href="">Login</a>
          </div>
        </div>
      </div>
    </div>

    // </div>
  );
};

export default Home;