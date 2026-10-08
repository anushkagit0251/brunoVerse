import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, AlertCircle } from 'lucide-react';

export default function AskAiModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am BrunoVerse AI Assistant (Preview). Ask me about pet nutrition, general behavior tips, or rescue first-aid. Note: Always consult a licensed veterinarian for medical emergencies!"
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    // Responsive helpful guidance
    setTimeout(() => {
      let reply = "Thank you for asking! For specific medical diagnosis, please use the 'Book Veterinary Consultation' action to reach a verified vet like Dr. Sharma. For emergency rescues, tap 'Report an Animal in Need'.";
      if (userMsg.toLowerCase().includes('food') || userMsg.toLowerCase().includes('diet')) {
        reply = "Tip: Make sure dogs avoid chocolate, onions, grapes, and xylitol. Provide fresh water throughout the day!";
      } else if (userMsg.toLowerCase().includes('vaccine') || userMsg.toLowerCase().includes('rabies')) {
        reply = "Rabies vaccines are crucial for all pets and stray animals. Check your pet's reminder tab to track booster due dates!";
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--accent-peach)', color: 'var(--accent-peach-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>BrunoVerse AI Assistant</h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI-Powered Care & Guidance Preview</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Chat message box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '280px', overflowY: 'auto', padding: '12px', background: '#FAFCFA', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          {messages.map((m, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                gap: '8px',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.sender === 'ai' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} />
                </div>
              )}
              <div style={{
                padding: '10px 14px',
                borderRadius: '14px',
                fontSize: '13px',
                lineHeight: 1.4,
                background: m.sender === 'user' ? 'var(--primary)' : '#FFFFFF',
                color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-main)',
                boxShadow: 'var(--shadow-subtle)',
                border: m.sender === 'ai' ? '1px solid var(--border-light)' : 'none'
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ask a question about your pet's care..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
