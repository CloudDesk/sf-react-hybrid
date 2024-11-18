import React, { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AppContextType {
    appConfig: any;
    rootElement: any;
}

export const AppContext = createContext<AppContextType | null>(null);

interface StoreType {
    appConfig?: any;
    envConfig?: any;
    orgInfo?: any;
    userInfo?: any;
    ldFlags?: any;
}

const _store: StoreType = {};
export const store = new Proxy(_store, { set() { return true; } });

interface AppContextProviderProps {
    children: React.ReactNode;
    appConfig: any;
    envConfig: any;
    rootElement: any;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, appConfig, envConfig, rootElement }) => {
    const navigate = useNavigate();
    const [isAppInitialized, setIsAppInitialized] = useState(false);
    const [isAppRenderedOnce, setIsAppRenderedOnce] = useState(false);

    const loadApp = useCallback(async () => {
        setIsAppInitialized(false);
        _store.appConfig = Object.freeze(appConfig);
        setIsAppInitialized(true);
    }, [appConfig]);

    useEffect(() => {
        if (isAppInitialized && !isAppRenderedOnce) {
            setIsAppRenderedOnce(true);
        }
    }, [isAppInitialized, isAppRenderedOnce, appConfig, navigate]);

    useEffect(() => {
        loadApp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        _store.appConfig = Object.freeze({ ..._store?.appConfig, ...appConfig, ...envConfig });
        _store.envConfig = Object.freeze(envConfig);
    }, [appConfig, envConfig]);

    return (
        <AppContext.Provider value={{ appConfig, rootElement }}>
            {isAppInitialized ? (
                children
            ) : (
                <div className="edc-login-screen">
                    <div>Loading...</div>
                </div>
            )}
        </AppContext.Provider>
    );
};
