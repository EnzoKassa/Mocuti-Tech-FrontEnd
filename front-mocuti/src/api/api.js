// BASE_URL recebe a URL base da API. 
// Primeiro tenta pegar da variável de ambiente VITE_API_URL (vinda do arquivo .env do Vite). 
// Se não existir, usa 'http://localhost:8080' como padrão.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Função assíncrona genérica para fazer requisições à API
// `endpoint` é o caminho do recurso (ex: "/usuarios")
// `options` são as opções do fetch (method, headers, body, etc.), padrão é um objeto vazio.
async function api(endpoint, options = {}) {
  
  // Faz a requisição para a URL completa (BASE_URL + endpoint) usando fetch
  const response = await fetch(`${BASE_URL}${endpoint}`, options)

  // Verifica se a resposta não foi ok (status HTTP fora da faixa 200-299)
  // Se não for, lança um erro com o código HTTP
  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`)
  }

  // Converte o corpo da resposta em JSON e retorna
  return response.json()
}

// Exporta a função `api` para que possa ser usada em outros arquivos do React
export default api
