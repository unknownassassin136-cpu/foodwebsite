import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Persist cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = useCallback((item) => {
        setItems(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { _id: item._id, name: item.name, price: item.price, image: item.image, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((itemId) => {
        setItems(prev => prev.filter(i => i._id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId, quantity) => {
        if (quantity < 1) {
            setItems(prev => prev.filter(i => i._id !== itemId));
            return;
        }
        setItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const deliveryFee = subtotal >= 30 ? 0 : (items.length > 0 ? 4.99 : 0);
    const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity, clearCart,
            itemCount, subtotal, tax, deliveryFee, total
        }}>
            {children}
        </CartContext.Provider>
    );
}
