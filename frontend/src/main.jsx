import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <h1 className='text-yellow-700 text-4xl font-serif'>Hello Minute Coffee!</h1>
  </StrictMode>,
)
