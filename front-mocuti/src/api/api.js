import axios from 'axios' // biblioteca Axios, que facilita requisições HTTP no JavaScript.

/**
 *  Criar uma instância do Axios com configuração padrão
 * Usa a variável de ambiente VITE_API_URL (vinda do arquivo .env do Vite).
 * Se não tiver, usa http://localhost:8080 (padrão da API local do Spring).
 * timeout: Cancela a requisição se demorar mais que 5 segundos (5000 ms
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // URL da API
  timeout: 5000, // tempo máximo de espera em ms
})

/**
 *  interceptor de requisição do Axios.
 * Pensa nele como um “porteiro” que intercepta todas as requisições antes de elas saírem do frontend para a API.
 */
api.interceptors.request.use((config) => {
  // Aqui ele está tentando pegar o token de autenticação (geralmente um JWT) que foi salvo no login.
  const token = localStorage.getItem('token')
  // Se o token existir, ele adiciona um cabeçalho Authorization com o token Bearer.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Retorna a configuração da requisição para que ela possa ser enviada.
  return config
  // Se der algum erro antes mesmo de mandar a requisição (tipo falha para montar o request), 
  // ele rejeita a Promise, o que permite tratar o erro no .catch() de quem chamou a API
}, (error) => {
  return Promise.reject(error)
})

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Erro na API:', error.response.status, error.response.data)
    } else {
      console.error('Erro na conexão:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
