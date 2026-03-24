import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

const statusLabels = {
    placed: 'Order Placed',
    confirmed: 'Order Confirmed',
    preparing: 'Being Prepared',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Order Cancelled'
};

const statusEmojis = {
    placed: '📋', confirmed: '✅', preparing: '👨‍🍳',
    'out-for-delivery': '🚗', delivered: '🎉', cancelled: '❌'
};

export default function NotificationToast() {
    const { notifications, dismissNotification } = useSocket() || {};

    if (!notifications || notifications.length === 0) return null;

    return (
        <div className="toast-container">
            {notifications.map((n) => (
                <div key={n.id} className={`toast toast-${n.type === 'order' ? n.status : 'info'}`}>
                    <div className="toast-content">
                        {n.type === 'order' ? (
                            <>
                                <span className="toast-emoji">{statusEmojis[n.status] || '📦'}</span>
                                <div>
                                    <strong>{statusLabels[n.status] || n.status}</strong>
                                    <p>Order #{n.orderId?.toString().slice(-8).toUpperCase()}</p>
                                </div>
                            </>
                        ) : n.type === 'newOrder' ? (
                            <>
                                <span className="toast-emoji">🔔</span>
                                <div>
                                    <strong>New Order!</strong>
                                    <p>From {n.order?.userName || 'a customer'} — ${n.order?.total?.toFixed(2)}</p>
                                </div>
                            </>
                        ) : null}
                    </div>
                    <button className="toast-close" onClick={() => dismissNotification(n.id)}>✕</button>
                </div>
            ))}
        </div>
    );
}
