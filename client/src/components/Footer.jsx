import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3>🍽️ Foodie<span className="text-gradient">Express</span></h3>
                        <p>Delicious food delivered to your doorstep. Freshly prepared by expert chefs, arriving hot and fast.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <Link to="/">Home</Link>
                        <Link to="/menu">Menu</Link>
                        <Link to="/cart">Cart</Link>
                        <Link to="/profile">My Account</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Categories</h4>
                        <Link to="/menu">Appetizers</Link>
                        <Link to="/menu">Main Course</Link>
                        <Link to="/menu">Pizza & Pasta</Link>
                        <Link to="/menu">Desserts</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <a href="tel:555-0100">📞 (555) 010-0100</a>
                        <a href="mailto:hello@foodieexpress.com">✉️ hello@foodieexpress.com</a>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>📍 123 Main Street, New York, NY 10001</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    © {new Date().getFullYear()} FoodieExpress. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
