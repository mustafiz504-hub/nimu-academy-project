import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Shop from './pages/Shop';
import NotFound from './pages/NotFound';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import ScrollToTop from './components/ScrollToTop';
import { GlobalProvider } from './context/GlobalContext';
import CourseDetailPage from './pages/CourseDetailPage';

function App() {
  return (
    <GlobalProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-brand-dark text-brand-cream font-sans selection:bg-brand-gold selection:text-brand-dark">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </GlobalProvider>
  );
}

export default App;
