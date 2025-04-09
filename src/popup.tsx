/* eslint-disable no-undef */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="text-red-500">Hello World</div>
  </StrictMode>
);
