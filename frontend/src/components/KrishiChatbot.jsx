import React, { useState, useContext } from 'react';
import { MessageSquare, Mic, Send, Volume2, Globe } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './KrishiChatbot.css';

const KrishiChatbot = () => {
  const { getAuthHeader } = useContext(AuthContext);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am KRISHIAI. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ message: text, language })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      
      // Auto-speak response if Web Speech API is supported
      speakText(data.reply, language);
      
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Voice Integration (Web Speech API) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Odia' ? 'or-IN' : 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = (event) => console.error(event.error);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const speakText = (text, lang) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Best effort mapping to browser voices
    utterance.lang = lang === 'Hindi' ? 'hi-IN' : lang === 'Odia' ? 'or-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chatbot-container dashboard-card">
      <div className="chatbot-header">
        <h3><MessageSquare size={20} /> KRISHIAI Assistant</h3>
        <div className="language-selector">
          <Globe size={16} />
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Odia">Odia</option>
          </select>
        </div>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`}>
            {msg.text}
            {msg.sender === 'ai' && (
              <button className="speak-btn" onClick={() => speakText(msg.text, language)}>
                <Volume2 size={14} />
              </button>
            )}
          </div>
        ))}
        {isLoading && <div className="chat-message ai">Thinking...</div>}
      </div>
      
      <div className="chatbot-input">
        <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={startListening}>
          <Mic size={20} />
        </button>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask a farming question..."
        />
        <button className="send-btn" onClick={() => sendMessage(input)}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default KrishiChatbot;
