import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import './index.css'
import App from './App.tsx'

// cose-bilkent 레이아웃 등록
cytoscape.use(coseBilkent)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
