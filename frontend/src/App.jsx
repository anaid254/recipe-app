import Register from './components/Register/Register.jsx'
import Login from './components/Login/Login.jsx'
import { Routes, Route } from 'react-router-dom'


function App() {
  return (
    <main className="App">
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Login />} />
        </Routes>
    </main>
  )
}

export default App
