
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { createChatSession, streamChatResponse } from '../services/geminiService';
import { PaperAirplaneIcon } from './icons';
import { Chat } from '@google/genai';
import { useLanguage } from '../context/LanguageContext';

export const Chatbot: React.FC = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chat session when component mounts or language changes
        setChat(createChatSession(t('covasSystemPrompt')));
        setMessages([]); // Clear messages when language changes
    }, [t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chat) return;
        
        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const botMessage: ChatMessage = { sender: 'bot', text: '' };
        setMessages(prev => [...prev, botMessage]);
        
        try {
            await streamChatResponse(chat, currentInput, (chunk) => {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.sender === 'bot') {
                        lastMessage.text += chunk;
                        return [...prev.slice(0, -1), lastMessage];
                    }
                    return prev;
                });
            });
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === 'bot') {
                    lastMessage.text = t('chatbotError');
                    return [...prev.slice(0, -1), lastMessage];
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 w-16 h-16 bg-orange-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-orange-500 transition-transform transform hover:scale-110 z-50"
                aria-label={t('openChatbotAriaLabel')}
            >
                <svg xmlns="http://www.w.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-5 w-[90vw] max-w-sm h-[70vh] max-h-[600px] flex flex-col glassmorphism rounded-lg shadow-2xl z-40">
                    <div className="p-3 border-b border-orange-400/20">
                        <h3 className="font-orbitron text-lg text-center text-gray-200">{t('covasAssistantTitle')}</h3>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    {msg.text}{isLoading && msg.sender === 'bot' && index === messages.length -1 && <span className="inline-block w-2 h-2 ml-1 bg-white rounded-full animate-pulse"></span>}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t border-orange-400/20">
                        <div className="flex items-center bg-gray-900 rounded-lg">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                placeholder={t('chatbotPlaceholder')}
                                className="flex-grow bg-transparent p-3 text-gray-200 focus:outline-none"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading} className="p-3 text-orange-400 hover:text-orange-300 disabled:text-gray-600">
                                <PaperAirplaneIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};