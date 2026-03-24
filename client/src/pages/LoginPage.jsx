import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Sign in to your FoodieExpress account</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one →</Link>
                </div>

                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <strong>Demo accounts:</strong><br />
                    Admin: admin@foodie.com / admin123<br />
                    User: john@example.com / password123
                </div>
            </div>
        </div>
    );
}
