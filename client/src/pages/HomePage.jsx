import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuService, categoryService } from '../api/services';
import MenuCard from '../components/MenuCard';

export default function HomePage() {
    const [featured, setFeatured] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menuRes, catRes] = await Promise.all([
                    menuService.getItems({ limit: 6, sort: 'rating' }),
                    categoryService.getAll()
                ]);
                setFeatured(menuRes.data.items);
                setCategories(catRes.data);
            } catch (err) {
                console.error('Failed to load homepage data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Delicious Food,<br /><span className="text-gradient">Delivered Fast</span></h1>
                        <p>
                            Fresh ingredients, expert chefs, and lightning-fast delivery.
                            Explore our diverse menu and treat yourself to something amazing today.
                        </p>
                        <div className="hero-actions">
                            <Link to="/menu" className="btn btn-primary btn-lg">Explore Menu →</Link>
                            <Link to="/register" className="btn btn-outline btn-lg">Join Free</Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <strong>18+</strong>
                                <span>Dishes</span>
                            </div>
                            <div className="hero-stat">
                                <strong>25 min</strong>
                                <span>Avg. Delivery</span>
                            </div>
                            <div className="hero-stat">
                                <strong>4.8 ★</strong>
                                <span>Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Browse <span className="text-gradient">Categories</span></h2>
                        <p>Find your favorite cuisine</p>
                    </div>
                    {!loading && (
                        <div className="category-showcase">
                            {categories.map((cat) => (
                                <Link to={`/menu?category=${cat._id}`} key={cat._id} className="category-card">
                                    <div className="emoji">{cat.image}</div>
                                    <h3>{cat.name}</h3>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Items */}
            <section className="section" style={{ background: 'var(--color-bg-surface)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Top <span className="text-gradient">Rated</span></h2>
                        <p>Our most loved dishes, chosen by customers like you</p>
                    </div>
                    {loading ? (
                        <div className="spinner-container"><div className="spinner"></div></div>
                    ) : (
                        <div className="featured-grid">
                            {featured.map((item) => (
                                <MenuCard key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                        <Link to="/menu" className="btn btn-outline">View Full Menu →</Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="heading-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 'var(--space-md)' }}>
                        Ready to Order?
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto var(--space-lg)' }}>
                        Join thousands of happy customers and enjoy restaurant-quality food from the comfort of your home.
                    </p>
                    <Link to="/menu" className="btn btn-primary btn-lg">Order Now 🍽️</Link>
                </div>
            </section>
        </div>
    );
}
