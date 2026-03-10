import React from 'react'
import ReactDOM from 'react-dom/client'
console.log("MARKER: main.tsx loading");
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)