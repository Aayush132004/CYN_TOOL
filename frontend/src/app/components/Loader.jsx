'use client'

import React, { useEffect, useRef, useState } from 'react';

const CYNLoader = () => {
    const [asciiArt, setAsciiArt] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const asciiRef = useRef(null);
    const animationFrameId = useRef(null);

    // This effect directly manipulates the <body> tag to prevent scrollbars.
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);


    // --- STAGE 1: Fetch the ASCII art file ---
    useEffect(() => {
        const fetchArt = async () => {
            try {
                const response = await fetch('/art.txt');
                if (!response.ok) throw new Error('Network response was not ok');
                const text = await response.text();
                setAsciiArt(text);
            } catch (error) {
                console.error("Failed to fetch ASCII art:", error);
                setAsciiArt("Error: Could not load art.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchArt();
    }, []);

    // --- STAGE 2: Animate the ASCII art ---
    useEffect(() => {
        if (isLoading || !asciiArt || !asciiRef.current) return;

        const asciiPre = asciiRef.current;
        const fillerChars = "!@#$%^&*-=+?/";
        const ANIMATION_DURATION_MS = 5000;

        const fragment = document.createDocumentFragment();
        const charSpans = [];
        
        [...asciiArt].forEach(char => {
            if (char === '\n') {
                fragment.appendChild(document.createElement('br'));
            } else if (char === ' ') {
                fragment.appendChild(document.createTextNode(' '));
            } else {
                const span = document.createElement('span');
                span.textContent = fillerChars[Math.floor(Math.random() * fillerChars.length)];
                span.dataset.char = char;
                span.className = "char";
                fragment.appendChild(span);
                charSpans.push(span);
            }
        });

        asciiPre.innerHTML = "";
        asciiPre.appendChild(fragment);

        let startTime = null;
        let revealedCount = 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
            const targetCount = Math.floor(progress * charSpans.length);

            for (let i = revealedCount; i < targetCount; i++) {
                const span = charSpans[i];
                if (span) {
                    span.textContent = span.dataset.char;
                    span.classList.add("glow");
                }
            }
            revealedCount = targetCount;

            if (progress < 1) {
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isLoading, asciiArt]);

    return (
        <>
            <style>{`
                /* Keyframes for animations */
                @keyframes fillLoader { from { width: 0%; } to { width: 100%; } }
                @keyframes shimmer { 0% { transform: translateX(-100%) skewX(-25deg); } 100% { transform: translateX(200%) skewX(-25deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }

                /* Main container styling */
                .cyh-container {
                    margin: 0; padding: 0; height: 100vh; width: 100vw;
                    overflow: hidden; background: black; color: limegreen;
                    font-family: monospace; display: flex;
                    justify-content: center; align-items: center;
                    position: relative;
                }
                .cyh-loader-text {
                    font-size: 2vw;
                    text-shadow: 0 0 5px limegreen;
                    animation: fadeIn 1s ease-in;
                }

                /* ASCII Art styling */
                #ascii {
                    white-space: pre; font-size: 0.3vw; line-height: 0.4vw;
                    /* ✅ MODIFIED: Increased scale to hide unwanted right-side characters */
                    transform: scale(1.52);
                    max-width: 100vw; 
                    max-height: 100vh;
                    overflow: hidden;
                    animation: fadeIn 1s ease-out;
                }
                span.char { transition: color 0.5s, text-shadow 0.5s; }
                .glow { color: #0f0 !important; text-shadow: 0 0 2px #0f0, 0 0 4px #0f0; }
                
                /* Loader bar styling */
                .progress-bar-container {
                    position: absolute; bottom: 20px;
                    width: 50%; max-width: 600px; height: 8px;
                    background-color: rgba(0, 255, 0, 0.1);
                    border: 1px solid rgba(0, 255, 0, 0.3);
                    border-radius: 8px; overflow: hidden;
                    box-shadow: 0 0 15px rgba(0, 255, 0, 0.3), 0 0 5px rgba(255, 255, 255, 0.2) inset;
                    animation: fadeIn 0.5s ease-out, fadeOut 0.5s ease-in 5.5s forwards;
                }
                .progress-bar-fill {
                    height: 100%;
                    background-color: limegreen;
                    box-shadow: 0 0 5px limegreen, 0 0 10px limegreen;
                    border-radius: 8px;
                    position: relative; overflow: hidden;
                    animation: fillLoader 5.5s 0.2s ease-out forwards;
                }
                .progress-bar-fill::after {
                    content: ''; position: absolute; top: 0; left: 0;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
                    filter: blur(2px);
                    animation: shimmer 1.5s ease-in-out infinite;
                }
            `}</style>
            <div className="cyh-container">
                {isLoading ? (
                    <div className="cyh-loader-text">Initializing...</div>
                ) : (
                    <>
                        <pre id="ascii" ref={asciiRef}></pre>
                        {/* Restored the progress bar classes in the JSX */}
                        <div className="">
                            <div className=""></div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CYNLoader;