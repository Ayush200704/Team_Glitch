import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

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


        return () => {
            socket.off('load-movie');
            socket.off('play');
            socket.off('pause');
            socket.off('seek');
            socket.off('rate-change');
            socket.off('user-list');
            socket.off('chat-message');
            socket.off('force-leave');
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

            <button
                onClick={handleLeaveRoom}
                className="bg-red-600 hover:bg-red-700 text-white border-none px-6 py-2 rounded-lg cursor-pointer mt-4 font-semibold shadow"
            >
                Leave Room
            </button>

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
        </div>
    );
}

export default Room;
