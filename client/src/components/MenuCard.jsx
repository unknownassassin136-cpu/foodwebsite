import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function MenuCard({ item }) {
    const { addToCart } = useCart();

    const fallbackImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

    return (
        <div className="menu-card">
            <Link to={`/menu/${item._id}`} className="menu-card-image">
                <img
                    src={item.image || fallbackImg}
                    alt={item.name}
                    onError={(e) => { e.target.src = fallbackImg; }}
                />
                <div className="menu-card-badges">
                    {item.isVegetarian && <span className="badge badge-veg">🌱 Veg</span>}
                    {item.isSpicy && <span className="badge badge-spicy">🌶️ Spicy</span>}
                </div>
            </Link>
            <div className="menu-card-body">
                <Link to={`/menu/${item._id}`}>
                    <h3 className="menu-card-title">{item.name}</h3>
                </Link>
                <p className="menu-card-desc">{item.description}</p>
                <div className="menu-card-meta">
                    <span className="rating">★ {item.rating?.toFixed(1)}</span>
                    <span>({item.reviewCount} reviews)</span>
                    <span>⏱️ {item.preparationTime} min</span>
                </div>
                <div className="menu-card-footer">
                    <span className="menu-card-price">
                        <span className="currency">$</span>{item.price?.toFixed(2)}
                    </span>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => { e.preventDefault(); addToCart(item); }}
                        disabled={!item.isAvailable}
                    >
                        {item.isAvailable ? '+ Add' : 'Unavailable'}
                    </button>
                </div>
            </div>
        </div>
    );
}
