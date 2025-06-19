import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaArrowRight, FaArrowLeft } from 'react-icons/fa';


const streamingServices = [
    { name: "Netflix", color: "bg-red-600" },
    { name: "Prime Video", color: "bg-blue-700" },
    { name: "IMDb TV", color: "bg-yellow-400 text-black" },
    { name: "YouTube", color: "bg-white text-red-600" },
    { name: "Hulu", color: "bg-green-600" },
    { name: "Disney+", color: "bg-blue-400" },
];

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN; 

export default function Dashboard() {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatStep, setChatStep] = useState(0);
    const [preferences, setPreferences] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [customPrompt, setCustomPrompt] = useState("");
    const [mode, setMode] = useState("preference"); // 'preference' or 'custom'
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyDetailIdx, setHistoryDetailIdx] = useState(null);

    // Example questions
    const questions = [
        { key: "genre", text: "What genre do you prefer?", options: ["Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Thriller"] },
        { key: "length", text: "Preferred movie length?", options: ["Any", "< 90 min", "90-120 min", "> 120 min"] },
        { key: "year", text: "Any preferred release year or range?", options: ["Any", "2020-2024", "2010-2019", "2000-2009", "Before 2000"] }
    ];

    const handlePreference = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setChatStep(prev => prev + 1);
    };

    const handleSubmitPreferences = async () => {
        setChatLoading(true);
        try {
            let body, inputSummary;
            if (mode === "preference") {
                body = preferences;
                inputSummary = { ...preferences };
            } else {
                body = { customPrompt };
                inputSummary = customPrompt;
            }
            const res = await fetch("http://localhost:3001/api/ai-recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            setRecommendations(data.recommendations);
            setCustomPrompt("");
            // Save to history
            setHistory(prev => [
                ...prev,
                {
                    mode,
                    input: inputSummary,
                    recommendations: data.recommendations,
                    timestamp: new Date().toISOString()
                }
            ]);
        } catch (e) {
            setRecommendations([{ name: "Error fetching recommendations." }]);
        }
        setChatLoading(false);
    };

    useEffect(() => {
        const options = {
            method: "GET",
            url: "https://api.themoviedb.org/3/trending/all/day?language=en-US",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${TMDB_TOKEN}`,
            },
        };
        axios
            .request(options)
            .then((res) => {
                setShows(res.data.results || []);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to fetch trending shows.");
                setLoading(false);
            });
    }, []);

    const featured = shows[0];
    const bannerBg = featured && (featured.backdrop_path
        ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}`
        : featured.poster_path
            ? `https://image.tmdb.org/t/p/original${featured.poster_path}`
            : null);
    const bannerTitle = featured && (featured.title || featured.name);
    const bannerYear = featured && ((featured.release_date || featured.first_air_date || '').slice(0, 4));
    const bannerType = featured && (featured.media_type === 'movie' ? 'Movie' : 'TV');
    const bannerRating = featured && featured.vote_average ? featured.vote_average.toFixed(1) : 'N/A';
    const bannerOverview = featured && featured.overview;

    return (
        <div className="bg-gray-900 h-screen text-white font-sans relative">
            {/* Banner */}
            <div className="relative h-[260px] md:h-[380px] w-full flex items-end bg-cover bg-center transition-all duration-300" style={{ backgroundImage: bannerBg ? `url(${bannerBg})` : 'url(https://via.placeholder.com/1200x400?text=No+Image)' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                {featured ? (
                    <div className="relative z-10 p-4 md:p-10 flex flex-col md:flex-row items-end md:items-center gap-6 w-full">
                        <img
                            src={featured.poster_path ? `https://image.tmdb.org/t/p/w300${featured.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}
                            alt={bannerTitle}
                            className="hidden md:block w-28 md:w-40 rounded-lg shadow-lg object-cover -mb-16 md:mb-0"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">{bannerTitle}</h1>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold uppercase">{bannerType}</span>
                                <span className="text-xs text-gray-200">{bannerYear}</span>
                                <span className="text-xs text-yellow-400 font-semibold flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                                    {bannerRating}
                                </span>
                            </div>
                            <p className="mb-4 text-sm md:text-base text-gray-200 max-w-2xl line-clamp-3">{bannerOverview}</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 p-4 md:p-8">
                        <h1 className="text-2xl md:text-4xl font-bold mb-2">No Featured Show</h1>
                        <p className="mb-4 text-base md:text-lg">No trending data available.</p>
                    </div>
                )}
            </div>

            {/* Navigation Bar */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 px-4 md:px-8 py-3 md:py-4 bg-gray-800">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-600 flex items-center justify-center mr-2 md:mr-4 cursor-pointer hover:opacity-80">
                    {/* Person SVG icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                    </svg>
                </div>
                <button className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-gray-700 font-semibold mr-1 md:mr-2 cursor-pointer hover:opacity-80">Home</button>
                <button className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-gray-700 font-semibold mr-1 md:mr-2 cursor-pointer hover:opacity-80">Find By My Mood</button>
                <button className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-gray-700 font-semibold mr-2 md:mr-2 cursor-pointer hover:opacity-80">Live</button>
                <button
                    className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-green-600 font-semibold mr-2 md:mr-4 cursor-pointer hover:opacity-80"
                    onClick={() => navigate("/watch-together")}
                >
                    Watch Together
                </button>
                <div className="ml-auto flex gap-2 items-center">
                    {streamingServices.map((service) => (
                        <button
                            key={service.name}
                            className={`px-2 md:px-3 py-1 rounded font-bold mx-0.5 md:mx-1 text-xs md:text-base ${service.color} cursor-pointer hover:opacity-80`}
                        >
                            {service.name}
                        </button>
                    ))}
                    <button className="w-8 h-8 md:w-10 md:h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80">
                        {/* Settings SVG icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.01c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.01 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.01 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572-1.01c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.01-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.01z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Ask AI to Find Button */}
            <div className="px-4 md:px-8 py-2">
                <button
                    className="px-4 py-2 bg-purple-600 rounded-full font-bold shadow hover:bg-purple-700 transition"
                    onClick={() => {
                        setShowChatbot(true);
                        setChatStep(0);
                        setPreferences({});
                        setRecommendations([]);
                        setChatLoading(false);
                    }}
                >
                    Ask AI to Find
                </button>
            </div>

            {/* Chatbot Panel */}
            {showChatbot && (
                <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] flex flex-row z-50">
                    {/* History Sidebar */}
                    {showHistory && (
                        <>
                            {/* Overlay */}
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowHistory(false)} />
                            {/* Floating History Modal */}
                            <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-[400px] h-[90vh] -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 shadow-2xl rounded-xl flex flex-col">
                                {historyDetailIdx === null ? (
                                    <div className="flex flex-col h-full">
                                        <div className="p-6 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-white flex items-center">
                                                <FaHistory className="mr-3 text-purple-400 text-3xl" />
                                                Search History
                                            </h2>
                                            <button
                                                className="text-gray-400 hover:text-white transition-colors text-2xl"
                                                onClick={() => setShowHistory(false)}
                                                title="Close history"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-6">
                                            {history.length === 0 ? (
                                                <div className="text-center text-gray-400 py-16">
                                                    <FaHistory className="mx-auto mb-4 text-5xl opacity-40" />
                                                    <p className="text-lg">No search history yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-5">
                                                    {history.map((entry, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-gray-800 rounded-xl p-5 hover:bg-gray-700 transition-colors cursor-pointer shadow flex items-center justify-between"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center mb-2">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${entry.mode === "preference" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
                                                                        {entry.mode === "preference" ? "Preferences" : "Custom"}
                                                                    </span>
                                                                </div>
                                                                <div className="text-base text-gray-200 mb-1 truncate font-semibold">
                                                                    {entry.mode === "preference" ? (
                                                                        <span>
                                                                            {entry.input.genre} • {entry.input.length} • {entry.input.year}
                                                                        </span>
                                                                    ) : (
                                                                        <span>{entry.input}</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {entry.recommendations?.length || 0} recommendations
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="ml-4 p-2 rounded-full hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                                                                onClick={() => setHistoryDetailIdx(idx)}
                                                                title="View details"
                                                            >
                                                                <FaArrowRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full">
                                        <div className="p-6 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
                                            <button
                                                className="flex items-center text-gray-300 hover:text-white transition-colors mr-4"
                                                onClick={() => setHistoryDetailIdx(null)}
                                            >
                                                <FaArrowLeft className="mr-2" />
                                                Back to History
                                            </button>
                                            <button
                                                className="text-gray-400 hover:text-white transition-colors text-2xl"
                                                onClick={() => setShowHistory(false)}
                                                title="Close history"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-6">
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-purple-400 mb-3 text-lg">Search Query:</h4>
                                                <div className="bg-gray-800 rounded-xl p-4">
                                                    {history[historyDetailIdx].mode === "preference" ? (
                                                        <div className="space-y-2 text-base">
                                                            <div><span className="text-gray-400">Genre:</span> {history[historyDetailIdx].input.genre}</div>
                                                            <div><span className="text-gray-400">Length:</span> {history[historyDetailIdx].input.length}</div>
                                                            <div><span className="text-gray-400">Year:</span> {history[historyDetailIdx].input.year}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-base text-gray-200">
                                                            {history[historyDetailIdx].input}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-purple-400 mb-3 text-lg">
                                                    Recommendations ({history[historyDetailIdx].recommendations?.length || 0}):
                                                </h4>
                                                <div className="space-y-3">
                                                    {history[historyDetailIdx].recommendations?.map((rec, i) => (
                                                        <div key={i} className="bg-gray-800 rounded-lg p-4">
                                                            <div className="font-medium text-white mb-1 text-base">{rec.name}</div>
                                                            {Array.isArray(rec.genre) && rec.genre.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {rec.genre.map((g, j) => (
                                                                        <span key={j} className="px-2 py-1 bg-purple-600 text-xs rounded-full text-white">
                                                                            {g}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {!Array.isArray(rec.genre) && rec.genre && (
                                                                <span className="px-2 py-1 bg-purple-600 text-xs rounded-full text-white">
                                                                    {rec.genre}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* Main Chatbot Content */}
                    <div className="flex-1 bg-gray-800 shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-gray-600">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">AI Movie Finder</h2>
                                <button
                                    className="text-gray-400 hover:text-white transition-colors"
                                    onClick={() => setShowChatbot(false)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2 rounded-lg bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white transition-colors"
                                    onClick={() => setShowHistory(!showHistory)}
                                    title="Toggle history"
                                >
                                    <FaHistory className="w-4 h-4" />
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-lg font-semibold transition-colors ${mode === "preference" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                    onClick={() => { 
                                        setMode("preference"); 
                                        setChatStep(0); 
                                        setPreferences({}); 
                                        setCustomPrompt(""); 
                                        setRecommendations([]); 
                                    }}
                                >
                                    Preferences
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-lg font-semibold transition-colors ${mode === "custom" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                    onClick={() => { 
                                        setMode("custom"); 
                                        setChatStep(questions.length); 
                                        setPreferences({}); 
                                        setCustomPrompt(""); 
                                        setRecommendations([]); 
                                    }}
                                >
                                    Custom
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Preference Mode */}
                            {mode === "preference" && chatStep < questions.length ? (
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-2">{questions[chatStep].text}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {questions[chatStep].options.map(opt => (
                                                <button
                                                    key={opt}
                                                    className="px-3 py-2 bg-gray-700 rounded-lg hover:bg-purple-600 transition-colors"
                                                    onClick={() => handlePreference(questions[chatStep].key, opt)}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : mode === "preference" ? (
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-2">Your Preferences</h3>
                                        <div className="bg-gray-700 rounded-lg p-3 mb-4">
                                            <div className="space-y-1 text-sm">
                                                <div><span className="text-gray-400">Genre:</span> {preferences.genre}</div>
                                                <div><span className="text-gray-400">Length:</span> {preferences.length}</div>
                                                <div><span className="text-gray-400">Year:</span> {preferences.year}</div>
                                            </div>
                                        </div>
                                        <button
                                            className="w-full px-4 py-2 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                            onClick={handleSubmitPreferences}
                                            disabled={chatLoading}
                                        >
                                            {chatLoading ? "Finding..." : "Get Recommendations"}
                                        </button>
                                    </div>
                                    {recommendations.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                                            <div className="space-y-3">
                                                {recommendations.map((rec, idx) => (
                                                    <div key={idx} className="bg-gray-700 rounded-lg p-3">
                                                        <div className="text-lg font-semibold mb-2">{rec.name}</div>
                                                        {Array.isArray(rec.genre) && rec.genre.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {rec.genre.map((g, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-purple-600 text-xs rounded-full text-white">
                                                                        {g}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {!Array.isArray(rec.genre) && rec.genre && (
                                                            <span className="px-2 py-1 bg-purple-600 text-xs rounded-full text-white">
                                                                {rec.genre}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Custom Prompt Mode
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-2">Custom Search</h3>
                                        <textarea
                                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                            rows={4}
                                            placeholder="Describe what kind of movies you're looking for..."
                                            value={customPrompt}
                                            onChange={e => setCustomPrompt(e.target.value)}
                                        />
                                        <button
                                            className="w-full mt-3 px-4 py-2 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                            onClick={handleSubmitPreferences}
                                            disabled={chatLoading || !customPrompt.trim()}
                                        >
                                            {chatLoading ? "Finding..." : "Get Recommendations"}
                                        </button>
                                    </div>
                                    {recommendations.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                                            <div className="space-y-3">
                                                {recommendations.map((rec, idx) => (
                                                    <div key={idx} className="bg-gray-700 rounded-lg p-3">
                                                        <div className="text-lg font-semibold mb-2">{rec.name}</div>
                                                        {Array.isArray(rec.genre) && rec.genre.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {rec.genre.map((g, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-purple-600 text-xs rounded-full text-white">
                                                                        {g}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {!Array.isArray(rec.genre) && rec.genre && (
                                                            <span className="px-2 py-1 bg-purple-600 text-xs rounded-full text-white">
                                                                {rec.genre}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Shows Grid */}
            <div className="px-4 md:px-8 py-4 md:py-6">
                {loading ? (
                    <div className="text-center py-10 text-lg">Loading...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-400">{error}</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {shows.map((show) => {
                            const title = show.title || show.name;
                            const year = (show.release_date || show.first_air_date || '').slice(0, 4);
                            const mediaType = show.media_type === 'movie' ? 'Movie' : 'TV';
                            const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
                            const overview = show.overview || '';
                            const imgSrc = show.poster_path
                                ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                                : "https://via.placeholder.com/200x300?text=No+Image";
                            return (
                                <div
                                    key={show.id}
                                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col group relative transition-transform hover:scale-105 hover:z-10"
                                >
                                    <img
                                        src={imgSrc}
                                        alt={title}
                                        className="w-full h-36 md:h-44 lg:h-52 object-cover bg-gray-700"
                                        loading="lazy"
                                    />
                                    <div className="p-2 flex-1 flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold uppercase">{mediaType}</span>
                                            <span className="text-xs text-yellow-400 font-semibold flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                                                {rating}
                                            </span>
                                        </div>
                                        <div className="text-sm md:text-base font-semibold truncate" title={title}>{title}</div>
                                        <div className="text-xs text-gray-400">{year}</div>
                                    </div>
                                    {/* Overview on hover */}
                                    {overview && (
                                        <div className="absolute inset-0 bg-black bg-opacity-90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-4 text-xs md:text-sm z-20">
                                            <div className="font-bold mb-2">{title}</div>
                                            <div className="overflow-y-auto max-h-32">{overview}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
        </div>
    );
}
