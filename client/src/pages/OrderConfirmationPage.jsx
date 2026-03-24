import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../api/services';
import { useSocket } from '../context/SocketContext';

const statusLabels = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

const statusSteps = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];

export default function OrderConfirmationPage() {
    const { id } = useParams();
    const { socket, connected } = useSocket() || {};
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderService.getOne(id)
            .then(res => setOrder(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    // Real-time status updates
    useEffect(() => {
        if (!socket || !connected || !id) return;
        socket.emit('order:join', { orderId: id });

        const handleStatusUpdate = (data) => {
            if (data.orderId === id || data.orderId?.toString() === id) {
                setOrder(prev => prev ? { ...prev, status: data.status } : prev);
            }
        };
        socket.on('order:statusUpdate', handleStatusUpdate);
        return () => socket.off('order:statusUpdate', handleStatusUpdate);
    }, [socket, connected, id]);

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
    if (!order) return <div className="empty-state"><h3>Order not found</h3></div>;

    const currentStep = statusSteps.indexOf(order.status);

    return (
        <div className="confirmation-page">
            <div className="container">
                <div className="confirmation-icon">✓</div>
                <h1 className="heading-display" style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>
                    {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Placed Successfully!'}
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                    Order ID: <strong style={{ color: 'var(--color-text)' }}>#{order._id.slice(-8).toUpperCase()}</strong>
                </p>

                {/* Status Timeline */}
                {order.status !== 'cancelled' && (
                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: '4px', margin: 'var(--space-xl) auto',
                        maxWidth: '600px', padding: '0 var(--space-lg)'
                    }}>
                        {statusSteps.map((step, i) => (
                            <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{
                                    height: '4px', borderRadius: '2px', marginBottom: '8px',
                                    background: i <= currentStep ? 'var(--color-primary)' : 'var(--color-border)'
                                }} />
                                <span style={{
                                    fontSize: '0.7rem', color: i <= currentStep ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    fontWeight: i === currentStep ? 700 : 400
                                }}>
                                    {statusLabels[step]}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Order Details */}
                <div className="confirmation-details">
                    <div className="order-summary" style={{ position: 'static' }}>
                        <h3>Order Details</h3>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                                <span>{item.name} × {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-md)' }}>
                            <div className="summary-row text-muted"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                            <div className="summary-row text-muted"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
                            <div className="summary-row text-muted">
                                <span>Delivery</span>
                                <span>{order.deliveryFee === 0 ? <span className="free">FREE</span> : `$${order.deliveryFee.toFixed(2)}`}</span>
                            </div>
                            <div className="summary-row total"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                        <div className="checkout-section">
                            <h3>📍 Delivery Address</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                {order.deliveryAddress.street}<br />
                                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                            </p>
                        </div>
                        <div className="checkout-section">
                            <h3>💳 Payment</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                {order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Card on Delivery' : 'UPI Payment'}
                            </p>
                        </div>
                    </div>

                    {order.estimatedDelivery && (
                        <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', color: 'var(--color-text-secondary)' }}>
                            ⏱️ Estimated delivery: <strong style={{ color: 'var(--color-text)' }}>
                                {new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </strong>
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                    <Link to="/menu" className="btn btn-primary">Order More</Link>
                    <Link to="/profile" className="btn btn-outline">View All Orders</Link>
                </div>
            </div>
        </div>
    );
}
