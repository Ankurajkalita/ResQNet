import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import MissionDetails from './pages/MissionDetails';

function App() {
    return (
        <Router>
            <div className="min-h-screen text-slate-200">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/mission/:id" element={<MissionDetails />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
