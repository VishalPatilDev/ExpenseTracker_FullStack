import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import backgroundImage from "../assets/ee.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const register = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !phoneNumber) {
            alert("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/pjsofttech_welcome/register",
                {
                    name,
                    phoneNumber,
                    email,
                    password,
                }
            );

            console.log(
                "REGISTER RESPONSE:",
                response.data
            );

            alert("Registration successful!");

            navigate("/login");
        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">

            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Register Card */}
            <Card className="relative z-10 w-[calc(100%-2rem)] max-w-md border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl">

                <CardHeader className="space-y-2 text-center">

                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Create Account
                    </CardTitle>

                    <CardDescription>
                        Create your Expense Tracker account
                    </CardDescription>

                </CardHeader>

                <CardContent>

                    <form
                        onSubmit={register}
                        className="space-y-4"
                    >

                        {/* Name */}
                        <div className="space-y-2">

                            <Label htmlFor="name">
                                Full Name
                            </Label>

                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                autoComplete="name"
                            />

                        </div>

                        {/* Email */}
                        <div className="space-y-2">

                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                autoComplete="email"
                            />

                        </div>

                        {/* Phone */}
                        <div className="space-y-2">

                            <Label htmlFor="phoneNumber">
                                Phone Number
                            </Label>

                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="Enter phone number"
                                value={phoneNumber}
                                onChange={(e) =>
                                    setPhoneNumber(e.target.value)
                                }
                                autoComplete="tel"
                            />

                        </div>

                        {/* Password */}
                        <div className="space-y-2">

                            <Label htmlFor="password">
                                Password
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="new-password"
                            />

                        </div>

                        {/* Register */}
                        <Button
                            type="submit"
                            className="w-full border- hover:bg-gray-400"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Register"}
                        </Button>

                        {/* Login */}
                        <Button
                            type="button"
                            // variant="outline"
                            className="w-full  hover:text-lg underline"
                            onClick={() => navigate("/login")}
                        >
                            Already have an account? Login
                        </Button>

                    </form>

                </CardContent>
            </Card>
        </div>
    );
};

export default Register;