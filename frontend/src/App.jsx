import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home.jsx';
import Room from './Components/Room.jsx';
import Dashboard from './Components/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/watch-together" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
