import '../styles/PasswordSucess.css';

// Componente de ícone de check (sucesso)
const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

function ResetSucess() {
  const handleContinue = () => {
    window.location.href = "/login"; // redireciona para a página de login
  }

  return (
    <div className="container-reset">
      <div className="form-wrapper">
        <div className="form-card">
          {/* Ícone de sucesso */}
          <div className="success-icon">
            <CheckIcon />
          </div>

          <h1 className="form-title">
            Senha Redefinida com Sucesso!
          </h1>

          <p className="success-message">
            Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
          </p>

          <div className="success-actions">
            <button
              onClick={handleContinue}
              className="submit-btn"
            >
              Continuar para Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetSucess

