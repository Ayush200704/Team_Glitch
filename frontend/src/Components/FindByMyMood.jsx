import React, { useState } from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const FindByMyMood = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState(null);
    const [showOutput, setShowOutput] = useState(false);
    const [isSmartwatchLoading, setIsSmartwatchLoading] = useState(false);
    const [smartwatchOutput, setSmartwatchOutput] = useState(null);
    const [showSmartwatchOutput, setShowSmartwatchOutput] = useState(false);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const [calendarOutput, setCalendarOutput] = useState(null);
    const [showCalendarOutput, setShowCalendarOutput] = useState(false);
    const [isVoiceLoading, setIsVoiceLoading] = useState(false);
    const [voiceOutput, setVoiceOutput] = useState(null);
    const [showVoiceOutput, setShowVoiceOutput] = useState(false);
    const [isFinalLoading, setIsFinalLoading] = useState(false);

    const handleGetRequest = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/predict-mood', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setOutput(data);
            setShowOutput(true);
        } catch (error) {
            console.error('Error:', error);
            setOutput({ error: 'Failed to fetch mood prediction. Please try again.' });
            setShowOutput(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartwatchRequest = async () => {
        setIsSmartwatchLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/trigger/smartwatch_prediction', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setSmartwatchOutput(data);
            setShowSmartwatchOutput(true);
        } catch (error) {
            console.error('Error:', error);
            setSmartwatchOutput({ error: 'Failed to fetch smartwatch prediction. Please try again.' });
            setShowSmartwatchOutput(true);
        } finally {
            setIsSmartwatchLoading(false);
        }
    };

    const handleCalendarRequest = async () => {
        setIsCalendarLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/trigger/calendar', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setCalendarOutput(data);
            setShowCalendarOutput(true);
        } catch (error) {
            console.error('Error:', error);
            setCalendarOutput({ error: 'Failed to fetch calendar events. Please try again.' });
            setShowCalendarOutput(true);
        } finally {
            setIsCalendarLoading(false);
        }
    };

    const handleVoiceRequest = async () => {
        setIsVoiceLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/trigger/voice', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setVoiceOutput(data);
            setShowVoiceOutput(true);
        } catch (error) {
            console.error('Error:', error);
            setVoiceOutput({ error: 'Failed to fetch voice predictions. Please try again.' });
            setShowVoiceOutput(true);
        } finally {
            setIsVoiceLoading(false);
        }
    };

    const handleFinalRequest = async () => {
        setIsFinalLoading(true);
        navigate('/recommendations');
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Find By My Mood</h1>
                    <p className="text-gray-300">Get personalized recommendations</p>
                </div>

                {/* Small GET Request Div */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 justify-center items-center min-h-[60vh]">
                    {/* Environment Div */}
                    <div className="flex-1 bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700 mb-8 md:mb-0">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-white mb-4">Environment</h2>
                            <button
                                onClick={handleGetRequest}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mx-auto"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={20} />
                                        Get Recommendations
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Smartwatch Div */}
                    <div className="flex-1 bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700 mb-8 md:mb-0">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-white mb-4">Smartwatch</h2>
                            <button
                                onClick={handleSmartwatchRequest}
                                disabled={isSmartwatchLoading}
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mx-auto"
                            >
                                {isSmartwatchLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={20} />
                                        Get Recommendations
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Calendar Div */}
                    <div className="flex-1 bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700 mb-8 md:mb-0">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-white mb-4">Calendar</h2>
                            <button
                                onClick={handleCalendarRequest}
                                disabled={isCalendarLoading}
                                className="bg-gradient-to-r from-yellow-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-yellow-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mx-auto"
                            >
                                {isCalendarLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={20} />
                                        Get Recommendations
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Voice Div */}
                    <div className="flex-1 bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-white mb-4">Voice</h2>
                            <button
                                onClick={handleVoiceRequest}
                                disabled={isVoiceLoading}
                                className="bg-gradient-to-r from-pink-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mx-auto"
                            >
                                {isVoiceLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={20} />
                                        Get Recommendations
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Final Recommendation Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleFinalRequest}
                        disabled={isFinalLoading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        {isFinalLoading ? 'Loading Final Recommendation...' : 'Get Final Recommendation'}
                    </button>
                </div>

                {/* Floating Output Display for Environment */}
                {showOutput && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">Analysis Results</h3>
                                    <button
                                        onClick={() => setShowOutput(false)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {output?.error ? (
                                    <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-700">
                                        <p className="font-semibold">Error:</p>
                                        <p>{output.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {output?.predicted_mood && (
                                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
                                                <h4 className="font-semibold text-blue-300 mb-2">Predicted Mood:</h4>
                                                <p className="text-blue-200">{output.predicted_mood}</p>
                                            </div>
                                        )}

                                        {output?.iot_input && (
                                            <div className="bg-green-900/20 p-4 rounded-lg border border-green-700">
                                                <h4 className="font-semibold text-green-300 mb-2">Environment Data:</h4>
                                                <div className="text-green-200 space-y-1">
                                                    <p><strong>Time of Day:</strong> {output.iot_input.time_of_day}</p>
                                                    <p><strong>Brightness:</strong> {output.iot_input.brightness}</p>
                                                    <p><strong>Light Color Temp:</strong> {output.iot_input.light_color_temp}</p>
                                                    <p><strong>Room Temperature:</strong> {output.iot_input.room_temp}°C</p>
                                                    <p><strong>Sound Level:</strong> {output.iot_input.sound_level}</p>
                                                    <p><strong>Music Genre:</strong> {output.iot_input.music_genre || 'None'}</p>
                                                    <p><strong>Movement:</strong> {output.iot_input.movement}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-700 p-4 border-t border-gray-600">
                                <button
                                    onClick={() => setShowOutput(false)}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Output Display for Smartwatch */}
                {showSmartwatchOutput && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">Smartwatch Analysis Results</h3>
                                    <button
                                        onClick={() => setShowSmartwatchOutput(false)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {smartwatchOutput?.error ? (
                                    <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-700">
                                        <p className="font-semibold">Error:</p>
                                        <p>{smartwatchOutput.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {smartwatchOutput?.predicted_mood && (
                                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
                                                <h4 className="font-semibold text-blue-300 mb-2">Predicted Mood:</h4>
                                                <p className="text-blue-200">{smartwatchOutput.predicted_mood}</p>
                                            </div>
                                        )}
                                        {smartwatchOutput?.sample && (
                                            <div className="bg-green-900/20 p-4 rounded-lg border border-green-700">
                                                <h4 className="font-semibold text-green-300 mb-2">Smartwatch Data:</h4>
                                                <div className="text-green-200 space-y-1 text-sm max-h-48 overflow-y-auto pr-2">
                                                    {Object.entries(smartwatchOutput.sample).map(([key, value]) => (
                                                        <p key={key}><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-700 p-4 border-t border-gray-600">
                                <button
                                    onClick={() => setShowSmartwatchOutput(false)}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Output Display for Calendar */}
                {showCalendarOutput && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-yellow-500 to-blue-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">Calendar Events</h3>
                                    <button
                                        onClick={() => setShowCalendarOutput(false)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {calendarOutput?.error ? (
                                    <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-700">
                                        <p className="font-semibold">Error:</p>
                                        <p>{calendarOutput.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {calendarOutput?.events && calendarOutput.events.length > 0 ? (
                                            calendarOutput.events.map((event, idx) => (
                                                <div key={idx} className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700">
                                                    <h4 className="font-semibold text-yellow-300 mb-2">{event.summary}</h4>
                                                    <div className="text-yellow-200 space-y-1 text-sm">
                                                        <p><strong>Start:</strong> {event.start}</p>
                                                        <p><strong>End:</strong> {event.end}</p>
                                                        {event.location && <p><strong>Location:</strong> {event.location}</p>}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-yellow-200">No events found.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Footer */}
                            <div className="bg-gray-700 p-4 border-t border-gray-600">
                                <button
                                    onClick={() => setShowCalendarOutput(false)}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Output Display for Voice */}
                {showVoiceOutput && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-pink-500 to-blue-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">Voice Analysis Results</h3>
                                    <button
                                        onClick={() => setShowVoiceOutput(false)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {voiceOutput?.error ? (
                                    <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-700">
                                        <p className="font-semibold">Error:</p>
                                        <p>{voiceOutput.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-pink-900/20 p-4 rounded-lg border border-pink-700">
                                            <h4 className="font-semibold text-pink-300 mb-2">{voiceOutput.filename}</h4>
                                            <div className="text-pink-200 space-y-1 text-sm">
                                                <p><strong>Predicted Emotion:</strong> {voiceOutput.predicted_emotion}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Footer */}
                            <div className="bg-gray-700 p-4 border-t border-gray-600">
                                <button
                                    onClick={() => setShowVoiceOutput(false)}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindByMyMood;