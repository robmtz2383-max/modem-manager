import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

5. **Guarda**

---

## ✅ Resultado final

Deberías tener esto:
```
modem-manager/
├── package.json
├── .gitignore
├── public/
│   └── index.html
└── src/
    ├── App.jsx
    └── index.js