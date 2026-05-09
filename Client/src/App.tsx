import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Home/LandingPage';
import Shop from './pages/Shop';
import { GlobalProvider } from './context/GlobalContext';

function App() {
  return (
    <GlobalProvider>
      <Router>
        <div className="min-h-screen bg-brand-cream text-brand-dark font-sans selection:bg-brand-gold selection:text-brand-dark">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </div>
      </Router>
    </GlobalProvider>
  );
}

export default App;
