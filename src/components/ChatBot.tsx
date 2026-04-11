import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import type { ChatMessage } from '../types';

const getBotResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('product') || lower.includes('recommend')) {
    return "I'd recommend checking out our latest products! We have great deals on electronics, clothing, and more. Visit the Products page to browse our full catalog.";
  }
  if (lower.includes('order') || lower.includes('track')) {
    return "To track your order, please visit the Orders section in your account. If you need help, contact our support team with your order ID.";
  }
  if (lower.includes('cart') || lower.includes('checkout')) {
    return "You can view your cart by clicking the cart icon in the navbar. When ready, click 'Place Order' to complete your purchase!";
  }
  if (lower.includes('price') || lower.includes('discount') || lower.includes('sale')) {
    return "We offer competitive prices and regular discounts! Check our Products page for current deals and promotions.";
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! Welcome to ShopApp! I'm here to help. You can ask me about products, orders, or anything else!";
  }
  return "Thanks for reaching out! I'm here to help you with products, orders, cart management, and more. What can I assist you with today?";
};

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hi! I'm your ShopApp assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: getBotResponse(trimmed),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl flex flex-col" style={{ height: '420px' }}>
          <div className="flex items-center justify-between rounded-t-xl bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="font-medium text-sm">ShopApp Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-blue-200">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};
