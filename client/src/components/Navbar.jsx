import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); }, [location]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🍽️</span>
                    Foodie<span className="text-gradient">Express</span>
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className={`navbar-link ${isActive('/')}`}>Home</Link>
                    <Link to="/menu" className={`navbar-link ${isActive('/menu')}`}>Menu</Link>

                    {user && (
                        <Link to="/profile" className={`navbar-link ${isActive('/profile')}`}>My Orders</Link>
                    )}

                    {isAdmin && (
                        <Link to="/admin" className={`navbar-link ${isActive('/admin')}`}>Admin</Link>
                    )}

                    <Link to="/cart" className="navbar-cart">
                        🛒 Cart
                        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                    </Link>

                    {user ? (
                        <div className="navbar-user" ref={dropdownRef}>
                            <div className="navbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            {dropdownOpen && (
                                <div className="user-dropdown">
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>👤 Profile</Link>
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>📦 My Orders</Link>
                                    {isAdmin && <Link to="/admin" onClick={() => setDropdownOpen(false)}>⚙️ Admin Panel</Link>}
                                    <button onClick={() => { logout(); setDropdownOpen(false); }}>🚪 Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                    )}
                </div>

                <div className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span><span></span><span></span>
                </div>
            </div>
        </nav>
    );
}
