import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

// Error types with corresponding styles and icons
const errorTypes = {
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600'
    },
    error: {
        icon: X,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
        iconColor: 'text-red-600'
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600'
    }
};

// Props type for the ErrorAlert component
interface ErrorAlertProps {
    message: string;
    type?: keyof typeof errorTypes;
    onClose?: () => void;
    duration?: number;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
    message,
    type = 'error',
    onClose,
    duration = 0
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const {
        icon: ErrorIcon,
        bgColor,
        borderColor,
        textColor,
        iconColor
    } = errorTypes[type];

    // Modify useEffect to reset visibility and timer when message changes
    useEffect(() => {
        setIsVisible(true);

        let timer: NodeJS.Timeout;
        if (duration > 0) {
            timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [message, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    return (
        <div
            className={`
                absolute w-full left-0 right-0
                flex items-center justify-between 
                p-4 border 
                shadow-md transition-all duration-300 ease-in-out 
                animate-slide-in-right
                ${bgColor} ${borderColor} ${textColor}
            `}
        >
            <div className="flex items-center space-x-3">
                <ErrorIcon className={`w-6 h-6 ${iconColor}`} />
                <p className="text-sm font-medium">{message}</p>
            </div>
            <button
                onClick={handleClose}
                className={`
                    hover:bg-opacity-10 rounded-full p-1 
                    transition-colors duration-200
                    ${textColor} ${iconColor}
                `}
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

// Example usage component
export const ErrorAlertDemo = () => {
    const [alerts, setAlerts] = useState<{
        id: number,
        message: string,
        type: keyof typeof errorTypes
    }[]>([]);

    const triggerAlert = (type: keyof typeof errorTypes) => {
        const newAlert = {
            id: Date.now(),
            message: `This is a ${type} alert!`,
            type
        };
        setAlerts(prev => [...prev, newAlert]);
    };

    const removeAlert = (id: number) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    return (
        <div className="p-6 space-y-4 relative">
            <div className="flex space-x-2 mb-4">
                {Object.keys(errorTypes).map(type => (
                    <button
                        key={type}
                        onClick={() => triggerAlert(type as keyof typeof errorTypes)}
                        className={`
                            px-4 py-2 rounded text-white capitalize
                            ${type === 'warning' ? 'bg-yellow-500' :
                                type === 'error' ? 'bg-red-500' :
                                    'bg-blue-500'}
                        `}
                    >
                        {type} Alert
                    </button>
                ))}
            </div>
            <div className="fixed top-4 right-4 z-50 w-64">
                {alerts.map(alert => (
                    <ErrorAlert
                        key={alert.id}
                        message={alert.message}
                        type={alert.type}
                        duration={3000}
                        onClose={() => removeAlert(alert.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ErrorAlert;