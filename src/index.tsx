import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
      <App />
    </DndProvider>
  </React.StrictMode>
);

reportWebVitals();
