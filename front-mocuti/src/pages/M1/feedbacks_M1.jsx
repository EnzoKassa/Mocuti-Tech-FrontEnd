import React, { useEffect, useRef, useState } from "react";
import { NavLateral } from "../../components/NavLateral";
import "../../styles/TelaComNavLateral.css";
import "../../styles/Feedbacks_M1.css";
import Chart from "chart.js/auto";

const API_BASE = "http://localhost:8080";

// MOCKs usados como fallback quando a API ainda não tem dados agregados
const MOCK_PIZZA = {
  labels: ["Total de inscritos", "Presentes", "Ausentes"],
  valores: [100, 70, 30],
  cores: ["#3DA5E1", "#4FBD34", "#FF4848"],
};

const MOCK_BARRA = {
  labels: ["Roda de conversa", "Palestra X", "Palestra Y"],
  positivos: [30, 50, 40],
  negativos: [10, 20, 15],
};

function Feedbacks_M1() {
  const pizzaRef = useRef(null);
  const barraRef = useRef(null);
  const chartPizza = useRef(null);
  const chartBarra = useRef(null);

  // ======== STATES QUE FALTAVAM ========
  const [erro, setErro] = useState("");
  const [feedbacks, setFeedbacks] = useState([]); // GET /feedback
  const [feedbacksPorEvento, setFeedbacksPorEvento] = useState([]); // GET /feedback/view/feedback-evento

  // ======== BUSCAS À API ========
  useEffect(() => {
    // 1) Todos os feedbacks (endpoint correto: /feedback)
    fetch(`${API_BASE}/feedback`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setFeedbacks(Array.isArray(data) ? data : []);
        console.log("Feedbacks:", data);
      })
      .catch((err) => {
        console.error("Erro ao carregar feedbacks:", err);
        setErro("Erro ao carregar feedbacks");
      });

    // 2) Feedbacks por evento (para o gráfico de barras)
    fetch(`${API_BASE}/feedback/view/feedback-evento`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFeedbacksPorEvento(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Erro ao carregar feedbacks por evento:", err);
        setErro("Erro ao carregar feedbacks por evento");
      });
  }, []);

  // ======== CHART.JS – PIZZA ========
  useEffect(() => {
    if (!pizzaRef.current) return;
    if (chartPizza.current) chartPizza.current.destroy();
    chartPizza.current = new Chart(pizzaRef.current, {
      type: "doughnut",
      data: {
        labels: MOCK_PIZZA.labels,
        datasets: [
          {
            data: MOCK_PIZZA.valores,
            backgroundColor: MOCK_PIZZA.cores,
          },
        ],
      },
      options: { plugins: { legend: { position: "right" } } },
    });
  }, []);

  // ======== CHART.JS – BARRA ========
  useEffect(() => {
    if (!barraRef.current) return;

    // Se a API devolveu dados, tentamos montar a partir dela. Caso contrário, usamos o MOCK.
    const labelsApi = feedbacksPorEvento.map((it) => it.evento || it.nome || `Evento ${it.id ?? "?"}`);
    const posApi = feedbacksPorEvento.map((it) => it.positivos ?? it.totalPositivos ?? 0);
    const negApi = feedbacksPorEvento.map((it) => it.negativos ?? it.totalNegativos ?? 0);

    const labels = labelsApi.length ? labelsApi : MOCK_BARRA.labels;
    const positivos = labelsApi.length ? posApi : MOCK_BARRA.positivos;
    const negativos = labelsApi.length ? negApi : MOCK_BARRA.negativos;

    if (chartBarra.current) chartBarra.current.destroy();
    chartBarra.current = new Chart(barraRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Positivos", data: positivos, backgroundColor: "#4FBD34" },
          { label: "Negativos", data: negativos, backgroundColor: "#FF4848" },
        ],
      },
      options: { plugins: { legend: { position: "top" } }, responsive: true },
    });
  }, [feedbacksPorEvento]);

  // ======== RENDER ========
  return (
    <div className="TelaComNavLateral pagina-feedbacks">
      <NavLateral />
      <div className="MainContent conteudo-feedbacks">
        <div className="boxTopFeedback">
          <div className="tituloFeedback">Feedback Dashboard</div>

          {erro && (
            <div style={{ marginTop: 8, marginBottom: 8, color: "#b91c1c", fontWeight: 600 }}>{erro}</div>
          )}

          <div className="boxDashboardFeedback" style={{ background: "none", gap: "2rem" }}>
            <div className="dashPalestra" style={{ background: "#fff", borderRadius: 12, padding: 16, minWidth: 340 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Presença na Palestra - Diversidade</div>
              <div className="descDashPalestra">
                Este gráfico mostra quantas pessoas se inscreveram no evento e quantas estiveram presentes ou ausentes.
              </div>
              <canvas ref={pizzaRef} width={300} height={300} /> {/* Aumentado para 300x300 */}
            </div>

            <div className="dashQuantidadeFeedback" style={{ background: "#fff", borderRadius: 12, padding: 16, minWidth: 340 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Quantidade de feedbacks por evento</div>
              <div className="descDashFeedback">
                Este gráfico mostra o total de feedbacks recebidos para o evento, com a divisão entre likes e dislikes.
              </div>
              <canvas ref={barraRef} width={320} height={220} />
            </div>
          </div>
        </div>

        <div className="boxLowFeedback">
          <div className="tituloFeedback" style={{ fontSize: 28, marginBottom: 12 }}>Lista de feedbacks</div>
          <div className="boxListaFeedback" style={{ background: "#fff", borderRadius: 12, padding: 0 }}>
            <div className="colunas" style={{ background: "#F2F4F8", fontWeight: 600 }}>
              <div className="colunaFeedback" style={{ width: "30%" }}>Feedback</div>
              <div className="colunaNome" style={{ width: "25%" }}>Nome</div>
              <div className="colunaEmail" style={{ width: "25%" }}>E-mail</div>
              <div style={{ width: "20%" }}></div>
            </div>

            {(feedbacks.length ? feedbacks : []).map((fb, i) => (
              <div className="linhas" key={fb.id ?? i} style={{ alignItems: "center" }}>
                <div className="colunaFeedback" style={{ width: "30%" }}>
                  {fb.titulo || fb.assunto || fb.mensagem || `Feedback ${fb.id ?? i + 1}`}
                </div>
                <div className="colunaNome" style={{ width: "25%" }}>
                  {fb.nomeUsuario || fb.participante || fb.nome || "—"}
                </div>
                <div className="colunaEmail" style={{ width: "25%" }}>
                  {fb.emailUsuario || fb.email || "—"}
                </div>
                <div className="boxBotaoFeedback" style={{ width: "20%", justifyContent: "center" }}>
                  <button className="botaoMaisInfoFeedback">+ Mais Informações</button>
                </div>
              </div>
            ))}

            {!feedbacks.length && (
              <div className="linhas" style={{ alignItems: "center", padding: 16, color: "#6b7280" }}>
                Nenhum feedback retornado por <code>/feedback</code> ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedbacks_M1;