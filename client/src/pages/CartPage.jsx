import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, clearCart, subtotal, tax, deliveryFee, total } = useCart();

    const fallbackImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

    if (items.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-state">
                        <div className="icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some delicious items from our menu!</p>
                        <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="page-header" style={{ border: 'none', padding: '0 0 var(--space-lg)' }}>
                    <div className="breadcrumb">
                        <Link to="/">Home</Link> <span>/</span> <span>Cart</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Your <span className="text-gradient">Cart</span></h1>
                        <button className="btn btn-ghost btn-sm" onClick={clearCart}>🗑️ Clear All</button>
                    </div>
                </div>

                <div className="cart-layout">
                    {/* Items */}
                    <div>
                        {items.map((item) => (
                            <div key={item._id} className="cart-item">
                                <img
                                    className="cart-item-image"
                                    src={item.image || fallbackImg}
                                    alt={item.name}
                                    onError={(e) => { e.target.src = fallbackImg; }}
                                />
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.name}</div>
                                    <div className="cart-item-price">${item.price?.toFixed(2)}</div>
                                    <div className="cart-item-controls">
                                        <button className="quantity-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                                        <span className="quantity-value">{item.quantity}</span>
                                        <button className="quantity-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button className="cart-item-remove" onClick={() => removeFromCart(item._id)}>✕ Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-row text-muted">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row text-muted">
                            <span>Tax (8%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row text-muted">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee === 0 ? <span className="free">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
                        </div>
                        {deliveryFee > 0 && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--color-success)', marginTop: '4px' }}>
                                Add ${(30 - subtotal).toFixed(2)} more for free delivery!
                            </p>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <Link to="/checkout" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-md)' }}>
                            Proceed to Checkout →
                        </Link>
                        <Link to="/menu" className="btn btn-ghost btn-full" style={{ marginTop: 'var(--space-sm)' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
