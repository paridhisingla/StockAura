"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import a2 from "../../assets/2.avif";

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/signup', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success('Account created successfully!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
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
                <img src={a2} alt="Trading Background" className="object-cover w-full" />
                <div className="absolute inset-0 bg-purple-900 opacity-70"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-12">
                        <h2 className="text-4xl font-bold mb-4">Join StockAura Today</h2>
                        <p className="text-xl">Start your journey to financial success with our powerful trading platform.</p>
                    </div>
                </div>
            </motion.div>

            
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 flex items-center justify-center bg-gray-900 p-8"
            >
                <div className="max-w-md w-full">
                    <h1 className="text-4xl font-bold text-purple-400 mb-8 text-center">Create Account</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className="block text-purple-200 mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-purple-500 focus:outline-none focus:border-purple-400"
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-purple-200 mb-2">Email</label>
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
                            transition={{ delay: 0.3 }}
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
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-purple-200 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-purple-500 focus:outline-none focus:border-purple-400"
                                required
                            />
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition duration-300"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </motion.button>
                    </form>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-purple-200 text-center mt-6"
                    >
                        Already have an account? 
                        <a href="/login" className="text-purple-400 hover:text-purple-300 ml-2">
                            Login
                        </a>
                    </motion.p>
                </div>
            </motion.div>
            <ToastContainer position="top-right" theme="dark" />
        </div>
    );
}