import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check for saved token & fetch profile
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await authService.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (name, email, password, phone) => {
        const { data } = await authService.register({ name, email, password, phone });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        const { data } = await authService.updateProfile(profileData);
        // Keep existing token
        const updatedUser = { ...data, token: localStorage.getItem('token') };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}
