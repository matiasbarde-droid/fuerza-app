import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './app/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter: funciona en GitHub Pages sin configurar el servidor. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
