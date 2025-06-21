import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home.jsx';
import Room from './Components/Room.jsx';
import Dashboard from './Components/Dashboard.jsx';
import FindByMyMood from './Components/FindByMyMood.jsx';
import Recommendations from './Components/Recommendations.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/watch-together" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/find-by-my-mood" element={<FindByMyMood />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
