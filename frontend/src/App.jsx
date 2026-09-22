import RegisterPage from './pages/Register/RegisterPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import { Routes, Route } from 'react-router-dom'
import FeedPage from './pages/Feed/FeedPage.jsx'


function App() {
  return (
    <main className="App">
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/" element={<LoginPage />} />
        </Routes>
    </main>
  )
}

export default App
