import { useState, useCallback, useEffect } from 'react';

const API_BASE = 'http://localhost:3002/api';

export const useApi = (url, method = 'GET') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (body = null) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) options.body = JSON.stringify(body);
      
      const res = await fetch(`${API_BASE}${url}`, options);
      if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
      const result = await res.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Lỗi API:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  return { data, loading, error, execute };
};

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${url}`);
      if (!res.ok) throw new Error(`Không thể tải dữ liệu: ${res.status}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};
