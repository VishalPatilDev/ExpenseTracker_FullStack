import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'


export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const login = async () => {
        try {
            const response = await api.post("/pjsofttech_welcome/login", {
                email,
                password
            })
            console.log("LOGIN RESPONSE:", response.data);
            // console.log("TOKEN:", response.data);
            localStorage.setItem("token", response.data)
            // alert("Login Successful !")
            navigate("/dashboard")

        } catch (error) {
            console.error(error)
            alert("Login Failed")
        }
    }
    const handleRegister = () => {
        navigate("/register");
    };
   return (
    <div className="login-page">
        <div className="login-card">
            <h1>Expense Tracker</h1>

            <input
                className="login-input"
                type="text"
                placeholder="Username / Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                className="login-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button className="login-btn" onClick={login}>
                Login
            </button>

            <button className="register-btn" onClick={handleRegister}>
                New User? Register
            </button>
        </div>
    </div>
)
}
