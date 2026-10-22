import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import socket from '../../utils/socket';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Send, Refresh, Chat } from '@mui/icons-material';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const TicketChat = ({ complaintId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserId = user?.id || user?._id;

  const fetchMessages = async (showLoading = true) => {
    if (!complaintId) return;
    if (showLoading) setLoading(true);
    try {
      const res = await API.get(`/messages/${complaintId}`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load ticket messages:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
  }, [complaintId]);

  // Socket.io Real-Time Event Subscriptions
  useEffect(() => {
    if (!complaintId) return;

    socket.emit('join_ticket', complaintId);

    const handleReceiveMessage = (newMessage) => {
      const msgComplaintId = newMessage.complaint?._id || newMessage.complaint;
      if (msgComplaintId?.toString() === complaintId.toString()) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    };

    const handleUserTyping = (data) => {
      if (data.ticketId?.toString() === complaintId.toString() && data.senderId !== currentUserId) {
        setTypingUser(data.senderName || 'Someone');
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.ticketId?.toString() === complaintId.toString()) {
        setTypingUser('');
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_ticket', complaintId);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [complaintId, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (socket && complaintId) {
      socket.emit('typing', {
        ticketId: complaintId,
        senderId: currentUserId,
        senderName: user?.name,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { ticketId: complaintId });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || sending) return;

    const messageText = text.trim();
    setText('');
    setSending(true);

    if (socket && complaintId) {
      socket.emit('stop_typing', { ticketId: complaintId });
    }

    try {
      const res = await API.post(`/messages/${complaintId}`, { text: messageText });
      if (res.data?.success) {
        const newMessage = res.data.data;
        socket.emit('send_message', newMessage);
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
      setText(messageText);
    } finally {
      setSending(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Chip label="ADMIN" size="small" sx={{ bgcolor: 'rgba(244,63,94,0.18)', color: '#FB7185', fontWeight: 700, fontSize: '0.65rem', height: 20, border: '1px solid rgba(244,63,94,0.3)' }} />;
      case 'AGENT':
        return <Chip label="AGENT" size="small" sx={{ bgcolor: 'rgba(56,189,248,0.18)', color: '#38BDF8', fontWeight: 700, fontSize: '0.65rem', height: 20, border: '1px solid rgba(56,189,248,0.3)' }} />;
      default:
        return <Chip label="USER" size="small" sx={{ bgcolor: 'rgba(99,102,241,0.18)', color: '#818CF8', fontWeight: 700, fontSize: '0.65rem', height: 20, border: '1px solid rgba(99,102,241,0.3)' }} />;
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                width: 42,
                height: 42,
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Chat sx={{ fontSize: 22 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: '#F8FAFC' }}>
                Live Ticket Chat & Activity
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Real-time WebSocket communication
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Refresh conversation">
            <IconButton
              onClick={() => fetchMessages(false)}
              size="small"
              sx={{
                color: '#94A3B8',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { color: '#F8FAFC', bgcolor: 'rgba(99, 102, 241, 0.15)' },
              }}
            >
              <Refresh sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Message Thread Container */}
        <Box
          sx={{
            p: 3,
            maxHeight: 400,
            minHeight: 280,
            overflowY: 'auto',
            bgcolor: 'rgba(7, 10, 20, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={32} sx={{ color: '#818CF8' }} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>💬</Typography>
              <Typography variant="body1" fontWeight={700} color="text.secondary">
                No messages yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Send a message below to start communicating on this ticket.
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMe = senderId?.toString() === currentUserId?.toString();
              const senderName = msg.sender?.name || 'User';
              const senderRole = msg.sender?.role || 'USER';

              return (
                <Box
                  key={msg._id || msg.createdAt}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Sender Meta Info */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      px: 0.5,
                    }}
                  >
                    {!isMe && getRoleBadge(senderRole)}
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {isMe ? 'You' : senderName}
                    </Typography>
                    {isMe && getRoleBadge(senderRole)}
                  </Box>

                  {/* Message Bubble */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: isMe
                        ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                        : 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(12px)',
                      border: isMe ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: isMe
                        ? '0 8px 25px rgba(99, 102, 241, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                        : '0 4px 20px rgba(0, 0, 0, 0.3)',
                      color: '#FFFFFF',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontWeight: 500,
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Box>

                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, px: 0.5, fontSize: '0.7rem' }}
                  >
                    {formatDate(msg.createdAt)}
                  </Typography>
                </Box>
              );
            })
          )}

          {/* Typing Indicator Banner */}
          {typingUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#818CF8', fontStyle: 'italic', fontWeight: 600 }}>
                ✍️ {typingUser} is typing...
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Controls */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2.5,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message here..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sending}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!text.trim() || sending}
            endIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
            sx={{
              px: 3.5,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {sending ? 'Sending' : 'Send'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketChat;
