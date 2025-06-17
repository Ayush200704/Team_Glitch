import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function Home() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");

    const createRoom = () => {
        const newRoomId = uuidv4();
        // Mark as host
        sessionStorage.setItem("isHost", "true");
        navigate(`/room/${newRoomId}`);
    };

    const joinRoom = () => {
        if (!roomId) {
            alert("Please enter a valid Room ID");
            return;
        }
        // Mark as guest
        sessionStorage.setItem("isHost", "false");
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">Welcome to the Watch Party</h1>

            <button onClick={createRoom} className="mb-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors">Create Room</button>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900"
                />
                <button onClick={joinRoom} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-colors">
                    Join Room
                </button>
            </div>
        </div>
    );
}

export default Home;
