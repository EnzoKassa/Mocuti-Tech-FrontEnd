import React, { useEffect, useState } from "react";
import "../../styles/NavLateral.css";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/DashGeral.css";
import imgTrofeu from "../../assets/images/trofeu.svg";
import { Doughnut, Line} from 'react-chartjs-2';
import { Bar as ChartBar } from 'react-chartjs-2';



import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement, 
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);



import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import VisaoGeral from "../../assets/images/VisaoGeral.svg";
import listaUsuarios from "../../assets/images/listausuario.svg";

const GeralM1 = () => {
    const [benefAtivos, setBenefAtivos] = useState(0);
    const [M1Ativos, setM1Ativos] = useState(0);
    const [M2Ativos, setM2Ativos] = useState(0);
    const [totalUserAtivo, settotalUserAtivo] = useState(0);
    const [totalUser, settotalUser] = useState(0);
    const [TotalM1, setTotalM1] = useState(0);
    const [TotalM2, setTotalM2] = useState(0);
    const [TotalBeneficiarios, setTotalBeneficiarios] = useState(0);
    const [feedbackData, setFeedbackData] = useState([]);
    const [feedbackDataMensal, setFeedbackDataMensal] = useState([]);
    const [rankingCategoria, setRankingCategoria] = useState([]);
    const [inscricaoUsuarioMes, setInscricaoUsuarioMes] = useState([]);
    const [generoDistribuicao, setGeneroDistribuicao] = useState([]);
    const [faixaEtariaDistribuicao, setFaixaEtariaDistribuicao] = useState([]);

    
 const rotasPersonalizadas = [
    { texto: "Eventos", img: Calendario, rota: "/admin/eventos" },
    { texto: "Lista de Usuários", img: listaUsuarios, rota: "/admin/lista-usuarios" },
    { texto: "Feedbacks", img: feedback, rota: "/admin/feedbacks" },
    { texto: "Meu Perfil", img: MeuPerfil, rota: "/admin/perfil" },
    { texto: "Visão Geral", img: VisaoGeral, rota: "/admin/geral" },
  ]

    useEffect(() => {
        FaixaEtaria();
        visaoUser();
        FeedbackPorCategoria();
        FeedbackPorCategoriaMensal();
        ranking();
        InscricaoMensal();
        GeneroAlvo();
        FaixaEtaria();

    }, []);

// Faixa  etaria aqui, nao deu certo deixei um de plano B
// Faixa  etaria aqui, nao deu certo deixei um de plano B
// Faixa  etaria aqui, nao deu certo deixei um de plano B
// Faixa  etaria aqui, nao deu certo deixei um de plano B
// Faixa  etaria aqui, nao deu certo deixei um de plano B
// Faixa  etaria aqui, nao deu certo deixei um de plano B

 async function FaixaEtaria() {
  const resposta = await fetch("http://localhost:8080/usuarios/view/faixa-etaria-usuarios-ativos");
  const faixaEtaria = await resposta.json();
  console.log("FaixaEtaria:", faixaEtaria);


  if (faixaEtaria.length > 0) {
    const obj = faixaEtaria[0];
    const dataTransformada = [
      { faixa: "Até 15", percentual: obj.ate_15 },
      { faixa: "16 a 24", percentual: obj.de_16_a_24 },
      { faixa: "25 a 40", percentual: obj.de_25_a_40 },
      { faixa: "Acima de 40", percentual: obj.acima_de_40 }
    ];
    setFaixaEtariaDistribuicao(dataTransformada);
  } else {
    setFaixaEtariaDistribuicao([]);
  }
}


function GraficoFaixaEtaria() {
  const labels = faixaEtariaDistribuicao.map(item => item.faixa);
  const valores = faixaEtariaDistribuicao.map(item => Number(item.percentual));

  const data = {
    labels,
    datasets: [
      {
        label: "Faixa Etária",
        data: valores,
        backgroundColor: "#5dade2",
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Distribuição por faixa etária",
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#333", font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 10, color: "#333", font: { size: 12 } },
      },
    },
  };

return faixaEtariaDistribuicao.length > 0 ? <ChartBar data={data} options={options} /> : null;
}
    // Até aqui
    // Até aqui
    // Até aqui
    // Até aqui
    // Até aqui
    // Até aqui


    // Grafico de genero  Aqui, nao deu certo deixei um de plano B
    // Grafico de genero  Aqui, nao deu certo deixei um de plano B
    // Grafico de genero  Aqui, nao deu certo deixei um de plano B
    // Grafico de genero  Aqui, nao deu certo deixei um de plano B
    // Grafico de genero  Aqui, nao deu certo deixei um de plano B

    async function GeneroAlvo() {
        const resposta = await fetch("http://localhost:8080/usuarios/view/publico-alvo-genero");
        const genero = await resposta.json();
        console.log("Genero:", genero);
        setGeneroDistribuicao(genero);
    }

    function GraficoGenero() {
        const labelsGenero = generoDistribuicao?.map(item => item.genero) || [];
        const valoresGenero = generoDistribuicao?.map(item => Number(item.percentual)) || [];

        const dataGenero = {
            labels: labelsGenero,
            datasets: [
                {
                    data: valoresGenero,
                    backgroundColor: ['#ff6384', '#36a2eb', '#9966cc'],
                    borderWidth: 1,
                },
            ],
        };

        const optionsGenero = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                        },
                    },
                },
                title: {
                    display: false,
                    text: 'Distribuição de Gênero',
                    font: {
                        size: 18,
                    },
                },
            },
        };

       return generoDistribuicao.length > 0 ? <Doughnut data={dataGenero} options={optionsGenero} /> : null;
    }

    // Até aqui
    // Até aqui
    // Até aqui
    // Até aqui
    // Até aqui
    // Até aqui


    async function FeedbackPorCategoria() {
        const resposta = await fetch("http://localhost:8080/feedback/view/feedbacks-por-categoria");
        const feedbackCategoria = await resposta.json();
        console.log("Feedback por categoria:", feedbackCategoria);

        const data = feedbackCategoria.map((item) => ({
            categoria: item.categoria,
            Likes: item.qtd_positivos,
            Dislikes: item.qtd_negativos ?? 0,
            Total: item.qtd_total,
        }));


        setFeedbackData(data);
    }

    async function FeedbackPorCategoriaMensal() {
        const resposta = await fetch("http://localhost:8080/feedback/view/feedback-categoria-mes-atual");
        const feedbackCategoriaMensal = await resposta.json();
        console.log("Feedback por categoria Mensal:", feedbackCategoriaMensal);

        const data = feedbackCategoriaMensal.map((item) => ({
            categoria: item.categoria,
            Likes: item.qtd_positivos,
            Dislikes: item.qtd_negativos ?? 0,
            Total: item.qtd_total,
        }));


        setFeedbackDataMensal(data);
    }



    async function InscricaoMensal() {
        const resposta = await fetch("http://localhost:8080/usuarios/view/inscricoes-mes-durante-ano");
        const inscricaoUsuarioMes = await resposta.json();
        console.log("Inscricao usuario Mes", inscricaoUsuarioMes);


        setInscricaoUsuarioMes(inscricaoUsuarioMes);
    }

    function GraficoInscricoes({ dados }) {
        const ordemMeses = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dadosOrdenados = [...dados].sort((a, b) => {
            return ordemMeses.indexOf(a.mes) - ordemMeses.indexOf(b.mes);
        });

        const labels = dadosOrdenados.map(item => item.mes);
        const valores = dadosOrdenados.map(item => Number(item.total_cadastros));
        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Inscrições nos Evento durante o ano',
                    data: valores,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    tension: 0.3,
                    fill: true
                }
            ]
        };


        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 10
                }
            }
        };

        return <Line data={data} options={options} />;
    }

    async function ranking() {
        try {
            const resposta = await fetch("http://localhost:8080/categorias/view/ranking");
            const dados = await resposta.json();
            console.log("Ranking de Categoria", dados);
            setRankingCategoria(dados);
        } catch (erro) {
            console.error("Erro ao buscar ranking:", erro);
        }
    }

    async function visaoUser() {
        const resposta = await fetch("http://localhost:8080/usuarios/view/visao-geral");
        const visaoUser = await resposta.json();
        setBenefAtivos(visaoUser.total_beneficiarios_ativos);
        setM1Ativos(visaoUser.total_m1_ativos);
        setM2Ativos(visaoUser.total_m2_ativos);
        settotalUserAtivo(visaoUser.total_usuarios_ativos);
        settotalUser(visaoUser.total_usuarios_ativos + visaoUser.total_usuarios_inativos);
        setTotalM1(visaoUser.total_m1_ativos + visaoUser.total_m1_inativos);
        setTotalM2(visaoUser.total_m2_ativos + visaoUser.total_m2_inativos);
        setTotalBeneficiarios(visaoUser.total_beneficiarios_ativos + visaoUser.total_beneficiarios_inativos);
    }

    return (
 <div className="flex flex-row w-full h-screen font-[Montserrat]">
  <NavLateral rotasPersonalizadas={rotasPersonalizadas} />

  {/* Div destacada com rolagem */}
  <div className="w-[85%] h-full flex flex-col justify-start items-center overflow-y-auto gap-6 p-6">

    {/* Título */}
    <div className="w-[90%] min-h-[10vh] flex justify-start items-center text-[3rem] font-semibold">
      Visão Geral
    </div>

    {/* Usuários e Atividades */}
    <div className="w-[90%] min-h-[25vh] flex justify-between items-center">
      {[
        { titulo: "Usuários Ativos", valor: totalUserAtivo, total: "Total de Usuários", totalValor: totalUser },
        { titulo: "M1 Ativos", valor: M1Ativos, total: "Total de M1", totalValor: TotalM1 },
        { titulo: "M2 Ativos", valor: M2Ativos, total: "Total de M2", totalValor: TotalM2 },
        { titulo: "Benef. Ativos", valor: benefAtivos, total: "Total Benef.", totalValor: TotalBeneficiarios },
      ].map((item, i) => (
        <div key={i} className="bg-white h-[90%] w-[22%] flex flex-col rounded-[5%] shadow-md">
          <div className="h-[55%] flex flex-col gap-[5%] justify-center items-center border-b border-gray-700 pt-[5%]">
            <h1 className="text-[1.5rem] font-semibold m-0">{item.titulo}</h1>
            <h2 className="text-[1.5rem] font-extrabold m-0">{item.valor}</h2>
          </div>
          <div className="h-[45%] flex flex-col gap-[10%] justify-center items-center text-gray-700">
            <h1 className="text-[1.5rem] font-semibold m-0">{item.total}</h1>
            <h2 className="text-[1.5rem] font-semibold m-0">{item.totalValor}</h2>
          </div>
        </div>
      ))}
    </div>

    {/* Gráficos */}
    <div className="w-[90%] min-h-[65vh] flex justify-between items-center gap-4">
      {/* Gráfico Mensal */}
      <div className="h-[90%] bg-white w-[48%] flex flex-col justify-center items-center px-2 shadow-md">
        <div className="w-full h-[25%] flex flex-col justify-center items-center text-center mb-4">
          <h1 className="text-[1.5rem] font-semibold text-gray-700 mb-2">
            Feedbacks de categoria no mês
          </h1>
          <p className="text-gray-700 text-[1rem]">
            Aqui você confere o total de pessoas que avaliaram as categorias por evento deste mês, todos os likes e dislikes registrados.
          </p>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={feedbackDataMensal} margin={{ top: 10, right: 30, left: 0, bottom: 10 }} barGap={5}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
            <YAxis
              label={{
                value: "Quantidade de feedbacks",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="Likes" fill="#2ecc71" name="Likes" />
            <Bar dataKey="Dislikes" fill="#e74c3c" name="Dislikes" />
            <Bar dataKey="Total" fill="#5dade2" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico Geral */}
      <div className="h-[90%] bg-white w-[48%] flex flex-col justify-center items-center px-2 shadow-md">
        <div className="w-full h-[25%] flex flex-col justify-center items-center text-center mb-4">
          <h1 className="text-[1.5rem] font-semibold text-gray-700 mb-2">
            Feedbacks de categoria geral
          </h1>
          <p className="text-gray-700 text-[1rem]">
            Aqui você confere o total de feedbacks sobre as categorias dos eventos, com todos os likes e dislikes registrados.
          </p>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={feedbackData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }} barGap={5}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
            <YAxis
              label={{
                value: "Quantidade de feedbacks",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="Likes" fill="#2ecc71" name="Likes" />
            <Bar dataKey="Dislikes" fill="#e74c3c" name="Dislikes" />
            <Bar dataKey="Total" fill="#5dade2" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Ranking e Inscrições */}
    <div className="w-[90%] min-h-[50vh] flex justify-between items-center mt-8">
      {/* Ranking */}
      <div className="h-[90%] bg-white w-[40%] flex flex-col items-center shadow-md">
        <div className="w-full h-[25%] flex flex-col justify-center items-center text-center">
          <h1 className="text-[1.5rem] font-semibold text-gray-700 mb-2">
            Ranking categorias preferidas
          </h1>
          <p className="text-gray-700 text-[1rem]">Aqui você confere as categorias preferidas por quem já faz parte da nossa plataforma.</p>
        </div>
        <div className="w-full border-b border-gray-700 flex justify-center items-center h-[5vh] font-semibold text-[1.2rem]">
          <div className="w-[25%] text-left flex items-center gap-2">Rank <img src={imgTrofeu} alt="" /></div>
          <div className="w-[35%] text-left">Categoria</div>
          <div className="w-[30%] text-right">Nº de preferidos</div>
        </div>
        <div className="w-full flex flex-col overflow-y-auto">
          {rankingCategoria.length > 0 ? (
            rankingCategoria.map((item, index) => (
              <div key={index} className="flex justify-center items-center h-[4.9vh] border-b border-gray-700">
                <div className="w-[25%] text-left">{index + 1}º</div>
                <div className="w-[35%] text-left">{item.nome}</div>
                <div className="w-[30%] text-right">{item.total_votos}</div>
              </div>
            ))
          ) : (
            <p>Carregando ranking...</p>
          )}
        </div>
      </div>

      {/* Inscrições */}
      <div className="h-[90%] bg-white w-[58%] flex flex-col items-center shadow-md">
        <div className="w-full h-[25%] flex flex-col justify-center items-center text-center">
          <h1 className="text-[1.5rem] font-semibold text-gray-700 mb-2">
            Inscrições de usuários durante o ano
          </h1>
          <p className="text-gray-700 text-[1rem]">
            Aqui você confere quantas pessoas se inscreveram a cada mês, considerando os últimos quatro meses.
          </p>
        </div>
        <div className="w-full h-[70%] flex justify-center items-start">
          {inscricaoUsuarioMes.length > 0 && <GraficoInscricoes dados={inscricaoUsuarioMes} />}
        </div>
      </div>
    </div>


      {/* Gênero e Idade */}
       <div className="w-[90%] min-h-[50vh] flex justify-between items-center mt-8">
        <div className="h-[90%] bg-white w-[40%] flex flex-col items-center shadow-md">
          <div className="w-full h-[25%] flex flex-col justify-center items-center text-center">
            <h1 className="text-[1.5rem] font-semibold text-gray-700 mb-2">Gêneros ativos na plataforma</h1>
            <p className="text-gray-700 text-[1rem]">
              Este pictograma mostra a quantidade de pessoas que se identificam como gênero feminino, masculino e aquelas que preferiram não informar.
            </p>
          </div>
          <div className="w-full h-[60%] flex justify-center items-end">
            <GraficoGenero />
          </div>
        </div>

        <div className="h-[90%] bg-white w-[58%] flex flex-col items-center shadow-md">
          <div className="w-full h-[25%] flex flex-col justify-center items-center text-center">
            <h1 className="text-[1.5rem] font-semibold text-gray-700 mb-2">Faixa Etária Ativa</h1>
            <p className="text-gray-700 text-[1rem]">
              Aqui você confere quantas pessoas se inscreveram a cada mês, considerando os últimos quatro meses.
            </p>
          </div>
          <div className="w-full h-[70%] flex justify-center items-end">
            <GraficoFaixaEtaria />
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default GeralM1;


