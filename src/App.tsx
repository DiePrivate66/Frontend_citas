import { useState } from 'react'
import AppointmentBookingPage from './pages/AppointmentBookingPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'))

  function handleLogout() {
    localStorage.removeItem('accessToken')
    setToken(null)
  }

  if (!token) {
    return <LoginPage onLogin={setToken} />
  }

  return <AppointmentBookingPage token={token} onLogout={handleLogout} />
}

export default App
