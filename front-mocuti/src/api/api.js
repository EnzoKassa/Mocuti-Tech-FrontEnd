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
    const url = `${BASE_URL}/participacoes/${encodeURIComponent(idEvento)}/inscrever?idUsuario=${encodeURIComponent(idUsuario)}&idStatusInscricao=${encodeURIComponent(idStatusInscricao)}`;
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`inscreverUsuarioEvento failed ${res.status} ${txt}`);
    }
    return true;
  } catch (err) {
    console.error("inscreverUsuarioEvento error:", err);
    throw err;
  }
}

export async function listarConvidadosPorEvento(idEvento) {
  try {
    const res = await fetch(`${BASE_URL}/participacoes/convidados/${encodeURIComponent(idEvento)}`, { headers: { Accept: "application/json" }});
    if (!res.ok) {
      if (res.status === 204) return [];
      const txt = await res.text().catch(() => "");
      console.warn("listarConvidadosPorEvento non-ok:", res.status, txt);
      return [];
    }
    const txt = await res.text().catch(() => "");
    if (!txt) return [];
    try { return JSON.parse(txt); } catch { return []; }
  } catch (err) {
    console.error("listarConvidadosPorEvento error:", err);
    return [];
  }
}

// adicionadas integrações para listar usuários por cargo, inscrever usuário e listar convidados
export async function listarUsuariosPorCargo(cargo) {
  try {
    const res = await fetch(`${BASE_URL}/usuarios/listar-por-cargo/${encodeURIComponent(cargo)}`, { headers: { Accept: "application/json" }});
    if (!res.ok) return [];
    const txt = await res.text().catch(() => "");
    if (!txt) return [];
    try { return JSON.parse(txt); } catch { return []; }
  } catch (err) {
    console.error("listarUsuariosPorCargo error:", err);
    return [];
  }
}

export default api
