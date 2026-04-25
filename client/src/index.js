import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { WalletProvider } from './context/WalletContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <WalletProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0A1520',
            color: '#E0F0FF',
            border: '1px solid #0F2535',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '12px',
          },
          success: {
            iconTheme: {
              primary: '#00FF88',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3A5C',
              secondary: '#000',
            },
          },
        }}
      />
      <App />
    </WalletProvider>
  </BrowserRouter>
);