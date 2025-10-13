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
        <div className="TelaComNavLateral">
            <NavLateral />
            <div className="MainDashGeral">
                <div className="boxTituloDashGeral">Visão Geral</div>

                <div className="boxUsuariosAtividade">
                    <div className="usuariosAtividade">
                        <div className="usuariosAtivos">
                            <h1>Usuários Ativos</h1>
                            <h2>{totalUserAtivo}</h2>
                        </div>
                        <div className="TotalDeUsuarios">
                            <h1>Total de Usuários</h1>
                            <h2>{totalUser}</h2>
                        </div>
                    </div>

                    <div className="usuariosAtividade">
                        <div className="usuariosAtivos">
                            <h1>M1 Ativos</h1>
                            <h2>{M1Ativos}</h2>
                        </div>
                        <div className="TotalDeUsuarios">
                            <h1>Total de M1</h1>
                            <h2>{TotalM1}</h2>
                        </div>
                    </div>

                    <div className="usuariosAtividade">
                        <div className="usuariosAtivos">
                            <h1>M2 Ativos</h1>
                            <h2>{M2Ativos}</h2>
                        </div>
                        <div className="TotalDeUsuarios">
                            <h1>Total de M2</h1>
                            <h2>{TotalM2}</h2>
                        </div>
                    </div>

                    <div className="usuariosAtividade">
                        <div className="usuariosAtivos">
                            <h1>Benef. Ativos</h1>
                            <h2>{benefAtivos}</h2>
                        </div>
                        <div className="TotalDeUsuarios">
                            <h1>Total Benef.</h1>
                            <h2>{TotalBeneficiarios}</h2>
                        </div>
                    </div>
                </div>

                {/* === GRÁFICOS === */}
                <div className="BoxGraficosPai">

                    {/* Gráfico 1 - Exemplo reservado */}
                    <div className="BoxGraficos" >

                        <div className="titulosBoxGraficosRanking">
                            <h1>   Feedbacks de categoria no mês</h1>
                            <p>  Aqui você confere o total de pessoas que avaliaram as categorias por evento deste mês, todos os likes e dislikes registrados.</p>
                        </div>
                       

                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart
                                data={feedbackDataMensal}
                                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                barGap={5}
                            >
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


                    {/* Gráfico 2 - Feedback por categoria */}
                    <div className="BoxGraficos">

                       
                         <div className="titulosBoxGraficosRanking">
                            <h1>  Feedbacks de categoria geral</h1>
                            <p>  Aqui você confere o total de feedbacks sobre as categorias dos eventos,
                            com todos os likes e dislikes registrados.</p>
                        </div>

                        <ResponsiveContainer width="90%" height="80%">
                            <BarChart
                                data={feedbackData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                barGap={5}
                            >
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

                <div className="BoxRankingEInscricoes">
                    <div className="BoxGraficosRanking">
                        <div className="titulosBoxGraficosRanking">
                            <h1>Ranking categorias preferidas</h1>
                            <p>Aqui você confere as categorias preferidas por quem <br />já faz parte da nossa plataforma.</p>
                        </div>
                        <div className="ranking">
                            <div className="topRanking">
                                <div className="parteRanking" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                                    Rank {<img src={imgTrofeu} alt="" />}
                                </div>
                                <div className="parteCategoria" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                                    Categoria
                                </div>
                                <div className="partePreferidos" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                                    Nº de preferidos
                                </div>
                            </div>
                        </div>
                        <div className="rankingContainer">
                            {rankingCategoria.length > 0 ? (
                                rankingCategoria.map((item, index) => (
                                    <div key={index} className="topRanking">
                                        <div className="parteRanking"> {index + 1}º</div>
                                        <div className="parteCategoria">{item.nome}</div>
                                        <div className="partePreferidos">{item.total_votos} </div>
                                    </div>
                                ))
                            ) : (
                                <p>Carregando ranking...</p>
                            )}
                        </div>


                    </div>
                    <div className="BoxGraficosInscricoes">
                        <div className="titulosBoxGraficosRanking">
                            <h1> Inscrições de usuários durante o ano</h1>
                            <p>Aqui você confere quantas pessoas se inscreveram a cada mês, considerando os últimos quatro meses.</p>
                        </div>
                        <div className="graficoInscricoes">
                            {inscricaoUsuarioMes.length > 0 && <GraficoInscricoes dados={inscricaoUsuarioMes} />}
                        </div>

                    </div>



                </div>


{/* Graficos de genero e faixa etaria
Graficos de genero e faixa etaria
Graficos de genero e faixa etaria
Graficos de genero e faixa etaria
Graficos de genero e faixa etaria */}



                <div className="GeneroIdade">
                    <div className="boxGenero">
                        <div className="titulosBoxGraficosRanking">
                            <h1> Gêneros ativos na plataforma</h1>
                            <p>Este pictograma mostra a quantidade de pessoas que se identificam como gênero feminino, masculino e aquelas que preferiram não informar.</p>
                        </div>
                        <div className="GraficoGenero">
                            <GraficoGenero />
                        </div>


                       




                    </div>

                    <div className="boxIdade">
                         <div className="titulosBoxGraficosRanking">
                            <h1> Faixa Etária Ativa</h1>
                            <p>Aqui você confere quantas pessoas se inscreveram a cada mês, considerando os últimos quatro meses.</p>
                        </div>
                            <div className="GraficoFaixaEtaria">
                               <GraficoFaixaEtaria />

                            </div>
                        
                    </div>
                </div>



            </div>
        </div>

    );
};

export default GeralM1;
