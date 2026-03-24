import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuService, categoryService } from '../api/services';
import MenuCard from '../components/MenuCard';

export default function MenuPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');

    useEffect(() => {
        categoryService.getAll().then(res => setCategories(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const params = {};
                if (activeCategory) params.category = activeCategory;
                if (search) params.search = search;
                const res = await menuService.getItems(params);
                setItems(res.data.items);
            } catch (err) {
                console.error('Failed to load menu:', err);
            } finally {
                setLoading(false);
            }
        };
        const debounce = setTimeout(fetchItems, search ? 300 : 0);
        return () => clearTimeout(debounce);
    }, [activeCategory, search]);

    const handleCategoryClick = (catId) => {
        const newCat = activeCategory === catId ? '' : catId;
        setActiveCategory(newCat);
        if (newCat) {
            setSearchParams({ category: newCat });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <a href="/">Home</a> <span>/</span> <span>Menu</span>
                    </div>
                    <h1>Our <span className="text-gradient">Menu</span></h1>
                </div>
            </div>

            <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
                {/* Search */}
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search dishes, ingredients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Chips */}
                <div className="category-chips">
                    <button
                        className={`category-chip ${!activeCategory ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('')}
                    >
                        All Items
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            className={`category-chip ${activeCategory === cat._id ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(cat._id)}
                        >
                            {cat.image} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="spinner-container"><div className="spinner"></div></div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🍽️</div>
                        <h3>No items found</h3>
                        <p>Try adjusting your search or category filters</p>
                    </div>
                ) : (
                    <div className="menu-grid">
                        {items.map((item) => (
                            <MenuCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
