import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }
    console.log('Redefinindo senha...', formData)
    alert('Senha redefinida com sucesso!')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Botões de acessibilidade no canto superior direito */}
      <div className="fixed top-4 right-4 flex gap-1">
        <button className="accessibility-btn bg-blue-600 text-white px-2 py-1 text-sm font-bold rounded">
          A-
        </button>
        <button className="accessibility-btn bg-blue-600 text-white px-2 py-1 text-sm font-bold rounded">
          A+
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-8">
            Redefinição de Senha
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nova Senha */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Digite sua nova senha"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Deve ter uma combinação de no mínimo 8 dígitos, números e símbolos
              </p>
            </div>

            {/* Confirme a Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirme a Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Botão de Redefinir */}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Redefinir Senha
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
