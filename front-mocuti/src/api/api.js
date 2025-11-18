// src/api.js
import axios from 'axios'

// BASE_URL tenta vir do .env e cai no localhost se não tiver
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Cria uma instância do Axios com a base configurada
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// (Opcional) Adiciona interceptors para incluir token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


export async function fetchInscritosCargo2Count(idEvento) {
  try {
    const res = await api.get(`/participacoes/inscritos/cargo2/contagem/${encodeURIComponent(idEvento)}`);
    return Number(res.data?.quantidade ?? 0);
  } catch (err) {
    console.error("listarConvidadosPorEvento error:", err);
    return [];
  }
}

export default api
