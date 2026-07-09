import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Agora usamos a chave 'scorefy_user' para bater com o App.jsx
        const storedUser = localStorage.getItem('scorefy_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Erro ao ler usuário", e);
                localStorage.removeItem('scorefy_user'); 
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        // Padronizado para 'scorefy_user'
        localStorage.setItem('scorefy_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('scorefy_user');
        window.location.href = '/login'; 
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);