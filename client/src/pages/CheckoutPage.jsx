import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../api/services';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, subtotal, tax, deliveryFee, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

    const [address, setAddress] = useState({
        street: defaultAddress?.street || '',
        city: defaultAddress?.city || '',
        state: defaultAddress?.state || '',
        zipCode: defaultAddress?.zipCode || ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');

    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="empty-state">
                        <div className="icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add items before checking out</p>
                        <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!address.street || !address.city || !address.state || !address.zipCode) {
            setError('Please fill in your complete delivery address');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const orderItems = items.map(i => ({
                menuItem: i._id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image
            }));

            const { data } = await orderService.create({
                items: orderItems,
                deliveryAddress: address,
                paymentMethod,
                notes
            });

            clearCart();
            navigate(`/order-confirmation/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="page-header" style={{ border: 'none', padding: '0 0 var(--space-lg)' }}>
                    <div className="breadcrumb">
                        <Link to="/">Home</Link> <span>/</span>
                        <Link to="/cart">Cart</Link> <span>/</span>
                        <span>Checkout</span>
                    </div>
                    <h1>Checkout</h1>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="checkout-layout">
                        <div>
                            {/* Delivery Address */}
                            <div className="checkout-section">
                                <h3>📍 Delivery Address</h3>
                                <div className="form-group">
                                    <label className="form-label">Street Address</label>
                                    <input className="form-input" type="text" value={address.street}
                                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                        placeholder="123 Main Street, Apt 4B" required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input className="form-input" type="text" value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            placeholder="New York" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input className="form-input" type="text" value={address.state}
                                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                            placeholder="NY" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Zip Code</label>
                                    <input className="form-input" type="text" value={address.zipCode}
                                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                        placeholder="10001" required style={{ maxWidth: '200px' }} />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="checkout-section">
                                <h3>💳 Payment Method</h3>
                                {['cash', 'card', 'upi'].map(method => (
                                    <label key={method} className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}>
                                        <input type="radio" name="payment" value={method}
                                            checked={paymentMethod === method}
                                            onChange={() => setPaymentMethod(method)} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {method === 'cash' && '💵 Cash on Delivery'}
                                                {method === 'card' && '💳 Card on Delivery'}
                                                {method === 'upi' && '📱 UPI Payment'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                {method === 'cash' && 'Pay with cash when your order arrives'}
                                                {method === 'card' && 'Pay with debit/credit card on delivery'}
                                                {method === 'upi' && 'Pay via UPI apps (Google Pay, PhonePe, etc.)'}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Notes */}
                            <div className="checkout-section">
                                <h3>📝 Special Instructions</h3>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special requests? (e.g., extra spicy, no onions...)"
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            {items.map(item => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-md)' }}>
                                <div className="summary-row text-muted"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="summary-row text-muted"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                                <div className="summary-row text-muted">
                                    <span>Delivery</span>
                                    <span>{deliveryFee === 0 ? <span className="free">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
                                </div>
                                <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}
                                style={{ marginTop: 'var(--space-md)' }}>
                                {loading ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
