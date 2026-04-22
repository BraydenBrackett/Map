import { useState, useEffect } from "react";
import { fetchCountries, fetchRelationships } from "../api";
import type { NetworkData } from "../types";

export function useNetworkData(): NetworkData & { loading: boolean; error: string | null } {
  const [countries, setCountries] = useState<NetworkData["countries"]>([]);
  const [relationships, setRelationships] = useState<NetworkData["relationships"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCountries(), fetchRelationships()])
      .then(([c, r]) => {
        setCountries(c);
        setRelationships(r);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  return { countries, relationships, loading, error };
}
