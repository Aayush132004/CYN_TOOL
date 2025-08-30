'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bot, Play, Square, Terminal, ArrowLeft, Shield } from 'lucide-react';
import io from 'socket.io-client';

// Define the hosted backend URL
const API_BASE_URL = process.env.BOT_SERVER;

// Full-screen loader component
const FullScreenLoader = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fade-in-fast">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-[#00ff41] border-r-[#00ff41]/30 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-[#00ff41]/20 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-[#00ff41]/50 rounded-full animate-pulse blur-lg"></div>
            </div>
            <Bot className="absolute inset-0 m-auto w-8 h-8 text-[#00ff41]/80"/>
        </div>
    </div>
);

// Log panel component with scroll functionality
const LogPanel = ({ title, logContent, status, onStart, onStop, icon: Icon, showInput = false, onInputChange, inputValue }) => {
    const logRef = useRef(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logContent]);

    return (
        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111111] rounded-2xl border border-[#1a1a1a] shadow-2xl shadow-[#00ff41]/10 transition-all duration-500 hover:border-[#00ff41]/50 hover:shadow-[#00ff41]/20 animate-fade-in">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
                <div className="w-full h-full" style={{ 
                    backgroundImage: `linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)`, 
                    backgroundSize: '20px 20px' 
                }}></div>
            </div>
            
            <div className="relative z-10">
                {/* Header */}
                <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
                    <div className="flex items-center">
                        <Icon className="w-6 h-6 text-[#00ff41] mr-3" />
                        <h3 className="text-lg font-bold text-[#e0e0e0]">{title}</h3>
                        <span className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${status === 'running' ? 'bg-[#00ff41]/20 text-[#00ff41]' : 'bg-[#ff7043]/20 text-[#ff7043]'}`}>
                            {status}
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        {showInput && (
                            <input
                                type="text"
                                value={inputValue}
                                onChange={onInputChange}
                                placeholder="e.g., @drugsellertest_bot"
                                className="bg-black/50 text-white rounded-lg px-4 py-2 border border-[#333] focus:outline-none focus:border-[#00ff41] w-80 h-10 text-sm"
                            />
                        )}
                        <button 
                            onClick={onStart} 
                            className="group bg-gradient-to-r from-[#00ff41] to-[#4caf50] text-black rounded-xl p-2 hover:scale-105 transition-all duration-300 shadow-lg shadow-[#00ff41]/30"
                            title="Start Process"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={onStop} 
                            className="group bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-2 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30"
                            title="Stop Process"
                        >
                            <Square className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Log content with fixed height and scroll */}
                <div className="p-6">
                    <div className="relative h-96">
                        <pre
                            ref={logRef}
                            className="w-full h-full bg-black/90 text-white font-mono text-sm p-4 rounded-xl border border-[#1a1a1a] overflow-y-auto resize-none"
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            {logContent || `[${new Date().toISOString()}] System ready. Click START to begin monitoring...`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main page component
const TelegramBot = () => {
    const [alertsLog, setAlertsLog] = useState("");
    const [botAlertsLog, setBotAlertsLog] = useState("");
    const [monitorStatus, setMonitorStatus] = useState("stopped");
    const [botMonitorStatus, setBotMonitorStatus] = useState("stopped");
    const [isLoading, setIsLoading] = useState(false);
    const [botUsernames, setBotUsernames] = useState('');
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io(API_BASE_URL);

        socket.current.on('connect', () => {
            console.log('Socket.IO connected successfully.');
        });

        socket.current.on('alertsLogUpdate', (data) => {
            setAlertsLog(prev => prev + data);
            // Don't update status here, rely on API call response
        });

        socket.current.on('botAlertsLogUpdate', (data) => {
            setBotAlertsLog(prev => prev + data);
            // Don't update status here, rely on API call response
        });

        socket.current.on('disconnect', () => {
            // Keep the status as it is on disconnect, so the user has to click stop
            // setMonitorStatus('stopped');
            // setBotMonitorStatus('stopped');
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    const fetchAPI = async (endpoint, method = 'GET', body = null) => {
        setIsLoading(true);
        try {
            const options = { method };
            if (body) {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify(body);
            }
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
            const data = await response.json();
            
            if (data.success) {
                if (endpoint.includes('stop')) {
                    if (endpoint.includes('bot-monitor')) {
                        setBotMonitorStatus('stopped');
                    } else {
                        setMonitorStatus('stopped');
                    }
                } else {
                    if (endpoint.includes('bot-monitor')) {
                        setBotMonitorStatus('running');
                    } else {
                        setMonitorStatus('running');
                    }
                }
            } else {
                console.error("API Error:", data.error);
                if (endpoint.includes('stop')) {
                    if (endpoint.includes('bot-monitor')) {
                        setBotMonitorStatus('running');
                    } else {
                        setMonitorStatus('running');
                    }
                } else {
                    if (endpoint.includes('bot-monitor')) {
                        setBotMonitorStatus('stopped');
                    } else {
                        setMonitorStatus('stopped');
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch API:", error);
            // Default to stopped if the API call fails
            if (endpoint.includes('bot-monitor')) {
                setBotMonitorStatus('stopped');
            } else {
                setMonitorStatus('stopped');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartBotMonitorDynamic = () => {
        const users = botUsernames.split(',').map(user => user.trim()).filter(user => user !== '');
        if (users.length === 0) {
            console.error("Please enter at least one username.");
            return;
        }
        fetchAPI('start-bot-monitor-dynamic', 'POST', { users });
    };

    return (
        <>
            {isLoading && <FullScreenLoader />}
            <div
                className="min-h-screen bg-black text-[#e0e0e0] relative overflow-hidden"
                style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    backgroundImage: "url('/Background[1].png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="relative z-10">
                    {/* Navbar matching main page exactly */}
                    <header className="bg-black/60 backdrop-blur-lg border-b border-[#1a1a1a] sticky top-0">
                        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 hover:scale-110 transition-transform duration-300">
                                    <img 
                                        src="/logo.png" 
                                        alt="Logo" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-[#e0e0e0]">CYN</h1>
                                 
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-[#00ff41]" />
                                <span className="text-[#888888]">Status: <span className="text-[#00ff41] font-semibold">[OPERATIONAL]</span></span>
                            </div>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-6 py-8">
                        {/* Page header */}
                        <div className="flex items-center space-x-4 mb-8">
                            <Bot className="w-12 h-12 text-[#00ff41]" />
                            <div>
                                <h2 className="text-3xl font-bold text-[#e0e0e0]">CYN_BOT_ANALYSIS</h2>
                                <p className="text-[#888888]">Monitor live activity of Telegram bot processes and analysis systems</p>
                            </div>
                        </div>

                        {/* Log panels */}
                        <div className="flex flex-col gap-8">
                            <LogPanel
                                title="MONITOR.PY LOGS"
                                logContent={alertsLog}
                                status={monitorStatus}
                                onStart={() => fetchAPI('start-monitor')}
                                onStop={() => fetchAPI('stop-monitor')}
                                icon={Terminal}
                            />
                            <LogPanel
                                title="BOT_MONITOR.PY LOGS"
                                logContent={botAlertsLog}
                                status={botMonitorStatus}
                                onStart={handleStartBotMonitorDynamic}
                                onStop={() => fetchAPI('stop-bot-monitor')}
                                icon={Bot}
                                showInput={true}
                                onInputChange={(e) => setBotUsernames(e.target.value)}
                                inputValue={botUsernames}
                            />
                        </div>
                    </main>
                </div>
            </div>

            <style jsx global>{` 
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'); 
                
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(20px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                } 
                
                @keyframes fadeInFast { 
                    from { opacity: 0; } 
                    to { opacity: 1; } 
                } 
                
                .animate-fade-in { 
                    animation: fadeIn 0.6s ease-out forwards; 
                } 
                
                .animate-fade-in-fast { 
                    animation: fadeInFast 0.3s ease-out forwards; 
                }
            `}</style>
        </>
    );
};

export default TelegramBot;
