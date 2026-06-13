import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import BuilderPage from './pages/BuilderPage'
import PlayerPage from './pages/PlayerPage'

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        <h1>Quiz Maker</h1>

        <nav
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <Link to='/'>Builder</Link>
          <Link to='/play'>Player</Link>
        </nav>

        <Routes>
          <Route path='/' element={<BuilderPage />} />
          <Route path='/play' element={<PlayerPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
