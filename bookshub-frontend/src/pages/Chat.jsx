import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "other", text: "Hi! Looking for a book?" },
    { sender: "me", text: "Yes, I need Atomic Habits." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: "me", text: input }]);
      setInput("");
    }
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Chat
      </Typography>

      <Paper sx={{ p: 2, height: "60vh", overflowY: "auto", mb: 2 }}>
        <Stack spacing={2}>
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                bgcolor: msg.sender === "me" ? "primary.main" : "grey.300",
                color: msg.sender === "me" ? "white" : "black",
                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: "70%",
              }}
            >
              {msg.text}
            </Box>
          ))}
        </Stack>
      </Paper>

      <Box display="flex">
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Box>
    </Container>
  );
}
