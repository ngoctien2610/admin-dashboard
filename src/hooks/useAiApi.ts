import { useState, useCallback } from 'react';

const AI_BASE = 'http://localhost:3002/api/ai';

export const useAiSearch = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string, type = 'all') => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AI_BASE}/search?q=${encodeURIComponent(query)}&type=${type}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Tìm kiếm thất bại:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, loading, search };
};

export const useAiChat = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const chat = useCallback(async (message: string) => {
    if (!message.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch(`${AI_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      console.error('Chat thất bại:', err);
      setResponse('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { response, loading, chat };
};

export const useAiForecast = () => {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_BASE}/forecast`);
      const data = await res.json();
      setForecast(data);
    } catch (err) {
      console.error('Dự báo thất bại:', err);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { forecast, loading, fetchForecast };
};

export const useAiDescribe = () => {
  const [description, setDescription] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const describe = useCallback(async (product: any) => {
    if (!product || !product.name) return;
    setLoading(true);
    try {
      const res = await fetch(`${AI_BASE}/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      setDescription(data);
    } catch (err) {
      console.error('Tạo mô tả thất bại:', err);
      setDescription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { description, loading, describe };
};
