import React, { createContext, useState, useContext } from 'react';
import Alert from '../components/Alert/Alert'; // Importas tu componente Alert existente
import './AlertContext.css'; // Opcional: CSS si necesitas

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert debe usarse dentro de AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const createToast = (options) => {
        const id = Date.now() + Math.random();
        const newAlert = { ...options, id };
        
        setAlerts(prev => [...prev, newAlert]);
        
        setTimeout(() => {
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        }, 1500);
    };

    const AlertContainer = () => (
        <div className="alert-container">
            {alerts.map((alert) => (
                <Alert 
                    key={alert.id} 
                    tipo={alert.tipo}
                >
                    {alert.text}
                </Alert>
            ))}
        </div>
    );

    return (
        <AlertContext.Provider value={{ createToast }}>
            {children}
            <AlertContainer />
        </AlertContext.Provider>
    );
};