import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';

export const AiChatBox: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3002/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`Lỗi yêu cầu chat: ${res.status}`);
      const data = await res.json();
      setResponse(data.response);
    } catch (err: any) {
      setError(err.message || 'Không thể trả lời.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 240 }}>
      <Typography variant="subtitle1" gutterBottom>
        Chatbot hỗ trợ quản trị
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hỏi nhanh thông tin như “đơn hàng hôm nay”, “sản phẩm hết hàng”, hoặc “doanh số hiện tại”.
      </Typography>

      <Stack spacing={2}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập câu hỏi của bạn..."
          variant="filled"
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="contained" onClick={handleSend} disabled={loading || !message.trim()}>
            Gửi hỏi
          </Button>
          {loading && <CircularProgress size={24} />}
        </Box>
        {response && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Trả lời:
            </Typography>
            <Typography variant="body2">{response}</Typography>
          </Paper>
        )}
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};
