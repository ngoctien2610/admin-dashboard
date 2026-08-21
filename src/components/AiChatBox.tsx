import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  createdAt: Date;
}

const suggestedQuestions = [
  "Doanh số hiện tại là bao nhiêu?",
  "Sản phẩm nào hết hàng?",
  "Tồn kho thấp cần xử lý?",
  "Đơn hàng hôm nay thế nào?",
];

const createWelcomeMessage = (): ChatMessage => ({
  id: Date.now(),
  role: "assistant",
  text: "Xin chào! Tôi có thể giúp bạn xem nhanh doanh số, đơn hàng và tình trạng tồn kho.",
  createdAt: new Date(),
});

const formatTime = (date: Date) =>
  date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export const AiChatBox: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([createWelcomeMessage()]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const conversationRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSend = async (question = message) => {
    const trimmedMessage = question.trim();
    if (!trimmedMessage || loading) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: trimmedMessage, createdAt: new Date() },
    ]);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3002/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Lỗi yêu cầu chat: ${response.status}`);
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", text: data.response, createdAt: new Date() },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể trả lời. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async (chatMessage: ChatMessage) => {
    await navigator.clipboard.writeText(chatMessage.text);
    setCopiedId(chatMessage.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  const clearConversation = () => {
    setMessages([createWelcomeMessage()]);
    setError("");
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Typography variant="subtitle1" fontWeight={800}>Trợ lý AI quản trị</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Hỏi dữ liệu vận hành và nhận câu trả lời ngay trong dashboard.
          </Typography>
        </Box>
        <Tooltip title="Xóa hội thoại">
          <span>
            <IconButton aria-label="Xóa hội thoại" onClick={clearConversation} disabled={loading} size="small">
              <DeleteSweepRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box ref={conversationRef} sx={{ mt: 2, maxHeight: 280, overflowY: "auto", pr: 0.5 }}>
        <Stack spacing={1.5}>
          {messages.map((chatMessage) => (
            <Box key={chatMessage.id} sx={{ display: "flex", justifyContent: chatMessage.role === "user" ? "flex-end" : "flex-start" }}>
              <Box sx={{ maxWidth: "88%", p: 1.5, borderRadius: 2, bgcolor: chatMessage.role === "user" ? "primary.main" : "action.hover", color: chatMessage.role === "user" ? "primary.contrastText" : "text.primary" }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{chatMessage.text}</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ mt: 0.75 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>{formatTime(chatMessage.createdAt)}</Typography>
                  {chatMessage.role === "assistant" && (
                    <Tooltip title={copiedId === chatMessage.id ? "Đã sao chép" : "Sao chép câu trả lời"}>
                      <IconButton size="small" aria-label="Sao chép câu trả lời" onClick={() => void copyResponse(chatMessage)} sx={{ color: "inherit", p: 0.25 }}>
                        <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            </Box>
          ))}
          {loading && <Stack direction="row" alignItems="center" gap={1} sx={{ px: 1 }}><CircularProgress size={18} /><Typography variant="caption" color="text.secondary">Đang phân tích dữ liệu...</Typography></Stack>}
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        {suggestedQuestions.map((question) => <Chip key={question} label={question} size="small" variant="outlined" onClick={() => void handleSend(question)} disabled={loading} />)}
      </Stack>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
          }
        }}
        placeholder="Nhập câu hỏi... (Enter để gửi, Shift + Enter xuống dòng)"
        variant="outlined"
      />
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
        <Button variant="contained" endIcon={<SendRoundedIcon />} onClick={() => void handleSend()} disabled={loading || !message.trim()}>
          Gửi câu hỏi
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
    </Paper>
  );
};
