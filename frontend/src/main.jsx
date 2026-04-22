import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';

// Forzar tema oscuro por defecto
if (!localStorage.getItem('tema')) localStorage.setItem('tema', 'oscuro');
const _tema = localStorage.getItem('tema');
document.documentElement.setAttribute('data-theme', _tema);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
