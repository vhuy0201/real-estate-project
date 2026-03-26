import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.tsx'
import CssBaseline from "@mui/material/CssBaseline";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <App />
    </BrowserRouter>
  </StrictMode>
)
