import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
    <App />
    <Toaster />
    </TooltipProvider>
  </StrictMode>
);