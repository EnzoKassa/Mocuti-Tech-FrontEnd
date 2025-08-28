import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Eventos from './pages/Beneficiario/eventos'
// import CanalComunicacao from './pages/canalComunicacao'
// import LandingPage from './pages/landingPage'
import FiltroEventos from "./components/filter/FilterEvento";
import FiltroCategoria from "./components/filter/FilterCategoria";
import FiltroStatus from "./components/filter/FilterStatusEvento";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/filtro" element={<FiltroEventos />} /> 
        <Route path="/filtro-categoria" element={<FiltroCategoria />} /> 
        <Route path="/filtro-status" element={<FiltroStatus />} />


      </Routes>
    </BrowserRouter>
  )
}

export default App
