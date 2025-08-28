import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Eye, EyeOff } from 'lucide-react'
import prototypeImage from './assets/prototype-image.png'
import './App.css'

function App() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fontSize, setFontSize] = useState(16)

  const handleLogin = (e) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    // Aqui você implementaria a lógica de autenticação
  }

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12))
  }

  return (
    <div className="min-h-screen flex" style={{ fontSize: `${fontSize}px` }}>
      {/* Coluna da esquerda - Imagem */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-8">
        <div className="max-w-md">
          <img 
            src={prototypeImage} 
            alt="Pessoas em atividade comunitária" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Coluna da direita - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        {/* Botões de acessibilidade */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={decreaseFontSize}
            className="w-10 h-10 p-0 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          >
            A-
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={increaseFontSize}
            className="w-10 h-10 p-0 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          >
            A+
          </Button>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Cabeçalho */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Bem vindo de volta!
            </h1>
            <p className="text-gray-600">
              Por favor, faça login para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Deve ter uma combinação de no mínimo 8 letras, números e símbolos
              </p>
            </div>

            {/* Link "Esqueceu sua senha?" */}
            <div className="text-right">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                Esqueceu sua senha?
              </a>
            </div>

            {/* Botão Login */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
            >
              Login
            </Button>

            {/* Link para cadastro */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem conta?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Faça o cadastro aqui
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App

