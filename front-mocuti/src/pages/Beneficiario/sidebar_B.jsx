import React from "react";
import "../../styles/sidebar_B.css";

const Sidebar = ({ usuarioNome = "Jhonatan" }) => {
  const menuItems = [
    { 
      icon: "📅", 
      label: "Eventos", 
      active: true,
      href: "/eventos"
    },
    { 
      icon: "👥", 
      label: "Lista de Usuários", 
      active: false,
      href: "/usuarios"
    },
    { 
      icon: "💬", 
      label: "Feedbacks", 
      active: false,
      href: "/feedbacks"
    },
    { 
      icon: "👤", 
      label: "Meu Perfil", 
      active: false,
      href: "/perfil"
    },
    { 
      icon: "👁️", 
      label: "Visão Geral", 
      active: false,
      href: "/visao-geral"
    },
  ];

  const handleMenuClick = (item) => {
    console.log(`Navegando para: ${item.label}`);
    // Implementar navegação aqui
    // Exemplo: window.location.href = item.href;
  };

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      console.log("Fazendo logout...");
      // Implementar logout aqui
      // Exemplo: localStorage.removeItem("token");
      // window.location.href = "/login";
    }
  };

  return (
    <div className="sidebar">
      {/* Perfil do usuário */}
      <div className="perfil">
        <div className="avatar">
          <span className="avatar-icon">👤</span>
        </div>
        <span className="nome">{usuarioNome}</span>
      </div>

      {/* Menu de navegação */}
      <nav className="menu">
        {menuItems.map((item, index) => (
          <li key={index} className={item.active ? "active" : ""}>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick(item);
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.label}
            </a>
          </li>
        ))}
      </nav>

      {/* Logout */}
      <div className="logout">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          <span className="logout-icon">🚪</span>
          Sair
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
