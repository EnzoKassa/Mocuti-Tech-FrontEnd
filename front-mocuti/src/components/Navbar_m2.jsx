export default function NavbarM2() {
  return (
    <nav 
      className="navbar-m2" 
      style={{ 
        backgroundColor: '#333', 
        color: '#fff', 
        width: '220px',   // largura fixa
        height: '100vh',  // ocupa a altura toda
        position: 'fixed', 
        top: 0, 
        left: 0,
        padding: '1rem'
      }}
    >
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><a href="/m2/home" style={{ color: '#fff', textDecoration: 'none' }}>Home</a></li>
        <li><a href="/m2/feedbacks" style={{ color: '#fff', textDecoration: 'none' }}>Feedbacks</a></li>
        <li><a href="/m2/settings" style={{ color: '#fff', textDecoration: 'none' }}>Settings</a></li>
      </ul>
    </nav>
  );
}
