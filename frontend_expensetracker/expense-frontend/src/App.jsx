import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import axios from 'axios'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Expense from './pages/Expense'
import List from './pages/List'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState("")

  function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token")
    if (!token) {
      return <Navigate to="/" replace></Navigate>
    }
    return children;
  }



  return (
    <>
      {/* <h1>React Frontend</h1>
      <p>{message}</p> */}
      {/* <Navbar></Navbar> */}
      {/* localStorage.removeItem("token") */}



      <Routes>
        <Route path='/' element={<Login></Login>}></Route>
        <Route path='/login' element={<Login></Login>}></Route>

        <Route path='/register' element={<Register></Register>}></Route>
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Dashboard />
            </>
          </ProtectedRoute>
        }></Route>
        <Route path='/expense' element={<ProtectedRoute>
          <>
            <Navbar />
            <Expense />
          </>
        </ProtectedRoute>}></Route>
        <Route path='list' element={<ProtectedRoute>
          <>
            <Navbar />
            <List />
          </>
        </ProtectedRoute>}></Route>
        <Route path='settings' element={<ProtectedRoute>
          <>
            <Navbar />
            <Settings />
          </>
        </ProtectedRoute>}></Route>
      </Routes>
    </>
  )
}

export default App
