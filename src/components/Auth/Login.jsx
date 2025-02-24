"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import a1 from "../../assets/1.avif";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            login(response.data.user, response.data.token);
            toast.success('Login successful!');
            
            if (formData.email === "yashmittal4949@gmail.com") {
                setTimeout(() => navigate('/admin'), 1500);
            } else {
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-1/2 relative"
            >
                <img src={a1} alt="Trading Background" className="object-cover w-full" />
                <div className="absolute inset-0 bg-purple-900 opacity-70"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold mb-4"
                        >
                            Welcome Back to StockAura
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl text-purple-200"
                        >
                            Your trusted platform for intelligent stock trading
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 bg-gray-900 flex items-center justify-center p-8"
            >
                <div className="max-w-md w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-3xl font-bold text-purple-400">Login to Your Account</h2>
                        <p className="text-purple-200 mt-2">Enter your credentials to access your account</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-purple-200 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-purple-500 focus:outline-none focus:border-purple-400"
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-purple-200 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-purple-500 focus:outline-none focus:border-purple-400"
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-purple-200">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                                Forgot password?
                            </a>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition duration-300 transform hover:scale-105"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </motion.button>
                    </form>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-purple-200 text-center mt-6"
                    >
                        Don't have an account? 
                        <a href="/signup" className="text-purple-400 hover:text-purple-300 ml-2">
                            Sign up
                        </a>
                    </motion.p>
                </div>
            </motion.div>
            <ToastContainer position="top-right" theme="dark" />
        </div>
    );
}