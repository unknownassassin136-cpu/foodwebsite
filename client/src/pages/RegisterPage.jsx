import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.phone);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="subtitle">Join FoodieExpress and start ordering</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" type="text" name="name" value={form.name}
                            onChange={handleChange} placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" name="email" value={form.email}
                            onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone (optional)</label>
                        <input className="form-input" type="tel" name="phone" value={form.phone}
                            onChange={handleChange} placeholder="555-0100" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" name="password" value={form.password}
                                onChange={handleChange} placeholder="Min 6 characters" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword}
                                onChange={handleChange} placeholder="••••••••" required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in →</Link>
                </div>
            </div>
        </div>
    );
}
