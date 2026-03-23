import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/globalSlice';
import './Header.scss';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, userName } = useSelector(state => state.global);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">TaskMaster</span>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/tasks" className="nav-link">Tasks</Link>
          <Link to="/groups" className="nav-link">Groups</Link>
        </nav>

        <div className="auth-section">
          {isLoggedIn ? (
            <div className="profile-dropdown-container">
              <span className="user-name">{userName}</span>
              <div 
                className="profile-icon" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                👤
              </div>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item logout" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;