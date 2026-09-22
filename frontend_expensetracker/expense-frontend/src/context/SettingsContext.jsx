import { createContext, useContext, useState, useCallback } from "react";

import {
    getCategories,
    getContacts,
    getBanks,
    getAssetCategories,
} from "@/api/settingsApi";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [banks, setBanks] = useState([]);
    const [assetCategories, setAssetCategories] = useState([]);

    const [loaded, setLoaded] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const [
                catRes,
                conRes,
                bankRes,
                assetCatRes,
            ] = await Promise.all([
                getCategories(),
                getContacts(),
                getBanks(),
                getAssetCategories(),
            ]);

            setCategories(catRes.data?.data ?? catRes.data ?? []);
            setContacts(conRes.data?.data ?? conRes.data ?? []);
            setBanks(bankRes.data?.data ?? bankRes.data ?? []);
            setAssetCategories(
                assetCatRes.data?.data ?? assetCatRes.data ?? []
            );

            setLoaded(true);
        } catch (err) {
            console.error("Failed to load settings data", err);
        }
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                categories,
                contacts,
                banks,
                assetCategories,
                loaded,
                refresh,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);

    if (!ctx) {
        throw new Error(
            "useSettings must be used inside SettingsProvider"
        );
    }

    return ctx;
}

