// BASE_URL recebe a URL base da API. 
// Primeiro tenta pegar da variável de ambiente VITE_API_URL (vinda do arquivo .env do Vite). 
// Se não existir, usa 'http://localhost:8080' como padrão.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Função assíncrona genérica para fazer requisições à API
// `endpoint` é o caminho do recurso (ex: "/usuarios")
async function api(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    let txt = ""
    try {
      txt = await response.text()
    } catch (errText) {
      console.warn("api: falha ao ler body como text:", errText)
      txt = ""
    }

    if (!txt) return null

    try {
      return JSON.parse(txt)
    } catch {
      return txt
    }
  } catch (err) {
    console.error("api error:", err)
    throw err
  }
}

export default api

export const apiRefresh = new EventTarget()
export const triggerApiRefresh = () => apiRefresh.dispatchEvent(new Event("refresh"))

export async function getJson(endpoint, opts = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers: { Accept: "application/json", ...(opts.headers || {}) }, ...opts })
    if (!res.ok) throw new Error(`Erro ${res.status}`)

    let txt = ""
    try {
      txt = await res.text()
    } catch (errText) {
      console.warn("getJson: falha ao ler body como text:", errText)
      txt = ""
    }
    if (!txt) return null

    try {
      return JSON.parse(txt)
    } catch {
      return txt
    }
  } catch (err) {
    console.error("getJson error:", err)
    throw err
  }
}

export async function postJson(endpoint, body, opts = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      body: JSON.stringify(body),
      ...opts
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)

    let txt = ""
    try {
      txt = await res.text()
    } catch (errText) {
      console.warn("postJson: falha ao ler body como text:", errText)
      txt = ""
    }
    if (!txt) return null

    try {
      return JSON.parse(txt)
    } catch {
      return txt
    }
  } catch (err) {
    console.error("postJson error:", err)
    throw err
  }
}

export async function deleteEndpoint(endpoint, opts = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { method: "DELETE", ...(opts || {}) })
    if (!res.ok && res.status !== 204) throw new Error(`Erro ${res.status}`)
    return true
  } catch (err) {
    console.error("deleteEndpoint error:", err)
    throw err
  }
}

export async function fetchInscritosCargo2Count(idEvento) {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || null
    const headers = { Accept: "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`

    const url = `${BASE_URL}/participacoes/inscritos/cargo2/contagem/${encodeURIComponent(idEvento)}`
    const res = await fetch(url, { method: "GET", headers })
    if (!res.ok) {
      let txt = ""
      try {
        txt = await res.text()
      } catch (errText) {
        console.warn("fetchInscritosCargo2Count: non-ok body read failed:", errText)
      }
      console.warn("fetchInscritosCargo2Count: non-ok status:", res.status, txt)
      return 0
    }

    let text = ""
    try {
      text = await res.text()
    } catch (errText) {
      console.warn("fetchInscritosCargo2Count: read text failed:", errText)
      return 0
    }

    if (text !== null && text !== undefined) {
      const n = Number(String(text).trim())
      if (isFinite(n)) return n
      try {
        const parsed = JSON.parse(text)
        const val = Number(parsed?.quantidade ?? parsed?.count ?? parsed?.total ?? parsed?.valor ?? 0)
        return isFinite(val) ? val : 0
      } catch {
        console.warn("fetchInscritosCargo2Count: parse failed, body:", text)
        return 0
      }
    }

    return 0
  } catch (err) {
    console.error("fetchInscritosCargo2Count error:", err)
    return 0
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


