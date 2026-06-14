import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquareCode, Send, X, ArrowRight, User } from 'lucide-react';
import { processChatQuery } from '../utils/aiSimulator';

export default function AiWidget({ customers, onTriggerAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: "Hello! I am your XENO AI Copilot. 👋\n\nI can help you build target segments, write marketing copy, or analyze shopper spend. Select a question below or write your own!" 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Who are my top spenders in Bangalore?",
    "Create a segment of customers who bought 3+ times",
    "Draft a WhatsApp message for a Diwali sale"
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Append user message
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const response = processChatQuery(text, customers);
      const aiMsg = {
        sender: 'ai',
        text: response.answer,
        action: response.suggestedAction
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[380px] h-[500px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in text-slate-200 mb-4">
          
          {/* Header */}
          <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">XENO AI Copilot</h4>
                <p className="text-[9px] text-indigo-400 font-semibold">Ready to draft & analyze</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Logs Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Profile Avatar */}
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                    AI
                  </div>
                )}
                
                {/* Bubble */}
                <div className="max-w-[75%] space-y-2">
                  <div 
                    className={`p-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm font-medium ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-750'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Actions inside chat bubbles */}
                  {msg.action && (
                    <button
                      onClick={() => {
                        onTriggerAction(msg.action);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 group/btn"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/20 space-y-1.5">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block px-1">Suggested Prompts</span>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-755 border border-slate-750 text-slate-400 hover:text-slate-200 rounded-lg text-[9px] font-medium text-left truncate max-w-full transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Message input footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(inputValue);
              }}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            />
            <button
              onClick={() => handleSend(inputValue)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow shadow-indigo-600/10 active:scale-95 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Button Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20 active:scale-95 transition-all duration-300 transform hover:scale-105 border border-indigo-400/30 ring-4 ring-indigo-500/10 relative"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-fade-in" />
        ) : (
          <>
            <MessageSquareCode className="w-6 h-6 animate-float" />
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full border border-indigo-600 animate-pulse">
              AI
            </span>
          </>
        )}
      </button>
    </div>
  );
}
