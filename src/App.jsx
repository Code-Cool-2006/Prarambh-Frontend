import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './components/Login';
import Profile from './components/Profile';
import Countdown from './components/Countdown';

function App() {
  return (
    <Router>

      {/* Dynamic Immersive Background */}
      <div className="bg-glow-container">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <div className="glow-orb orb-4"></div>
      </div>

      {/* Grid Overlay */}
      <div className="bg-grid"></div>

      <Routes>

        {/* Countdown → Login Flow */}
        <Route
          path="/login"
          element={<Countdown />}
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Redirect Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </Router>
  );
}

export default App;