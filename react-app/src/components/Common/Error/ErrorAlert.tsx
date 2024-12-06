import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
    type?: 'success' | 'error' | 'warning';
    duration?: number;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
    message,
    type = 'error',
    duration = 5000
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setIsVisible(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration]);

    if (!isVisible) return null;

    const alertStyles = {
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        error: 'bg-rose-50 text-rose-800 border-rose-200',
        warning: 'bg-amber-50 text-amber-800 border-amber-200'
    };

    const IconComponent = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertCircle
    }[type];

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
            <div className={`flex items-center p-4 rounded-lg border ${alertStyles[type]}`}>
                <IconComponent className="w-5 h-5 mr-3" />
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-auto p-1 hover:opacity-70 transition-opacity"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ErrorAlert;