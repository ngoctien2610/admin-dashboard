import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Suggestion {
  label: string;
  meta: string;
  type: string;
}

interface AiSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: Suggestion) => void;
  type?: 'all' | 'users' | 'products' | 'orders';
  placeholder?: string;
  label?: string;
}

export const AiSearchBox: React.FC<AiSearchBoxProps> = ({
  value,
  onChange,
  onSelect,
  type = 'all',
  placeholder = 'Tìm kiếm người dùng, sản phẩm hoặc đơn hàng...',
  label = 'Tìm kiếm thông minh',
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setError('');
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`http://localhost:3002/api/ai/search?q=${encodeURIComponent(value)}&type=${type}`);
        if (!response.ok) {
          throw new Error(`Không thể tải đề xuất: ${response.status}`);
        }

        const data = await response.json();
        setSuggestions(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải đề xuất');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [value, type]);

  const handleSelect = (item: Suggestion) => {
    onChange(item.label);
    setSuggestions([]);
    if (onSelect) onSelect(item);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <TextField
        fullWidth
        variant="filled"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mt: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Đang tìm đề xuất...</Typography>
          </Box>
        )}

        {!loading && error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <Stack spacing={1}>
            {suggestions.map((item, index) => (
              <Paper
                key={`${item.label}-${index}`}
                onClick={() => handleSelect(item)}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Typography variant="subtitle2">{item.label}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip
                    label={
                      item.type === 'users'
                        ? 'Người dùng'
                        : item.type === 'products'
                        ? 'Sản phẩm'
                        : item.type === 'orders'
                        ? 'Đơn hàng'
                        : item.type
                    }
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.meta}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {!loading && !error && value.trim().length >= 2 && suggestions.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Không tìm thấy đề xuất nào. Thử từ khóa khác.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
