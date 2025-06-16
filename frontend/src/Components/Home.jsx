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
        <div style={{ padding: '20px' }}>
            <h1>Welcome to the Watch Party</h1>

            <button onClick={createRoom}>Create Room</button>

            <div style={{ marginTop: '20px' }}>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button onClick={joinRoom} style={{ marginLeft: '10px' }}>
                    Join Room
                </button>
            </div>
        </div>
    );
}

export default Home;
