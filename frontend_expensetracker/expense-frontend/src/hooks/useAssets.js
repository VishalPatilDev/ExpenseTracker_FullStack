import { useCallback, useEffect, useState } from "react";
import { getAssets } from "@/api/assetsApi";

export function useAssets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAssets();

            // Your backend returns ApiResponse:
            // {
            //   message: "...",
            //   data: [...]
            // }
            const data = response.data?.data ?? response.data ?? [];

            setAssets(data);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to load assets"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    return {
        assets,
        loading,
        error,
        refetch: fetchAssets,
    };
}