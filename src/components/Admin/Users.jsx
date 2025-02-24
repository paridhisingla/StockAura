import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaWallet, FaHistory, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const [walletResponse, portfolioResponse, transactionsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/wallet/${userId}`),
        axios.get(`http://localhost:5000/api/portfolio/${userId}`),
        axios.get(`http://localhost:5000/api/transactions/${userId}`)
      ]);

      setUserDetails({
        wallet: walletResponse.data,
        portfolio: portfolioResponse.data,
        transactions: transactionsResponse.data
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    await fetchUserDetails(user._id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 bg-purple-900/20 rounded-lg border border-purple-800/50 focus:outline-none focus:border-purple-500 text-white placeholder-purple-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentUsers.map(user => (
              <motion.div
                key={user._id}
                whileHover={{ scale: 1.01 }}
                className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-500/20 p-3 rounded-full">
                      <FaUser className="text-purple-300 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">{user.username}</h2>
                      <p className="text-purple-300">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-purple-300">
                    <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg ${currentPage === 1 ? 'text-purple-600' : 'text-purple-300 hover:text-purple-100'}`}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </motion.button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <motion.button
                    key={index + 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === index + 1
                        ? 'bg-purple-500 text-white'
                        : 'text-purple-300 hover:text-purple-100'
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg ${
                    currentPage === totalPages ? 'text-purple-600' : 'text-purple-300 hover:text-purple-100'
                  }`}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </motion.button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {selectedUser && userDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-[#1a1a2e] rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">{selectedUser.username}'s Details</h2>
                  <button
                    onClick={closeModal}
                    className="text-purple-300 hover:text-purple-100"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/50">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">User Information</h3>
                    <p className="text-white">Email: {selectedUser.email}</p>
                    <p className="text-white">Phone: {selectedUser.phoneNumber}</p>
                    <p className="text-white">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/50">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Wallet Information</h3>
                    <p className="text-white">Balance: ${userDetails.wallet?.balance.toFixed(2) || '0.00'}</p>
                    <p className="text-white">Total Transactions: {userDetails.transactions?.length || 0}</p>
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/50 mb-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Portfolio Holdings</h3>
                  <div className="space-y-4">
                    {userDetails.portfolio?.stocks?.length > 0 ? (
                      userDetails.portfolio.stocks.map((stock, index) => (
                        <div key={index} className="flex justify-between items-center border-b border-purple-800/30 pb-2">
                          <div>
                            <p className="text-white font-semibold">{stock.stockId.companyName}</p>
                            <p className="text-purple-300">Quantity: {stock.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white">Purchase Price: ${stock.purchasePrice.toFixed(2)}</p>
                            <p className="text-purple-300">Current Value: ${(stock.quantity * stock.stockId.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-purple-300 text-center">No stocks in portfolio</p>
                    )}
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/50">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Transaction History</h3>
                  <div className="space-y-4">
                    {userDetails.transactions?.length > 0 ? (
                      userDetails.transactions.map((transaction, index) => (
                        <div key={index} className="flex justify-between items-center border-b border-purple-800/30 pb-2">
                          <div>
                            <p className="text-white font-semibold">{transaction.stockId.companyName}</p>
                            <p className="text-purple-300">
                              {new Date(transaction.date).toLocaleDateString()} at{' '}
                              {new Date(transaction.date).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'buy' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {transaction.type === 'buy' ? '-' : '+'}${(transaction.price * transaction.quantity).toFixed(2)}
                            </p>
                            <p className="text-purple-300">
                              {transaction.quantity} shares @ ${transaction.price}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-purple-300 text-center">No transaction history</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

export default Users;