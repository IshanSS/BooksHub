import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  IconButton,
  Paper,
  Stack,
  MenuItem,
  Select,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5010";

export default function Chat() {
  // Get my userId from token (decode or store in context)
  // For demo, you may hardcode or fetch from profile API
  const myUserId = localStorage.getItem("userId");
  const [allUsers, setAllUsers] = useState([]); // All users except me
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch all users except me on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5010/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        }
      } catch (err) {}
    };
    fetchUsers();
  }, []);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5010/api/chat/messages?userId=${selectedUser}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {}
      setLoading(false);
    };
    fetchMessages();
  }, [selectedUser]);

  // Socket.IO setup
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    // Register userId for targeted messages
    if (myUserId) {
      socketRef.current.emit("register", myUserId);
    }
    socketRef.current.on("receiveMessage", (msg) => {
      // Only add if message is for this conversation
      if (
        (msg.from === selectedUser || msg.to === selectedUser) &&
        (msg.from === myUserId || msg.to === myUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [selectedUser, myUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return;
    setSending(true);
    const token = localStorage.getItem("token");
    const msgData = {
      to: selectedUser,
      content: input,
    };
    // Optimistically add message to UI
    setMessages((prev) => [
      ...prev,
      {
        from: myUserId,
        to: selectedUser,
        content: input,
        fromName: "Me",
        sentAt: new Date().toISOString(),
      },
    ]);
    setInput("");
    try {
      // Send via REST for persistence and real-time (backend will emit)
      await fetch("http://localhost:5010/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(msgData),
      });
    } catch (err) {}
    setSending(false);
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Chat
      </Typography>

      {/* User selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1">Select a user to chat with:</Typography>
        <Select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          displayEmpty
          sx={{ minWidth: 220, mt: 1 }}
        >
          <MenuItem value="" disabled>
            -- Select User --
          </MenuItem>
          {allUsers.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Paper sx={{ p: 2, height: "60vh", overflowY: "auto", mb: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: msg.from === myUserId ? "flex-end" : "flex-start",
                  bgcolor: msg.from === myUserId ? "primary.main" : "grey.200",
                  color: msg.from === myUserId ? "white" : "black",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "70%",
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {msg.from === myUserId
                    ? "You"
                    : allUsers.find((u) => u._id === msg.from)?.name ||
                      msg.fromName ||
                      "Other"}
                </Typography>
                <Typography variant="body1">{msg.content}</Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Paper>

      <Box display="flex">
        <TextField
          fullWidth
          placeholder={
            selectedUser ? "Type a message..." : "Select a user to chat with"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={!selectedUser || sending}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!selectedUser || sending}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Container>
  );
}
