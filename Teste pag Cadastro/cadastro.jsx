import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Eye, EyeOff } from 'lucide-react'
import backgroundImage from '../assets/images/fotoLogin.png'
import '../styles/cadastro.css'

function Cadastro() {
    const [currentStep, setCurrentStep] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [fontSize, setFontSize] = useState(16)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchEventos() {
            try {
                // eventos
                const resEventos = await fetch("http://localhost:8080/usuarios//cadastrar");
                if (!resEventos.ok) throw new Error("Erro ao buscar eventos");
                const eventosData = await resEventos.json();
                setEventos(eventosData);

                // enderecos
                const resEnderecos = await fetch("http://localhost:8080/endereco");
                if (!resEnderecos.ok) throw new Error("Erro ao buscar endereços");
                const enderecosData = await resEnderecos.json();
                setEnderecos(enderecosData);

                // categorias
                const resCategorias = await fetch("http://localhost:8080/categorias");
                if (!resCategorias.ok) throw new Error("Erro ao buscar categorias");
                const categoriasData = await resCategorias.json();
                setCategorias(categoriasData);

                // status evento
                const resStatus = await fetch("http://localhost:8080/status-eventos");
                if (!resStatus.ok) throw new Error("Erro ao buscar status de evento");
                const statusData = await resStatus.json();
                setStatusEventos(statusData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchEventos();
    }, []);

    // Estados para os campos do formulário
    const [formData, setFormData] = useState({
        // Primeira parte
        nomeCompleto: '',
        cpf: '',
        telefone: '',
        dataNascimento: '',
        genero: '',
        categoriaPreferida: '',
        email: '',
        senha: '',

        // Segunda parte
        cep: '',
        logradouro: '',
        uf: '',
        estado: '',
        bairro: '',
        numero: '',
        complemento: ''
    })

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleNextStep = (e) => {
        e.preventDefault()
        if (currentStep === 1) {
            setCurrentStep(2)
        } else {
            // Aqui você implementaria o envio do formulário
            console.log('Dados do formulário:', formData)
        }
    }

    const handlePrevStep = () => {
        setCurrentStep(1)
    }

    const increaseFontSize = () => {
        setFontSize(prev => Math.min(prev + 2, 24))
    }

    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(prev - 2, 12))
    }

    return (
        <div className="min-h-screen flex bg-gray-50" style={{ fontSize: `${fontSize}px` }}>
            {/* Coluna da esquerda - Formulário */}
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

                <div className="w-full max-w-md">
                    {/* Cabeçalho */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Cadastre-se
                        </h1>
                    </div>

                    {/* Primeira parte do formulário */}
                    {currentStep === 1 && (
                        <div className="border-2 border-blue-400 rounded-lg p-6 bg-white">
                            <form onSubmit={handleNextStep} className="space-y-4">
                                {/* Nome Completo */}
                                <div className="space-y-2">
                                    <label htmlFor="nomeCompleto" className="text-sm font-medium text-gray-700">
                                        Nome Completo
                                    </label>
                                    <Input
                                        id="nomeCompleto"
                                        type="text"
                                        placeholder="Digite seu nome completo"
                                        value={formData.nomeCompleto}
                                        onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                                        className="w-full bg-gray-100"
                                        required
                                    />
                                </div>

                                {/* CPF e Telefone */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                                            CPF
                                        </label>
                                        <Input
                                            id="cpf"
                                            type="text"
                                            placeholder="Digite seu CPF"
                                            value={formData.cpf}
                                            onChange={(e) => handleInputChange('cpf', e.target.value)}
                                            className="w-full bg-gray-100"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                                            Telefone
                                        </label>
                                        <Input
                                            id="telefone"
                                            type="tel"
                                            placeholder="Digite seu telefone"
                                            value={formData.telefone}
                                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                                            className="w-full bg-gray-100"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Data de Nascimento e Gênero */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="dataNascimento" className="text-sm font-medium text-gray-700">
                                            Data Nascimento
                                        </label>
                                        <Input
                                            id="dataNascimento"
                                            type="date"
                                            placeholder="dd/mm/aaaa"
                                            value={formData.dataNascimento}
                                            onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                                            className="w-full bg-gray-100"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="genero" className="text-sm font-medium text-gray-700">
                                            Gênero
                                        </label>
                                        <Select onValueChange={(value) => handleInputChange('genero', value)}>
                                            <SelectTrigger className="w-full bg-gray-100">
                                                <SelectValue placeholder="Selecione seu gênero" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="masculino">Masculino</SelectItem>
                                                <SelectItem value="feminino">Feminino</SelectItem>
                                                <SelectItem value="outro">Outro</SelectItem>
                                                <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Categoria Preferida */}
                                <div className="space-y-2">
                                    <label htmlFor="categoriaPreferida" className="text-sm font-medium text-gray-700">
                                        Categoria Preferida
                                    </label>
                                    <Select onValueChange={(value) => handleInputChange('categoriaPreferida', value)}>
                                        <SelectTrigger className="w-full bg-gray-100">
                                            <SelectValue placeholder="Selecione o tipo de categoria de evento gostaria de participar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="esportes">Esportes</SelectItem>
                                            <SelectItem value="cultura">Cultura</SelectItem>
                                            <SelectItem value="educacao">Educação</SelectItem>
                                            <SelectItem value="saude">Saúde</SelectItem>
                                            <SelectItem value="meio-ambiente">Meio Ambiente</SelectItem>
                                            <SelectItem value="assistencia-social">Assistência Social</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* E-Mail */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        E-Mail
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Digite seu e-mail"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full bg-gray-100"
                                        required
                                    />
                                </div>

                                {/* Senha */}
                                <div className="space-y-2">
                                    <label htmlFor="senha" className="text-sm font-medium text-gray-700">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="senha"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Crie uma senha"
                                            value={formData.senha}
                                            onChange={(e) => handleInputChange('senha', e.target.value)}
                                            className="w-full pr-10 bg-gray-100"
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
                                </div>

                                {/* Botão Próximo */}
                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium mt-6"
                                >
                                    Próximo
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Segunda parte do formulário */}
                    {currentStep === 2 && (
                        <div className="border-2 border-orange-400 rounded-lg p-6 bg-white">
                            <form onSubmit={handleNextStep} className="space-y-4">
                                {/* CEP */}
                                <div className="space-y-2">
                                    <label htmlFor="cep" className="text-sm font-medium text-gray-700">
                                        CEP
                                    </label>
                                    <Input
                                        id="cep"
                                        type="text"
                                        placeholder="Digite seu CEP"
                                        value={formData.cep}
                                        onChange={(e) => handleInputChange('cep', e.target.value)}
                                        className="w-full bg-gray-100"
                                        required
                                    />
                                </div>

                                {/* Logradouro */}
                                <div className="space-y-2">
                                    <label htmlFor="logradouro" className="text-sm font-medium text-gray-700">
                                        Logradouro
                                    </label>
                                    <Input
                                        id="logradouro"
                                        type="text"
                                        placeholder="Digite seu logradouro (rua, avenida)"
                                        value={formData.logradouro}
                                        onChange={(e) => handleInputChange('logradouro', e.target.value)}
                                        className="w-full bg-gray-100"
                                        required
                                    />
                                </div>

                                {/* UF e Estado */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="uf" className="text-sm font-medium text-gray-700">
                                            UF
                                        </label>
                                        <Select onValueChange={(value) => handleInputChange('uf', value)}>
                                            <SelectTrigger className="w-full bg-gray-100">
                                                <SelectValue placeholder="Selecione a sigla do estado (ex: SP)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AC">AC</SelectItem>
                                                <SelectItem value="AL">AL</SelectItem>
                                                <SelectItem value="AP">AP</SelectItem>
                                                <SelectItem value="AM">AM</SelectItem>
                                                <SelectItem value="BA">BA</SelectItem>
                                                <SelectItem value="CE">CE</SelectItem>
                                                <SelectItem value="DF">DF</SelectItem>
                                                <SelectItem value="ES">ES</SelectItem>
                                                <SelectItem value="GO">GO</SelectItem>
                                                <SelectItem value="MA">MA</SelectItem>
                                                <SelectItem value="MT">MT</SelectItem>
                                                <SelectItem value="MS">MS</SelectItem>
                                                <SelectItem value="MG">MG</SelectItem>
                                                <SelectItem value="PA">PA</SelectItem>
                                                <SelectItem value="PB">PB</SelectItem>
                                                <SelectItem value="PR">PR</SelectItem>
                                                <SelectItem value="PE">PE</SelectItem>
                                                <SelectItem value="PI">PI</SelectItem>
                                                <SelectItem value="RJ">RJ</SelectItem>
                                                <SelectItem value="RN">RN</SelectItem>
                                                <SelectItem value="RS">RS</SelectItem>
                                                <SelectItem value="RO">RO</SelectItem>
                                                <SelectItem value="RR">RR</SelectItem>
                                                <SelectItem value="SC">SC</SelectItem>
                                                <SelectItem value="SP">SP</SelectItem>
                                                <SelectItem value="SE">SE</SelectItem>
                                                <SelectItem value="TO">TO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="estado" className="text-sm font-medium text-gray-700">
                                            Estado
                                        </label>
                                        <Input
                                            id="estado"
                                            type="text"
                                            placeholder="Digite o nome do estado"
                                            value={formData.estado}
                                            onChange={(e) => handleInputChange('estado', e.target.value)}
                                            className="w-full bg-gray-100"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Bairro */}
                                <div className="space-y-2">
                                    <label htmlFor="bairro" className="text-sm font-medium text-gray-700">
                                        Bairro
                                    </label>
                                    <Input
                                        id="bairro"
                                        type="text"
                                        placeholder="Digite seu bairro"
                                        value={formData.bairro}
                                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                                        className="w-full bg-gray-100"
                                        required
                                    />
                                </div>

                                {/* Número e Complemento */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="numero" className="text-sm font-medium text-gray-700">
                                            Número
                                        </label>
                                        <Input
                                            id="numero"
                                            type="text"
                                            placeholder="Digite o número da residência"
                                            value={formData.numero}
                                            onChange={(e) => handleInputChange('numero', e.target.value)}
                                            className="w-full bg-gray-100"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="complemento" className="text-sm font-medium text-gray-700">
                                            Complemento
                                        </label>
                                        <Input
                                            id="complemento"
                                            type="text"
                                            placeholder="Digite complemento"
                                            value={formData.complemento}
                                            onChange={(e) => handleInputChange('complemento', e.target.value)}
                                            className="w-full bg-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex gap-4 mt-6">
                                    <Button
                                        type="button"
                                        onClick={handlePrevStep}
                                        variant="outline"
                                        className="flex-1 py-3 text-lg font-medium"
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                                    >
                                        Cadastrar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Coluna da direita - Imagem */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-8">
                <div className="max-w-md">
                    <img
                        src={backgroundImage}
                        alt="Pessoas preparando refeições comunitárias"
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    )
}

export default Cadastro
