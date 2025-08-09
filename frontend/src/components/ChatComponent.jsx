import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { MessageCircle, Send, User, Car } from 'lucide-react';

const ChatComponent = ({ ride, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // API Base URL
  const API_BASE = window.location.hostname === 'localhost' 
    ? '/api' 
    : 'https://JonathanOliveira.pythonanywhere.com/api';

  useEffect(() => {
    if (ride) {
      fetchMessages();
      // Atualizar mensagens a cada 5 segundos
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [ride]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/rides/${ride.id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rides/${ride.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: currentUser.id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherUser = () => {
    if (currentUser.user_type === 'passenger') {
      return ride.driver;
    } else {
      return ride.passenger;
    }
  };

  const otherUser = getOtherUser();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardTitle>
        <CardDescription>
          Conversando com {otherUser?.username || 'Usuário'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Área de Mensagens */}
        <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-2 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center text-sm">
              Nenhuma mensagem ainda. Inicie a conversa!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender_id === currentUser.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {message.sender.user_type === 'driver' ? (
                      <Car className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.sender.username}
                    </span>
                  </div>
                  <p>{message.content}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Área de Envio */}
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button 
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          💡 As mensagens são processadas via GitHub Actions
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatComponent;

