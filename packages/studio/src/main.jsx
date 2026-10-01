import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MicrosoftHub from './components/MicrosoftHub.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MicrosoftHub />
  </StrictMode>,
);
