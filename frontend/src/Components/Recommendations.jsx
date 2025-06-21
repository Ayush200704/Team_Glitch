import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [moodData, setMoodData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 5;
    const location = useLocation();

    useEffect(() => {
        fetchRecommendations();
    }, []);

    useEffect(() => {
        console.log('Mood data changed:', moodData);
    }, [moodData]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/recommendations-engine/');
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }
            console.log('Response:', response);
            const data = await response.json();
            console.log('API Response:', data);
            setRecommendations(data);
            
            // Set mood data from the first item
            if (data.length > 0) {
                console.log('Setting mood data from first item:', data[0]);
                setMoodData(data[0]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique dates from recommendations
    const getUniqueDates = () => {
        const dates = recommendations
            .filter(item => item.slot_id)
            .map(item => {
                const date = new Date(item.start_time);
                return date.toISOString().split('T')[0];
            });
        return [...new Set(dates)];
    };

    // Get slots for selected date
    const getSlotsForDate = (date) => {
        return recommendations.filter(item => {
            if (!item.slot_id) return false;
            const itemDate = new Date(item.start_time).toISOString().split('T')[0];
            return itemDate === date;
        });
    };

    // Get movies for selected slot with pagination
    const getPaginatedMovies = (slot) => {
        if (!slot || !slot.fitting_movies) return [];
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        return slot.fitting_movies.slice(startIndex, endIndex);
    };

    // Get total pages for current slot
    const getTotalPages = (slot) => {
        if (!slot || !slot.fitting_movies) return 0;
        return Math.ceil(slot.fitting_movies.length / moviesPerPage);
    };

    // Format time for display
    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-300">Loading recommendations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
                <div className="text-xl font-semibold text-red-400">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    Recommendations
                </h1>

                {/* Mood Information */}
                <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Your Different Moods from Different Platforms
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
                            <h3 className="font-semibold text-blue-300 mb-2">Environment Mood</h3>
                            <p className="text-blue-200 text-lg capitalize">{moodData.environment_mood || 'N/A'}</p>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-700">
                            <h3 className="font-semibold text-green-300 mb-2">Voice Mood</h3>
                            <p className="text-green-200 text-lg capitalize">{moodData.voice_mood || 'N/A'}</p>
                        </div>
                        <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-700">
                            <h3 className="font-semibold text-purple-300 mb-2">Smartwatch Mood</h3>
                            <p className="text-purple-200 text-lg capitalize">{moodData.smartwatch_mood || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Calendar Slots Section */}
                <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                        According to your tasks in calendar, your free slots are:
                    </h2>

                    {/* Date Selection */}
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-300 mb-4">Select a Date:</h3>
                        <div className="flex flex-wrap gap-3">
                            {getUniqueDates().map((date) => (
                                <button
                                    key={date}
                                    onClick={() => {
                                        setSelectedDate(date);
                                        setSelectedSlot(null);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        selectedDate === date
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                    }`}
                                >
                                    {formatDate(date)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Slots and Movies */}
                    {selectedDate && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-300">
                                Time Slots for {formatDate(selectedDate)}:
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {getSlotsForDate(selectedDate).map((slot) => (
                                    <button
                                        key={slot.slot_id}
                                        onClick={() => {
                                            setSelectedSlot(slot);
                                            setCurrentPage(1);
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                            selectedSlot?.slot_id === slot.slot_id
                                                ? 'border-purple-500 bg-purple-900/20'
                                                : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-semibold text-white">
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {slot.free_minutes} minutes free
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {slot.movie_count} movies available
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Movies Display */}
                            {selectedSlot && (
                                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                                    <h4 className="text-xl font-semibold text-white mb-4">
                                        Movies for {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {getPaginatedMovies(selectedSlot).map((movie) => (
                                            <div key={movie.id} className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-600">
                                                <h5 className="font-semibold text-white mb-2">{movie.title}</h5>
                                                <div className="space-y-1 text-sm text-gray-400">
                                                    <p>Duration: {movie.duration_minutes} minutes</p>
                                                    <p>Score: {movie.ranking_score.toFixed(2)}</p>
                                                    <p>ID: {movie.movie_id}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {getTotalPages(selectedSlot) > 1 && (
                                        <div className="flex justify-center items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            
                                            <span className="px-4 py-2 text-gray-300">
                                                Page {currentPage} of {getTotalPages(selectedSlot)}
                                            </span>
                                            
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(selectedSlot)))}
                                                disabled={currentPage === getTotalPages(selectedSlot)}
                                                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Recommendations;