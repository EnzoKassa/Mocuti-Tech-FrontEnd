import { useEffect, useState } from 'react'

function CanalComunicacao() {
  const [canalComunicacao, setCanalComunicacao] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCanalComunicacao() {
      try {
        const response = await fetch("http://localhost:8080/canal-comunicacao") // endpoint do backend
        if (!response.ok) {
          throw new Error(`Erro ao buscar Canal Comunicacao: ${response.status}`)
        }
        const data = await response.json()
        setCanalComunicacao(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCanalComunicacao()
  }, [])

  if (loading) return <p>Carregando...</p>
  if (error) return <p>Erro: {error}</p>

  return (
    <div>
      <h1>Lista de Canais de Comunicação</h1>
      <ul>
        {canalComunicacao.map((canal) => (
          <li key={canal.tipoCanalComunicacao}>{canal.tipoCanalComunicacao}</li>
        ))}
      </ul>
    </div>
  )
}

export default CanalComunicacao
