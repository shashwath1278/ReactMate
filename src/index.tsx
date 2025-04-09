import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <DndProvider
      backend={isTouchDevice() ? TouchBackend : HTML5Backend}
      options={isTouchDevice() ? { enableMouseEvents: true } : {}}
    >
      <Router>
        <Routes>
          <Route path="/play/offline" element={<App initialMode="offline" />} />
          <Route path="/play/ai" element={<App initialMode="ai" />} />
          <Route path="/play/online" element={<App initialMode="online" />} />
          {/* Redirect root path to the landing page or default mode */}
          <Route path="/" element={<Navigate to="/play/offline" replace />} />
          {/* Catch-all route for any undefined paths */}
          <Route path="*" element={<Navigate to="/play/offline" replace />} />
        </Routes>
      </Router>
    </DndProvider>
  </React.StrictMode>
);

reportWebVitals();
