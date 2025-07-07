import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'

function App() {

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}

export default App
