import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeCrawler } from './server/initCrawler';

// Run initial crawl
initializeCrawler()
  .then(() => console.log('Initial crawl completed'))
  .catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
