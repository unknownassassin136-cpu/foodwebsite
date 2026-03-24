import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../api/services';

const statusLabels = {
    placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing',
    'out-for-delivery': 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
};

export default function ProfilePage() {
    const { user, updateProfile, logout } = useAuth();
    const [tab, setTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        orderService.getAll()
            .then(res => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoadingOrders(false));
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveMsg('');
        try {
            await updateProfile(profileForm);
            setSaveMsg('Profile updated successfully!');
        } catch (err) {
            setSaveMsg('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-grid">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="profile-avatar-large">{user?.name?.charAt(0).toUpperCase()}</div>
                        <h3 style={{ textAlign: 'center', marginBottom: '4px' }}>{user?.name}</h3>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-lg)' }}>
                            {user?.email}
                        </p>
                        <nav className="profile-nav">
                            <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>📦 My Orders</button>
                            <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>👤 Edit Profile</button>
                            <button onClick={logout} style={{ color: 'var(--color-danger)' }}>🚪 Logout</button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="profile-content">
                        {tab === 'orders' && (
                            <>
                                <h2 style={{ marginBottom: 'var(--space-lg)' }}>My Orders</h2>
                                {loadingOrders ? (
                                    <div className="spinner-container"><div className="spinner"></div></div>
                                ) : orders.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="icon">📦</div>
                                        <h3>No orders yet</h3>
                                        <p>Start ordering delicious food!</p>
                                        <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
                                    </div>
                                ) : (
                                    orders.map(order => (
                                        <Link to={`/order-confirmation/${order._id}`} key={order._id} className="order-card" style={{ display: 'block', color: 'inherit' }}>
                                            <div className="order-card-header">
                                                <div>
                                                    <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                                                    <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span className={`status-badge status-${order.status}`}>
                                                    {statusLabels[order.status]}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                                    {order.items.map(i => i.name).join(', ')}
                                                </div>
                                                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                                                    ${order.total.toFixed(2)}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </>
                        )}

                        {tab === 'profile' && (
                            <>
                                <h2 style={{ marginBottom: 'var(--space-lg)' }}>Edit Profile</h2>
                                {saveMsg && <div className={`alert ${saveMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>{saveMsg}</div>}
                                <form onSubmit={handleSaveProfile} style={{ maxWidth: '440px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input className="form-input" type="text" value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" value={user?.email} disabled
                                            style={{ opacity: 0.5 }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" type="tel" value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            placeholder="555-0100" />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
