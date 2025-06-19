import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';

const socket = io('http://localhost:3001');

function Room() {
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const username = sessionStorage.getItem("username") || "Anonymous";

    const [reactions, setReactions] = useState([]);

    const isSyncingRef = useRef(false);
    const hasJoinedRef = useRef(false);
    const { roomId } = useParams();
    const videoRef = useRef();
    const [movieUrl, setMovieUrl] = useState("");
    const [userList, setUserList] = useState([]);
    const [isHost] = useState(sessionStorage.getItem("isHost") === "true");
    const [copied, setCopied] = useState(false);
    const [currentOverlay, setCurrentOverlay] = useState(null);
    const [overlayResults, setOverlayResults] = useState(null);
    const [hasAnswered, setHasAnswered] = useState({});
    const [overlayHistory, setOverlayHistory] = useState([]);
    const [notificationOpen, setNotificationOpen] = useState(false);

    useEffect(() => {

        let username = sessionStorage.getItem("username");

        if (!username) {
            username = prompt("Enter your name") || "Anonymous";
            sessionStorage.setItem("username", username);
        }

        if (!hasJoinedRef.current) {
            hasJoinedRef.current = true;
            socket.emit('join-room', { roomId, username, isHost });
        }

        socket.on('load-movie', (url) => {
            setMovieUrl(url);
        });

        socket.on('user-list', (users) => {
            setUserList(users);
        });

        socket.on('emoji-reaction', ({ emoji, username }) => {
            const id = Date.now();
            setReactions(prev => [...prev, { id, emoji, username }]);
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 4000); // Show for 4s
        });



        socket.on('play', (time) => {
            isSyncingRef.current = true;
            videoRef.current.currentTime = time;
            videoRef.current.play().finally(() => {
                isSyncingRef.current = false;
            });
        });

        socket.on('pause', (time) => {
            isSyncingRef.current = true;
            videoRef.current.currentTime = time;
            videoRef.current.pause();
            setTimeout(() => {
                isSyncingRef.current = false;
            }, 200);
        });

        socket.on('seek', (time) => {
            isSyncingRef.current = true;
            videoRef.current.currentTime = time;
            setTimeout(() => {
                isSyncingRef.current = false;
            }, 200);
        });

        socket.on('rate-change', ({ rate }) => {
            isSyncingRef.current = true;
            videoRef.current.playbackRate = rate;
            setTimeout(() => {
                isSyncingRef.current = false;
            }, 200);
        });

        socket.on('chat-message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('force-leave', () => {
            alert("Host has left the room. You will be redirected.");
            navigate('/');
        });

        socket.on('scene-interaction', (payload) => {
            setCurrentOverlay(payload);
            setOverlayResults(null);
            setHasAnswered(prev => ({ ...prev, [payload.scene]: false }));
            setOverlayHistory(prev => [...prev, { ...payload, timestamp: Date.now() }]);
        });

        socket.on('interaction-results', (results) => {
            setOverlayResults(results);
            setOverlayHistory(prev =>
                prev.map(item =>
                    item.scene === results.scene
                        ? { ...item, results }
                        : item
                )
            );
        });

        return () => {
            socket.off('load-movie');
            socket.off('play');
            socket.off('pause');
            socket.off('seek');
            socket.off('rate-change');
            socket.off('user-list');
            socket.off('chat-message');
            socket.off('force-leave');
            socket.off('scene-interaction');
            socket.off('interaction-results');
        };


    }, [roomId]);



    const handleSelectMovie = () => {
        const url = prompt("Enter movie URL (.mp4)");
        if (url) {
            setMovieUrl(url);
            socket.emit('select-movie', { roomId, movieUrl: url });
        }
    };

    const navigate = useNavigate();

    const handleLeaveRoom = () => {
        socket.emit('leave-room', { roomId });
        navigate('/');
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (chatInput.trim() === "") return;

        const msg = {
            roomId,
            username,
            message: chatInput.trim(),
        };

        socket.emit('chat-message', msg);
        setChatInput("");
    };


    const handlePlay = () => {
        if (isSyncingRef.current) return;
        const time = videoRef.current.currentTime;
        socket.emit('play', { roomId, time });
    };

    const handlePause = () => {
        if (isSyncingRef.current) return;
        const time = videoRef.current.currentTime;
        socket.emit('pause', { roomId, time });
    };

    const handleSeek = () => {
        if (isSyncingRef.current) return;
        const time = videoRef.current.currentTime;
        socket.emit('seek', { roomId, time });
    };

    const handleOverlaySubmit = (answer) => {
        if (!currentOverlay || hasAnswered[currentOverlay.scene]) return;
        socket.emit('interaction-response', {
            roomId,
            scene: currentOverlay.scene,
            answer,
            username
        });
        setHasAnswered(prev => ({ ...prev, [currentOverlay.scene]: true }));
    };

    return (
        <div className="p-5 md:p-8 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">Room ID: {roomId}</h2>
                <button
                    className="ml-2 p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors cursor-pointer relative"
                    onClick={() => {
                        navigator.clipboard.writeText(roomId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                    }}
                    title="Copy Room ID"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6.75A2.25 2.25 0 0014.25 4.5h-6A2.25 2.25 0 006 6.75v6A2.25 2.25 0 008.25 15h1.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9.75V17.25A2.25 2.25 0 0115.75 19.5h-6A2.25 2.25 0 017.5 17.25v-6A2.25 2.25 0 019.75 9.75h6A2.25 2.25 0 0118 12v-2.25z" />
                    </svg>
                    {copied && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 shadow-lg">Copied!</span>
                    )}
                </button>
            </div>

            {isHost && (
                <button onClick={handleSelectMovie} className="mb-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors">Select Movie</button>
            )}

            {!isHost && !movieUrl && (
                <p className="mb-4 text-yellow-300">Waiting for host to select a movie...</p>
            )}

            <div className="relative w-[320px] md:w-[640px] h-0">
                {reactions.map(reaction => (
                    <div
                        key={reaction.id}
                        className="absolute -top-10 text-3xl float-up-emoji"
                        style={{ left: `${Math.random() * 80 + 10}%` }}
                    >
                        {reaction.emoji}
                    </div>
                ))}
            </div>

            {movieUrl && (
                <video
                    ref={videoRef}
                    width="640"
                    height="360"
                    controls
                    src={movieUrl}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeeked={handleSeek}
                    className="rounded-lg shadow-lg mb-4"
                />
            )}

            <div className="mt-5 border border-gray-300 rounded-lg p-4 w-full max-w-xl bg-white/80">
                <h4 className="font-semibold mb-2 text-gray-800">Live Chat</h4>
                <div className="max-h-[200px] overflow-y-auto mb-3 bg-gray-100 p-2 rounded">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`rounded-lg px-3 py-2 mb-2 text-sm break-words max-w-[90%] ${msg.username === "System" ? "bg-yellow-100 italic text-gray-700" : "bg-gray-200 text-blue-700"}`}
                        >
                            <strong className={msg.username === "System" ? "text-yellow-800" : "text-blue-700"}>
                                {msg.username}:
                            </strong> {msg.message}
                        </div>
                    ))}
                </div>
                <form onSubmit={sendMessage} className="flex">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg font-semibold transition-colors">Send</button>
                </form>
            </div>
            <div className="mt-3 flex gap-2">
                {['❤️', '😂', '😮', '👏'].map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => socket.emit('emoji-reaction', { roomId, emoji, username })}
                        className="text-2xl m-1 cursor-pointer hover:scale-125 transition-transform"
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            {/* Notification and Leave Room Buttons Row */}
            <div className="flex flex-row items-center gap-4 mt-4">
                <button
                    onClick={handleLeaveRoom}
                    className="bg-red-600 hover:bg-red-700 text-white border-none px-6 py-2 rounded-lg cursor-pointer font-semibold shadow"
                >
                    Leave Room
                </button>

                <button
                    onClick={() => setNotificationOpen(true)}
                    className="relative bg-white hover:bg-blue-100 text-blue-700 rounded-full w-14 h-14 flex items-center justify-center shadow-xl border border-blue-200 transition-colors duration-200"
                    title="Show notifications"
                    style={{ outline: 'none' }}
                >
                    <FiBell size={32} />
                    {overlayHistory.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-md border-2 border-white">
                            {overlayHistory.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="mt-6 w-full max-w-xs">
                <h4 className="mb-2 font-semibold text-gray-200">Users in Room:</h4>
                <ul className="bg-gray-100 p-3 rounded-lg list-none max-w-xs text-gray-800 font-medium shadow">
                    {userList.map(user => (
                        <li key={user.socketId} className="py-2 border-b border-gray-200 last:border-b-0 flex items-center">
                            <span className="mr-2">👤</span> {user.username}
                        </li>
                    ))}
                </ul>
            </div>

            {notificationOpen && (
                <div
                    className="fixed top-24 right-10 w-96 max-h-[70vh] bg-white/95 rounded-2xl shadow-2xl z-50 overflow-y-auto border border-blue-200 animate-fadeIn"
                    style={{ backdropFilter: 'blur(6px)' }}
                >
                    <div className="flex justify-between items-center px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
                        <h3 className="font-bold text-xl text-blue-800 tracking-wide">Movie Interactions</h3>
                        <button onClick={() => setNotificationOpen(false)} className="text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none">&times;</button>
                    </div>
                    <div className="p-5 space-y-5">
                        {overlayHistory.length === 0 && <div className="text-gray-400 text-center">No interactions yet.</div>}
                        {overlayHistory.map((item, idx) => (
                            <div key={item.scene + '-' + idx} className="rounded-xl bg-blue-50/80 p-4 shadow-sm border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase
                                        ${item.type === 'trivia' ? 'bg-yellow-200 text-yellow-800' :
                                          item.type === 'poll' ? 'bg-green-200 text-green-800' :
                                          'bg-blue-200 text-blue-800'}`}
                                    >
                                        {item.type === 'trivia' ? 'TRIVIA' : item.type === 'poll' ? 'POLL' : 'FACT'}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-auto">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                                {item.type === 'trivia' && (
                                    <>
                                        <div className="font-semibold text-blue-900 mb-1">{item.question}</div>
                                        {item.choices && (
                                            <ul className="list-disc ml-5 text-sm text-blue-800">
                                                {item.choices.map(choice => <li key={choice}>{choice}</li>)}
                                            </ul>
                                        )}
                                        {item.results && (
                                            <div className="mt-2 text-xs text-green-700">
                                                Results: {Object.entries(item.results.results || {}).map(([ans, count]) => `${ans}: ${count}`).join(', ')}
                                            </div>
                                        )}
                                    </>
                                )}
                                {item.type === 'poll' && (
                                    <>
                                        <div className="font-semibold text-blue-900 mb-1">{item.question}</div>
                                        {item.options && (
                                            <ul className="list-disc ml-5 text-sm text-green-800">
                                                {item.options.map(option => <li key={option}>{option}</li>)}
                                            </ul>
                                        )}
                                        {item.results && (
                                            <div className="mt-2 text-xs text-green-700">
                                                Results: {Object.entries(item.results.results || {}).map(([ans, count]) => `${ans}: ${count}`).join(', ')}
                                            </div>
                                        )}
                                    </>
                                )}
                                {item.type === 'fun_fact' && (
                                    <div className="italic text-blue-700">{item.fact}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Overlay({ overlay, onSubmit, results, hasAnswered }) {
    if (!overlay) return null;
    if (overlay.type === 'trivia') {
        return (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-96 text-center">
                <h3 className="font-bold mb-2">{overlay.question}</h3>
                {overlay.choices && !hasAnswered && overlay.choices.map(choice => (
                    <button key={choice} onClick={() => onSubmit(choice)} className="block w-full my-1 py-2 bg-blue-200 rounded hover:bg-blue-400">{choice}</button>
                ))}
                {hasAnswered && <div className="mt-2 text-green-700">Answer submitted!</div>}
                {results && (
                    <div className="mt-4">
                        <h4 className="font-semibold">Results:</h4>
                        {Object.entries(results.results || {}).map(([ans, count]) => (
                            <div key={ans}>{ans}: {count}</div>
                        ))}
                        <div>Total responses: {results.total}</div>
                    </div>
                )}
            </div>
        );
    }
    if (overlay.type === 'fun_fact') {
        return (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-96 text-center">
                <h3 className="font-bold mb-2">Fun Fact</h3>
                <p>{overlay.fact}</p>
            </div>
        );
    }
    if (overlay.type === 'poll') {
        return (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-96 text-center">
                <h3 className="font-bold mb-2">{overlay.question}</h3>
                {overlay.options && !hasAnswered && overlay.options.map(option => (
                    <button key={option} onClick={() => onSubmit(option)} className="block w-full my-1 py-2 bg-green-200 rounded hover:bg-green-400">{option}</button>
                ))}
                {hasAnswered && <div className="mt-2 text-green-700">Answer submitted!</div>}
                {results && (
                    <div className="mt-4">
                        <h4 className="font-semibold">Results:</h4>
                        {Object.entries(results.results || {}).map(([ans, count]) => (
                            <div key={ans}>{ans}: {count}</div>
                        ))}
                        <div>Total responses: {results.total}</div>
                    </div>
                )}
            </div>
        );
    }
    return null;
}

export default Room;
