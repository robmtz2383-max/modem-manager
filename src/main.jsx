import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

document.body.innerHTML = '<h1 style="color:red">HTML CARGA</h1>';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
