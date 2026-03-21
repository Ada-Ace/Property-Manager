import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PresentationDemo from './Presentation.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PresentationDemo />
  </StrictMode>,
)
