import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await authApi.getProfile();
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        const { token, user } = res.data;
        
        localStorage.setItem('token', token);
        setUser(user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await authApi.register(userData);
        const { token, user } = res.data;

        localStorage.setItem('token', token);
        setUser(user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
