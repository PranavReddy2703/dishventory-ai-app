import React from 'react';
import './NavBar.css'; // Importing the new global stylesheet

const Navbar = ({ activePage, setActivePage }) => {
  const navItems = [
    { name: 'Billing', id: 'billing' },
    { name: 'Inventory', id: 'inventory' },
    { name: 'Recipes', id: 'recipes' },
    { name: 'Forecast', id: 'forecast' },
    { name: 'Order History', id: 'order-history' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`navbar-button ${activePage === item.id ? 'active' : ''}`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;