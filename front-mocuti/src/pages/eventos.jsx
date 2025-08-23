import { useEffect, useState } from "react"

function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEventos() {
      try {
        // const response = await fetch("http://localhost:3000/eventos") // endpoint do json server
        const response = await fetch("http://localhost:8080/eventos") // endpoint do backend
        if (!response.ok) {
          throw new Error(`Erro ao buscar eventos: ${response.status}`)
        }
        const data = await response.json()
        setEventos(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [])

  if (loading) return <p>Carregando...</p>
  if (error) return <p>Erro: {error}</p>

  return (
    <div>
      <h1>Lista de Eventos</h1>
      <ul>
        {eventos.map((evento) => (
          //   <li key={evento.id_evento}>{evento.nome_evento}</li>

          <li key={evento.idEvento}>{evento.nomeEvento}</li>
        ))}
      </ul>
    </div>
  )
}

export default Eventos
