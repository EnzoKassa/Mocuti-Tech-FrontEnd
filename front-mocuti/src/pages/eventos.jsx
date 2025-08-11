
/**
 * useState e useEffect são hooks do React usados para estado e efeitos colaterais.
 * api é a instância Axios que você criou pra fazer requisições HTTP para seu backend.
 */
import { useEffect, useState } from 'react'
import api from '../api/api'

function Eventos() {
  /**
   * eventos é uma variável de estado que começa como array vazio [].
   * setEventos é a função para atualizar essa lista.
   * loading é outra variável de estado, indicando se os dados ainda estão sendo carregados. Começa como true.
   * setLoading atualiza esse valor.
   */
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  //  roda depois que o componente montar (renderizar pela primeira vez).
  useEffect(() => {
    //Ele faz a requisição HTTP para o endpoint /eventos usando o api (Axios).
    api.get('/eventos') // exemplo: endpoint do seu backend
    //quando a resposta chegar com sucesso, atualiza o estado eventos com os dados do backend
      .then((res) => {
        setEventos(res.data)
      })
      //se ocorrer um erro, ele captura e exibe no console
      .catch((err) => {
        console.error('Erro ao buscar eventos:', err)
      })
      // independentemente de sucesso ou erro, marca que acabou o carregamento (loading vira false).
      .finally(() => setLoading(false))
  }, 
  // indica que esse efeito só roda uma vez, na montagem do componente.
  [])

  // Se loading for true, mostra uma mensagem simples de carregamento e não renderiza mais nada por enquanto.
  if (loading) return <p>Carregando...</p>

  // Aqui é onde vamos construir nosso front mesmo, usando elementos HTML e atributos do react pra exibir os dados 
  // que são recebidos pela nossa API em Kotlin
  return (
    <div>
      <h1>Lista de Eventos</h1>
      <ul>
        {/* percorre cada item do array e retorna um novo array com o resultado da função que você passar pra ele. */}
        {eventos.map((evento) => (
          // aqui passamos os nomes das propriedades IGUAL ESTÁ NA ENTIDADE DA API
          <li key={evento.idEvento}>{evento.nomeEvento}</li>
        ))}
      </ul>
    </div>
  )
}

//Exporta o componente para que você possa importar e usar em outras partes do seu app.
export default Eventos
