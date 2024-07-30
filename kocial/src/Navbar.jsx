import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import './css/NavBar.css';
import { useAuth } from './AuthContext';

const NavBar = () => {
  const { isLoggedIn, logout, userName } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar flex justify-between items-center p-4">
      <div className="flex items-center">
        <span className="kocial">KOCIAL</span>
      </div>
      <ul className="flex space-x-6 text-sm">
        <Link to="/">
          <li className="hover-effect">HOME</li>
        </Link>
        <Link to='/Main'>
          <li className="hover-effect">BROWSE</li>
        </Link>
        <Link to="/Possibility">
          <li className="hover-effect">ESTIMATE</li>
        </Link>
      </ul>
      <div className="relative">
        {isLoggedIn ? (
          <button onClick={toggleMenu} className="login-button flex items-center rounded-full py-2 px-4">
            <User size={24} />
            <span className="ml-2">{userName}</span>
          </button>
        ) : (
          <Link to="/Login">
            <button className="login-button flex items-center rounded-full py-2 px-4">
              <User size={24} />
            </button>
          </Link>
        )}
        {isLoggedIn && isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
            <Link to="/Mypage">
              <button className="nav-button">
                <User className="nav-icon" size={16} />
                마이페이지
              </button>
            </Link>
            <button 
              onClick={handleLogout}
              className="nav-button"
            >
              <LogOut className="nav-icon" size={16} />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;