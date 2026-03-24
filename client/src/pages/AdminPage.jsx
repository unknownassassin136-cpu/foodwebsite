import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminService, categoryService } from '../api/services';
import { useSocket } from '../context/SocketContext';
import AdminChatInbox from '../components/AdminChatInbox';

const statusLabels = {
    placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing',
    'out-for-delivery': 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
};

const statusOptions = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

export default function AdminPage() {
    const location = useLocation();
    const { socket, connected } = useSocket() || {};
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [itemForm, setItemForm] = useState({
        name: '', description: '', price: '', category: '', image: '',
        isVegetarian: false, isSpicy: false, isAvailable: true, preparationTime: 20, calories: ''
    });

    // Load data for current tab
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'dashboard') {
                    const res = await adminService.getStats();
                    setStats(res.data);
                } else if (activeTab === 'menu') {
                    const [itemsRes, catRes] = await Promise.all([
                        adminService.getMenu(),
                        categoryService.getAll()
                    ]);
                    setMenuItems(itemsRes.data);
                    setCategories(catRes.data);
                } else if (activeTab === 'orders') {
                    const res = await adminService.getOrders({});
                    setOrders(res.data.orders);
                } else if (activeTab === 'chat') {
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error('Admin data load error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab]);

    // ─── Real-time: listen for new orders ───
    useEffect(() => {
        if (!socket || !connected) return;
        const handleNewOrder = () => {
            // Refresh orders if on orders tab
            if (activeTab === 'orders') {
                adminService.getOrders({}).then(res => setOrders(res.data.orders)).catch(console.error);
            }
        };
        socket.on('order:new', handleNewOrder);
        return () => socket.off('order:new', handleNewOrder);
    }, [socket, connected, activeTab]);

    // ─── Menu CRUD ───
    const openAddModal = () => {
        setEditItem(null);
        setItemForm({ name: '', description: '', price: '', category: categories[0]?._id || '', image: '', isVegetarian: false, isSpicy: false, isAvailable: true, preparationTime: 20, calories: '' });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditItem(item);
        setItemForm({
            name: item.name, description: item.description, price: item.price,
            category: item.category?._id || '', image: item.image || '',
            isVegetarian: item.isVegetarian, isSpicy: item.isSpicy, isAvailable: item.isAvailable,
            preparationTime: item.preparationTime || 20, calories: item.calories || ''
        });
        setShowModal(true);
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...itemForm, price: parseFloat(itemForm.price), calories: itemForm.calories ? parseInt(itemForm.calories) : null };
            if (editItem) {
                const { data } = await adminService.updateItem(editItem._id, payload);
                setMenuItems(prev => prev.map(i => i._id === data._id ? data : i));
            } else {
                const { data } = await adminService.createItem(payload);
                setMenuItems(prev => [data, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await adminService.deleteItem(id);
            setMenuItems(prev => prev.filter(i => i._id !== id));
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    // ─── Order Status Update ───
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { data } = await adminService.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o._id === data._id ? data : o));
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <h3>Admin Panel</h3>
                <nav className="admin-nav">
                    <a className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>📊 Dashboard</a>
                    <a className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')} style={{ cursor: 'pointer' }}>🍽️ Menu Items</a>
                    <a className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>📦 Orders</a>
                    <a className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')} style={{ cursor: 'pointer' }}>💬 Chat</a>
                </nav>
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)' }}>
                    <Link to="/" className="btn btn-ghost btn-sm btn-full">← Back to Site</Link>
                </div>
            </div>

            {/* Content */}
            <div className="admin-content">
                {loading ? (
                    <div className="spinner-container"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* ─── Dashboard ─── */}
                        {activeTab === 'dashboard' && stats && (
                            <>
                                <div className="admin-header">
                                    <h1>Dashboard</h1>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="label">Total Orders</div>
                                        <div className="value">{stats.totalOrders}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="label">Revenue</div>
                                        <div className="value">${stats.totalRevenue.toFixed(2)}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="label">Customers</div>
                                        <div className="value">{stats.totalUsers}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="label">Menu Items</div>
                                        <div className="value">{stats.totalItems}</div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>Recent Orders</h2>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentOrders.map(order => (
                                            <tr key={order._id}>
                                                <td>#{order._id.slice(-8).toUpperCase()}</td>
                                                <td>{order.user?.name || 'N/A'}</td>
                                                <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                                                <td><span className={`status-badge status-${order.status}`}>{statusLabels[order.status]}</span></td>
                                                <td style={{ color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* ─── Menu Management ─── */}
                        {activeTab === 'menu' && (
                            <>
                                <div className="admin-header">
                                    <h1>Menu Items</h1>
                                    <button className="btn btn-primary" onClick={openAddModal}>+ Add Item</button>
                                </div>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menuItems.map(item => (
                                            <tr key={item._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                                {item.isVegetarian ? '🌱' : ''} {item.isSpicy ? '🌶️' : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.category?.name || '—'}</td>
                                                <td style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${item.isAvailable ? 'badge-veg' : 'badge-nonveg'}`}>
                                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions">
                                                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(item)}>✏️ Edit</button>
                                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteItem(item._id)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* ─── Orders Management ─── */}
                        {activeTab === 'orders' && (
                            <>
                                <div className="admin-header">
                                    <h1>Orders</h1>
                                </div>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td>#{order._id.slice(-8).toUpperCase()}</td>
                                                <td>
                                                    <div>{order.user?.name || 'N/A'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.user?.email}</div>
                                                </td>
                                                <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                    {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                                                </td>
                                                <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        style={{ minWidth: '150px', padding: '6px 10px', fontSize: '0.8rem' }}
                                                    >
                                                        {statusOptions.map(s => (
                                                            <option key={s} value={s}>{statusLabels[s]}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && (
                                    <div className="empty-state">
                                        <div className="icon">📦</div>
                                        <h3>No orders yet</h3>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ─── Chat ─── */}
                        {activeTab === 'chat' && (
                            <>
                                <div className="admin-header">
                                    <h1>Customer Chat</h1>
                                    <span style={{ fontSize: '0.85rem', color: connected ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {connected ? '● Connected' : '○ Disconnected'}
                                    </span>
                                </div>
                                <AdminChatInbox />
                            </>
                        )}
                    </>
                )}

                {/* ─── Add/Edit Modal ─── */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editItem ? 'Edit Item' : 'Add New Item'}</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleSaveItem}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" type="text" value={itemForm.name}
                                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows="3" value={itemForm.description}
                                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price ($)</label>
                                        <input className="form-input" type="number" step="0.01" min="0" value={itemForm.price}
                                            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" value={itemForm.category}
                                            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} required>
                                            <option value="">Select category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input className="form-input" type="url" value={itemForm.image}
                                        onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                                        placeholder="https://..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Prep Time (min)</label>
                                        <input className="form-input" type="number" min="1" value={itemForm.preparationTime}
                                            onChange={(e) => setItemForm({ ...itemForm, preparationTime: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Calories</label>
                                        <input className="form-input" type="number" min="0" value={itemForm.calories}
                                            onChange={(e) => setItemForm({ ...itemForm, calories: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={itemForm.isVegetarian}
                                            onChange={(e) => setItemForm({ ...itemForm, isVegetarian: e.target.checked })} />
                                        🌱 Vegetarian
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={itemForm.isSpicy}
                                            onChange={(e) => setItemForm({ ...itemForm, isSpicy: e.target.checked })} />
                                        🌶️ Spicy
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={itemForm.isAvailable}
                                            onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })} />
                                        ✅ Available
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editItem ? 'Update Item' : 'Add Item'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
