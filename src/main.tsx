import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource/cairo/arabic-400.css';
import '@fontsource/cairo/arabic-600.css';
import '@fontsource/cairo/arabic-700.css';
import '@fontsource/cairo/latin-400.css';
import './styles.css';
import './learning-workspace.css';
import './compact-layout.css';
import './template/template.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>,
);
