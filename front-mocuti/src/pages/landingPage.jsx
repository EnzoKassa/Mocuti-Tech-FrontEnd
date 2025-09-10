import React, { useEffect, useState } from "react";
import "../styles/bottom.css";
import mocutiRodape from "../assets/images/mocuti-rodape.svg";
import natal from "../assets/images/natal.png";
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

import { useNavigate } from 'react-router-dom';


const Home = () => {

    const navigate = useNavigate();

  return (
    <div>
      {/* Navbar */}
      <div className="nav-home">
        <div className="nav-box">
          <div className="nav-endereco">
            <img src={location} alt="" />
            Av dos Metalurgicos, 1081
          </div>
          <div className="nav-contato">
            <img src={telefone} alt="" />
            11 980711297
            <img src={insta} alt="" />
            <img src={zap} alt="" />
            <img src={face} alt="" />
            <img src={email} alt="" />
          </div>
        </div>
        <div className="nav-links">
          <div className="nav-box-botoes">
            <div className="nav-box-logo">
              <img src={logo} alt="" />
            </div>
            <div className="nav-links-botoes">
          
<div className="nav-links-botoes">
  <a href="#inicio" className="botoes-nav btn-inicio">Início</a>
  <a href="#sobre" className="botoes-nav btn-sobre">Sobre Nós</a>
  <a href="#linha-do-tempo" className="botoes-nav btn-linha">Linha do Tempo</a>
  <a href="#eventos" className="botoes-nav btn-eventos">Eventos</a>
</div>


            </div>
            <div className="nav-box-cadastro">
              <a onClick={() => navigate('/cadastro')} className="botoes-cadastro-nav">Criar Conta</a>
              <a onClick={() => navigate('/login')} className="botoes-cadastro-nav-blue">Entrar</a>
            </div>
          </div>
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
    width: "95vw",
    height: "100vh",
    backgroundImage: `url(${inicio})`,
    backgroundSize: "cover",
    paddingLeft: "5%"
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
                 <strong style={{color: "#3DA5E1"}}>1997 - Fundação MOCUTI</strong>
                <br />
                Nasce o MOCUTI com o objetivo de apoiar famílias em situação de
                vulnerabilidade social.
              </p>
            </div>
            <div className="item-linha-do-tempo">
              <p>
                 <strong style={{color: "#FFBB00"}}>1998 - Primeira Campanha de Alimentos</strong>
                <br />
              Realizamos nossa primeira grande campanha, arrecadando e distribuindo mais de 3 toneladas de alimentos.
              </p>
            </div>
          </div>
          <div className="low-linha-do-tempo">
            <div className="item-linha-do-tempo">
              <p>
                 <strong style={{color: "#FF4848"}}>1997 - Abertura de Sede Comunitária</strong>
                <br /> 
Inauguramos nossa sede própria com espaço para oficinas, apoio psicológico e reforço escolar.
              </p>
            </div>
            <div className="item-linha-do-tempo">
              <p>
                 <strong style={{color: "#4FBD34"}}>1999 - Curso Pré-vestibular</strong>
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
      <div id="eventos" className="nossos-eventos">
        <div className="titulos-nossos-eventos">
          <h1>Nossos Eventos</h1>
        </div>
        <div className="box-cards-nossos-eventos">
              <div className="card-nossos-eventos" style={{backgroundColor: "4FBD34"}}>
              <div className="box-img-card-eventos">
                <img src={inicio} alt="Imagem evento" />
              </div>
              <div className="titulo-card-eventos">
                <p>Natal Consciente</p>
              </div>
            </div>

                <div className="card-nossos-eventos" style={{backgroundColor: "#3DA5E1"}}>
              <div className="box-img-card-eventos">
                <img src={natal} alt="Imagem evento" />
              </div>
              <div className="titulo-card-eventos">
                <p>Natal Consciente</p>
              </div>
            </div>

                <div className="card-nossos-eventos" style={{backgroundColor: "#FFBB00"}}>
              <div className="box-img-card-eventos">
                <img src={inicio} alt="Imagem evento" />
              </div>
              <div className="titulo-card-eventos">
                <p>Infância sem Racismo</p>
              </div>
            </div>

                <div className="card-nossos-eventos" style={{backgroundColor: "#FF4848"}}>
              <div className="box-img-card-eventos">
                <img src={varal} alt="Imagem evento" />
              </div>
              <div className="titulo-card-eventos">
                <p>Varal Solidário</p>
              </div>
            </div>

                <div className="card-nossos-eventos" style={{backgroundColor: "#4FBD34"}}>
              <div className="box-img-card-eventos">
                <img src={inicio} alt="Imagem evento" />
              </div>
              <div className="titulo-card-eventos">
                <p>Apadrinhamento</p>
              </div>
            </div>
        </div>
        <div className="box-botao-nossos-eventos">
          <a className="btn-diferenciado" style={{ backgroundColor: "#4FBD34" }}>
            Eventos Agendados
          </a>
        </div>

        {/* Rodapé */}
        <div className="rodape">
          <div className="box-logo-rodape">
            <img src={mocutiRodape} />
          </div>
          <div className="form-rodape">
            <p>Caso existir dúvidas, entre em contato:</p>
            <input type="text" className="Email" placeholder="Email:" />
            <input type="text" className="mensagem" placeholder="Mensagem:" />
            <button className="botao-form">Enviar Email</button>
          </div>
          <div className="box-links-rodape">
            <div className="links">
              <a href="">Sobre Nós</a>
              <a href="">Home</a>
              <a href="">Nossos Eventos</a>
            </div>
            <div className="links">
              <a href="">Login</a>
              <a href="">Teste</a>
              <a href="">Teste</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
