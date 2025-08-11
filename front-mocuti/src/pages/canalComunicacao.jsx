import { useEffect, useState } from 'react'
import api from '../api/api'

function CanalComunicacao() {
  const [canalComunicacao, setCanalComunicacao] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/canal-comunicacao') // exemplo: endpoint do seu backend
      .then((res) => {
        setCanalComunicacao(res.data)
      })
      .catch((err) => {
        console.error('Erro ao buscar canal de comunicação:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Carregando...</p>

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
