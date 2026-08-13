import React, { use, useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

const Register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const navigate = useNavigate();
    const register = async () => {
        try {
            const response = await api.post("/pjsofttech_welcome/register", { name, phoneNumber, email, password })
            console.log("REGISTER RESPONSE:", response.data);
            navigate("/login")

        }
        catch (error) {
            console.error(error)
        }

    }
    return (
        <div className="register-page">
            <div className="register-card">
                <h1>Create Account</h1>

                <input
                    className="register-input"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="register-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="register-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    className="register-input"
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <button className="register-btn" onClick={register}>
                    Register
                </button>
            </div>
        </div>
    )
}

export default Register
