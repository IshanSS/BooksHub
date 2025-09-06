import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  IconButton,
  Paper,
  Stack,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5010";

export default function Chat() {
  const myUserId = String(localStorage.getItem("userId") || "");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch all users except me
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

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5010/api/chat/messages?userId=${selectedUser._id}`,
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

  // Setup socket
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    if (myUserId) {
      socketRef.current.emit("register", myUserId);
    }
    socketRef.current.on("receiveMessage", (msg) => {
      if (
        (msg.from === selectedUser?._id || msg.to === selectedUser?._id) &&
        (msg.from === myUserId || msg.to === myUserId)
      ) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              String(m.from) === String(msg.from) &&
              String(m.to) === String(msg.to) &&
              m.content === msg.content &&
              new Date(m.sentAt).getTime() === new Date(msg.sentAt).getTime()
          );
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedUser, myUserId]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return;
    setSending(true);
    const token = localStorage.getItem("token");
    const msgData = { to: selectedUser._id, content: input };
    setInput("");
    try {
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

  // Format timestamps
  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <Container sx={{ py: { xs: 3, md: 5 }, height: "80vh" }}>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          height: "100%",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Sidebar: User list */}
        <Box
          sx={{
            width: { xs: "40%", md: "25%" },
            borderRight: "1px solid",
            borderColor: "grey.300",
            bgcolor: "grey.100",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ p: 2 }}>
            Users
          </Typography>
          <Divider />
          <List>
            {allUsers.map((user) => (
              <ListItemButton
                key={user._id}
                selected={selectedUser?._id === user._id}
                onClick={() => setSelectedUser(user)}
              >
                <ListItemText
                  primary={user.name}
                  secondary={user.email}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Chat area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Chat header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Typography variant="h6">
              {selectedUser ? selectedUser.name : "Select a user to chat"}
            </Typography>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              bgcolor: "grey.50",
            }}
          >
            {loading ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2}>
                {messages.map((msg, i) => {
                  const isMine = String(msg.from) === String(myUserId);
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1.2,
                          borderRadius: 3,
                          maxWidth: "70%",
                          bgcolor: isMine ? "primary.main" : "grey.200",
                          color: isMine ? "white" : "black",
                          boxShadow: 1,
                        }}
                      >
                        <Typography variant="body1">{msg.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            textAlign: "right",
                            opacity: 0.7,
                          }}
                        >
                          {formatTime(msg.sentAt)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </Box>

          {/* Input */}
          {selectedUser && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderTop: "1px solid",
                borderColor: "grey.200",
                bgcolor: "white",
              }}
            >
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={sending}
                size="small"
                sx={{ mr: 1 }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={sending}
              >
                <SendIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
