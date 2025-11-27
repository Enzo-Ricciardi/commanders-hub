import React, { useState, useEffect } from 'react';
import { DataCard } from '../DataCard';
import { MissionIcon, SparkleIcon } from '../icons';
import { analyzeWithAI } from '../../services/geminiService';
import { Ship } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface MissionPlannerProps {
    ship: Ship;
}

// Add type definition for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const MissionPlanner: React.FC<MissionPlannerProps> = ({ ship }) => {
    const { t, language } = useLanguage();
    const [prompt, setPrompt] = useState(''); // Start empty
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);

    const speak = (text: string) => {
        if (!ttsEnabled) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'it' ? 'it-IT' : 'en-US';
        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(language === 'it' ? 'it' : 'en') && v.name.includes('Google'));
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    };

    const handleGeneratePlan = async () => {
        if (!prompt) return;
        const currentPrompt = prompt;
        setPrompt(''); // Reset input immediately
        setIsLoading(true);
        setPlan('');

        // Updated prompt to enforce Copilot persona and no asterisks
        const fullPrompt = `
        You are the ship's Onboard Computer and Copilot. 
        Current Ship: ${ship.type} (Name: ${ship.name}). 
        
        User Request: "${currentPrompt}"
        
        Instructions:
        1. Act as a professional second pilot/computer.
        2. Give a direct, concise answer or plan.
        3. DO NOT use asterisks (*) for actions or formatting.
        4. Speak naturally as if talking over the ship's intercom.
        5. Use your full knowledge of Elite Dangerous.
        `;

        try {
            const result = await analyzeWithAI(fullPrompt, true); // Use Pro model with thinking
            setPlan(result);
            speak(result);
        } catch (e) {
            setPlan("Error processing request.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = language === 'it' ? 'it-IT' : 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(transcript);
                // Optional: Auto-submit after voice
                // handleGeneratePlan(); 
            };
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert("Speech recognition not supported in this browser.");
        }
    };

    return (
        <DataCard title="missionPlannerTitle" icon={<MissionIcon />} className="h-[26rem]">
            <div className="flex flex-col h-full">
                <div className="flex flex-col md:flex-row gap-2 mb-3">
                    <div className="flex-grow relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('missionPlannerPlaceholder')}
                            className="w-full bg-gray-900/80 border border-gray-600 rounded-md p-2 pr-10 text-sm text-gray-200 focus:ring-orange-500 focus:border-orange-500 transition resize-none"
                            rows={2}
                        />
                        <div className="absolute right-2 top-2 flex flex-col gap-1">
                            <button
                                onClick={toggleListening}
                                className={`p-1 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                                title="Voice Input"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setTtsEnabled(!ttsEnabled)}
                                className={`p-1 rounded-full transition-colors ${ttsEnabled ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                                title="Toggle TTS"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button onClick={handleGeneratePlan} disabled={isLoading} className="flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 h-full">
                        <SparkleIcon />
                        <span className="ml-2">{isLoading ? t('thinkingButton') : t('generatePlanButton')}</span>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-3 bg-gray-900/50 rounded-md border border-gray-700/50">
                    {isLoading && !plan && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-400">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                <p>{t('missionPlannerLoading1')}</p>
                                <p className="text-xs mt-1 animate-pulse">{t('processingRequest')}</p>
                            </div>
                        </div>
                    )}
                    {plan && <div className="whitespace-pre-wrap text-sm text-gray-300 font-mono">{plan}</div>}
                    {!isLoading && !plan && <p className="text-gray-500 text-center pt-8">{t('missionPlannerWaiting')}</p>}
                </div>
            </div>
        </DataCard>
    );
};
