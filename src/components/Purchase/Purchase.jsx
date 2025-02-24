import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TrendingUp, TrendingDown, Search, Filter, DollarSign, RefreshCw } from "lucide-react";

const Purchase = () => {
    const { user, token } = useAuth();
    const [stocks, setStocks] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortMethod, setSortMethod] = useState('default');
    const [purchaseQuantity, setPurchaseQuantity] = useState({});
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        if (user && token) {
          fetchStocks();
          fetchWallet();
        }
    }, [user, token]);
    
    const fetchStocks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/stocks');
            setStocks(response.data);
            toast.success("Stocks updated successfully");
        } catch (error) {
            console.error('Error fetching stocks:', error);
            toast.error("Failed to fetch stocks");
        } finally {
            setLoading(false);
        }
    };

    const fetchWallet = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/portfolio/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWallet(response.data.wallet);
        } catch (error) {
            console.error('Error fetching wallet:', error);
            toast.error("Failed to fetch wallet balance");
        }
    };

    const handlePurchase = async (stockId) => {
        try {
            const quantity = parseInt(purchaseQuantity[stockId]) || 1;
            
            if (quantity <= 0) {
                toast.error('Please enter a valid quantity');
                return;
            }

            const stock = stocks.find(s => s._id === stockId);
            const totalCost = stock.price * quantity;

            if (wallet.balance < totalCost) {
                toast.error('Insufficient balance for this purchase');
                return;
            }

            if (quantity > stock.maxStocks) {
                toast.error('Quantity exceeds available stocks');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/stocks/purchase',
                {
                    userId: user.id,
                    stockId,
                    quantity
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.message === 'Purchase successful') {
                toast.success('Stock purchased successfully!');
                setPurchaseQuantity(prev => ({
                    ...prev,
                    [stockId]: ''
                }));
                fetchStocks();
                fetchWallet();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error purchasing stock';
            toast.error(errorMessage);
            console.error('Purchase error details:', error.response?.data);
        }
    };

    const filteredStocks = stocks
        .filter(stock => 
            stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortMethod) {
                case 'price-asc':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-desc':
                    return parseFloat(b.price) - parseFloat(a.price);
                default:
                    return 0;
            }
        });

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] text-white p-8">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-6"
            >
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Stock Purchase
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchStocks}
                        className="p-2 bg-purple-900/20 rounded-lg hover:bg-purple-800/30 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                        <input
                            type="text"
                            placeholder="Search stocks..."
                            className="w-full pl-10 pr-4 py-2 bg-purple-900/20 rounded-lg border border-purple-800/50 focus:outline-none focus:border-purple-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                        <select
                            className="w-full pl-10 pr-4 py-2 bg-purple-900/20 rounded-lg border border-purple-800/50 focus:outline-none focus:border-purple-500"
                            value={sortMethod}
                            onChange={(e) => setSortMethod(e.target.value)}
                        >
                            <option value="default">Default Sorting</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                        </select>
                    </div>
                </div>

                {wallet && (
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-purple-900/20 p-4 rounded-lg border border-purple-800/50"
                    >
                        <div className="flex items-center space-x-2">
                            <DollarSign className="text-purple-400" />
                            <span className="text-purple-300">Available Balance:</span>
                            <span className="text-white font-bold">${wallet.balance.toFixed(2)}</span>
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStocks.map((stock) => (
                            <motion.div
                                key={stock._id}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold text-white">{stock.companyName}</h2>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                                        {stock.sector}
                                    </span>
                                </div>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-purple-300">Price:</span>
                                        <div className="flex items-center">
                                            <span className="text-white font-bold">${parseFloat(stock.price).toFixed(2)}</span>
                                            {stock.priceChange > 0 ? (
                                                <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-500 ml-2" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-purple-300">Available:</span>
                                        <span className="text-white">{stock.maxStocks}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        className="w-full px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-800/50 focus:outline-none focus:border-purple-500"
                                        value={purchaseQuantity[stock._id] || ''}
                                        onChange={(e) => setPurchaseQuantity({
                                            ...purchaseQuantity,
                                            [stock._id]: parseInt(e.target.value)
                                        })}
                                    />
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors
                                            ${(!wallet || wallet.balance < (stock.price * (purchaseQuantity[stock._id] || 1)))
                                            ? 'bg-purple-900/20 text-purple-500 cursor-not-allowed'
                                            : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                                        onClick={() => handlePurchase(stock._id)}
                                        disabled={!wallet || wallet.balance < (stock.price * (purchaseQuantity[stock._id] || 1))}
                                    >
                                        Purchase
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                
                <ToastContainer 
                    position="top-right"
                    theme="dark"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </motion.div>
        </div>
    );
};

export default Purchase;