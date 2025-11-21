// src/api.js
import axios from 'axios'

// BASE_URL tenta vir do .env e cai no localhost se não tiver
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const apiRefresh = new EventTarget()
export const triggerApiRefresh = () => apiRefresh.dispatchEvent(new Event("refresh"))

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

export async function inscreverUsuarioEvento(idEvento, idUsuario, idStatusInscricao = 1) {
  try {
    const res = await api.post(
      `/participacoes/${encodeURIComponent(idEvento)}/inscrever`,
      null,
      { params: { idUsuario, idStatusInscricao } }
    );
    if (res.status >= 200 && res.status < 300) return true;
    const txt = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    throw new Error(`inscreverUsuarioEvento failed ${res.status} ${txt}`);
  } catch (err) {
    console.error("inscreverUsuarioEvento error:", err);
    throw err;
  }
}

export async function listarConvidadosPorEvento(idEvento) {
  try {
    const res = await api.get(`/participacoes/convidados/${encodeURIComponent(idEvento)}`, {
      validateStatus: () => true,
    });
    if (res.status === 204) return [];
    if (res.status >= 200 && res.status < 300) return Array.isArray(res.data) ? res.data : (res.data ?? []);
    console.warn("listarConvidadosPorEvento non-ok:", res.status, res.data);
    return [];
  } catch (err) {
    console.error("listarConvidadosPorEvento error:", err);
    return [];
  }
}

export async function listarUsuariosPorCargo(cargo) {
  try {
    const res = await api.get(`/usuarios/listar-por-cargo/${encodeURIComponent(cargo)}`, {
      validateStatus: () => true,
    });
    if (res.status >= 200 && res.status < 300) return Array.isArray(res.data) ? res.data : (res.data ?? []);
    return [];
  } catch (err) {
    console.error("listarUsuariosPorCargo error:", err);
    return [];
  }
}

export default api
