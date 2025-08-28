# Página de Login Responsiva em React

Esta é uma página de login web responsiva desenvolvida em React baseada no protótipo fornecido.

## Características Implementadas

### Layout e Design
- **Layout de duas colunas**: Imagem à esquerda e formulário à direita
- **Design responsivo**: Adapta-se a diferentes tamanhos de tela
- **Estilo moderno**: Utiliza Tailwind CSS e componentes shadcn/ui

### Funcionalidades
- **Formulário de login** com campos de email e senha
- **Validação de campos** obrigatórios
- **Botão de mostrar/ocultar senha** com ícones visuais
- **Botões de acessibilidade** (A- e A+) para ajustar o tamanho da fonte
- **Links funcionais** para "Esqueceu sua senha?" e "Faça o cadastro aqui"

### Responsividade
- **Desktop**: Layout de duas colunas com imagem e formulário lado a lado
- **Mobile**: Layout de coluna única com formulário centralizado
- **Tablet**: Adaptação automática baseada no tamanho da tela

### Acessibilidade
- **Controles de fonte**: Botões A- e A+ para diminuir/aumentar o tamanho da fonte
- **Labels apropriados** para todos os campos de formulário
- **Contraste adequado** entre texto e fundo
- **Navegação por teclado** suportada

## Tecnologias Utilizadas

- **React 18**: Framework JavaScript para interface de usuário
- **Vite**: Ferramenta de build rápida e moderna
- **Tailwind CSS**: Framework CSS utilitário
- **shadcn/ui**: Biblioteca de componentes UI
- **Lucide React**: Ícones SVG para React

## Estrutura do Projeto

```
login-page/
├── src/
│   ├── assets/
│   │   └── prototype-image.png    # Imagem do protótipo
│   ├── components/
│   │   └── ui/                    # Componentes shadcn/ui
│   ├── App.jsx                    # Componente principal
│   ├── App.css                    # Estilos customizados
│   └── main.jsx                   # Ponto de entrada
├── dist/                          # Build de produção
├── package.json
└── vite.config.js
```

## Como Executar Localmente

1. **Instalar dependências**:
   ```bash
   cd login-page
   npm install
   ```

2. **Executar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Construir para produção**:
   ```bash
   npm run build
   ```

## Funcionalidades do Formulário

### Campos de Entrada
- **Email**: Campo obrigatório com validação de formato de email
- **Senha**: Campo obrigatório com opção de mostrar/ocultar texto

### Validações
- Campos obrigatórios são validados no envio do formulário
- Feedback visual para campos inválidos
- Mensagem de orientação para senha (mínimo 8 caracteres com letras, números e símbolos)

### Interações
- **Botão Login**: Processa o formulário (atualmente apenas log no console)
- **Mostrar/Ocultar Senha**: Alterna a visibilidade da senha
- **Acessibilidade**: Botões A- e A+ ajustam o tamanho da fonte (12px a 24px)

## Responsividade

A página foi desenvolvida com abordagem "mobile-first" e inclui:

- **Breakpoints**: Utiliza classes Tailwind para diferentes tamanhos de tela
- **Layout flexível**: Adapta-se automaticamente ao espaço disponível
- **Imagens responsivas**: Redimensionam adequadamente em diferentes dispositivos
- **Tipografia escalável**: Tamanhos de fonte ajustáveis para melhor legibilidade

## Próximos Passos

Para implementação em produção, considere adicionar:

1. **Integração com API**: Conectar o formulário a um backend real
2. **Gerenciamento de estado**: Redux ou Context API para estado global
3. **Roteamento**: React Router para navegação entre páginas
4. **Testes**: Jest e React Testing Library para testes automatizados
5. **Autenticação**: JWT ou OAuth para autenticação segura
6. **Validação avançada**: Biblioteca como Formik ou React Hook Form

## Suporte

A aplicação foi testada e é compatível com:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Dispositivos móveis iOS e Android

