import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Eventos from './pages/eventos'
import CanalComunicacao from './pages/canalComunicacao'
import LandingPage from './pages/landingPage'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/canal-comunicacao" element={<CanalComunicacao />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
