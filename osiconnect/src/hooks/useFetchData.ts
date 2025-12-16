// src/hooks/useFetchData.ts
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useFetchData<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await fetchFn();
        setData(result);
      } catch (error) {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, deps);

  return { data, loading };
}
