import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/ModeNavigation.css';

const ModeNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="mode-navigation">
      <Link 
        to="/play/offline" 
        className={`mode-nav-button ${currentPath === '/play/offline' ? 'active' : ''}`}
      >
        2 Players
      </Link>
      <Link 
        to="/play/ai" 
        className={`mode-nav-button ${currentPath === '/play/ai' ? 'active' : ''}`}
      >
        vs AI
      </Link>
      <Link 
        to="/play/online" 
        className={`mode-nav-button ${currentPath === '/play/online' ? 'active' : ''}`}
      >
        Online
      </Link>
    </div>
  );
};

export default ModeNavigation;
