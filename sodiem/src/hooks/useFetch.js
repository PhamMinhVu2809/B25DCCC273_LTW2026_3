import { useEffect, useState } from 'react';

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Yêu cầu dữ liệu thất bại: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
