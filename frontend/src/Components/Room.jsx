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
        <div style={{ padding: '20px' }}>
            <h2>Room ID: {roomId}</h2>

            {isHost && (
                <button onClick={handleSelectMovie}>Select Movie</button>
            )}

            {!isHost && !movieUrl && (
                <p>Waiting for host to select a movie...</p>
            )}

            <div style={{ position: 'relative', width: '640px', height: '0' }}>
                {reactions.map(reaction => (
                    <div
                        key={reaction.id}
                        style={{
                            position: 'absolute',
                            left: `${Math.random() * 80 + 10}%`,
                            top: '-40px',
                            fontSize: '32px',
                            animation: 'floatUp 4s ease-out forwards',
                        }}
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
                />
            )}

            <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px", maxWidth: "640px" }}>
                <h4>Live Chat</h4>
                <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "10px", background: "#f9f9f9", padding: "5px" }}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: msg.username === "System" ? "#fff3cd" : "#e6e6e6",
                                borderRadius: '8px',
                                padding: '8px 12px',
                                marginBottom: '6px',
                                color: '#333',
                                maxWidth: '90%',
                                wordBreak: 'break-word',
                                fontSize: '14px',
                                fontStyle: msg.username === "System" ? "italic" : "normal",
                            }}
                        >
                            <strong style={{ color: msg.username === "System" ? "#856404" : "#007bff" }}>
                                {msg.username}:
                            </strong> {msg.message}
                        </div>
                    ))}

                </div>
                <form onSubmit={sendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        style={{ width: "80%", padding: "5px" }}
                    />
                    <button type="submit" style={{ padding: "5px 10px", marginLeft: "5px" }}>Send</button>
                </form>
            </div>
            <div style={{ marginTop: '10px' }}>
                {['❤️', '😂', '😮', '👏'].map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => socket.emit('emoji-reaction', { roomId, emoji, username })}
                        style={{ fontSize: '24px', margin: '5px', cursor: 'pointer' }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            <button
                onClick={handleLeaveRoom}
                style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginTop: '15px'
                }}
            >
                Leave Room
            </button>

            <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Users in Room:</h4>
                <ul style={{
                    background: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '8px',
                    listStyleType: 'none',
                    maxWidth: '300px',
                    color: '#333',
                    fontWeight: '500',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    {userList.map(user => (
                        <li key={user.socketId} style={{
                            padding: '6px 10px',
                            borderBottom: '1px solid #ddd'
                        }}>
                            👤 {user.username}
                        </li>
                    ))}
                </ul>
            </div>


        </div>

    );
}

export default Room;
