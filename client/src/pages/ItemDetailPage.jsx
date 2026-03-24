import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { menuService } from '../api/services';
import { useCart } from '../context/CartContext';

export default function ItemDetailPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        setLoading(true);
        menuService.getItem(id)
            .then(res => setItem(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleAdd = () => {
        addToCart(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
    if (!item) return <div className="empty-state"><h3>Item not found</h3></div>;

    const fallbackImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

    return (
        <div className="item-detail">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Home</Link> <span>/</span>
                    <Link to="/menu">Menu</Link> <span>/</span>
                    <span>{item.name}</span>
                </div>

                <div className="item-detail-grid" style={{ marginTop: 'var(--space-lg)' }}>
                    <div className="item-detail-image">
                        <img src={item.image || fallbackImg} alt={item.name} onError={(e) => { e.target.src = fallbackImg; }} />
                    </div>

                    <div className="item-detail-info">
                        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)' }}>
                            {item.isVegetarian && <span className="badge badge-veg">🌱 Vegetarian</span>}
                            {item.isSpicy && <span className="badge badge-spicy">🌶️ Spicy</span>}
                        </div>

                        <h1>{item.name}</h1>

                        <div className="item-detail-extras" style={{ marginTop: 'var(--space-md)' }}>
                            <div className="item-extra">
                                <span>★</span> <strong>{item.rating?.toFixed(1)}</strong>
                                <span>({item.reviewCount} reviews)</span>
                            </div>
                            <div className="item-extra">
                                <span>⏱️</span> <strong>{item.preparationTime} min</strong>
                            </div>
                            {item.calories && (
                                <div className="item-extra">
                                    <span>🔥</span> <strong>{item.calories} cal</strong>
                                </div>
                            )}
                        </div>

                        <div className="item-detail-price">${item.price?.toFixed(2)}</div>

                        <p className="item-detail-desc">{item.description}</p>

                        {item.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-xl)' }}>
                                {item.tags.map(tag => (
                                    <span key={tag} style={{
                                        padding: '4px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--color-bg-elevated)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '0.8rem',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAdd}
                                disabled={!item.isAvailable}
                            >
                                {added ? '✓ Added to Cart!' : item.isAvailable ? '🛒 Add to Cart' : 'Currently Unavailable'}
                            </button>
                            <Link to="/cart" className="btn btn-outline btn-lg">View Cart</Link>
                        </div>

                        {item.category && (
                            <p style={{ marginTop: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                Category: <Link to={`/menu?category=${item.category._id}`} style={{ color: 'var(--color-primary-light)' }}>{item.category.name}</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
