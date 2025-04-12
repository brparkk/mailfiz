/* eslint-disable no-undef */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';
import MailForm from './components/ui/MailForm';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MailForm />
  </StrictMode>
);
