import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaWallet, FaChartLine, FaHistory, FaArrowUp, FaArrowDown, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const { user, token } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [sellQuantities, setSellQuantities] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);

  useEffect(() => {
    if (user && token) {
      Promise.all([
        fetchPortfolioData(),
        fetchTransactionHistory(),
        fetchPortfolioHistory()
      ]).finally(() => setLoading(false));
    }
  }, [user, token]);

  const fetchPortfolioData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/portfolio/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolio(response.data.portfolio);
      setWallet(response.data.wallet);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error("Failed to fetch portfolio data");
    }
  };



  const fetchTransactionHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/transactions/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(response.data);
      calculateTotalProfitLoss(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to fetch transaction history");
    }
  };

  const fetchPortfolioHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/portfolio/history/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const totalPortfolioValue = portfolio?.stocks.reduce((total, stock) => {
        return total + (stock.quantity * stock.stockId.price);
      }, 0) || 0;

      const currentValue = totalPortfolioValue + (wallet?.balance || 0);

      const today = new Date();
      const currentEntry = {
        date: today,
        totalValue: currentValue
      };

      const historicalData = response.data
        .filter(item => item && item.totalValue !== null)
        .map(item => ({
          date: new Date(item.date),
          totalValue: parseFloat(item.totalValue)
        }));

      const allData = currentValue > 0 
        ? [...historicalData, currentEntry]
        : historicalData;

      const sortedData = allData.sort((a, b) => a.date - b.date);
      
      console.log('Portfolio value calculation:', {
        stocksValue: totalPortfolioValue,
        walletBalance: wallet?.balance,
        totalValue: currentValue
      });

      setPortfolioHistory(sortedData);
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
      toast.error("Failed to fetch portfolio history");
    }
  };

  const calculateTotalProfitLoss = (transactions) => {
    let profit = 0;
    let loss = 0;
    
    transactions.forEach(transaction => {
      const difference = transaction.currentPrice - transaction.purchasePrice;
      if (difference > 0) {
        profit += difference * transaction.quantity;
      } else {
        loss += Math.abs(difference) * transaction.quantity;
      }
    });

    setTotalProfit(profit);
    setTotalLoss(loss);
  };

  const handleDeposit = async () => {
    try {
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        toast.error("Please enter a valid deposit amount");
        return;
      }
      
      await axios.post('http://localhost:5000/api/wallet/deposit', {
        userId: user.id,
        amount: parseFloat(depositAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Deposit successful!");
      fetchPortfolioData();
      setDepositAmount('');
    } catch (error) {
      console.error('Error depositing funds:', error);
      toast.error("Failed to process deposit");
    }
  };

  const handleSell = async (stockId, currentPrice) => {
    try {
      const quantity = parseInt(sellQuantities[stockId]) || 0;
      
      if (quantity <= 0) {
        toast.error('Please enter a valid quantity to sell');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/stocks/sell',
        {
          userId: user.id,
          stockId,
          quantity,
          price: currentPrice
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.message === 'Sale successful') {
        toast.success('Stock sold successfully!');
        setSellQuantities(prev => ({
          ...prev,
          [stockId]: ''
        }));
        Promise.all([
          fetchPortfolioData(),
          fetchTransactionHistory(),
          fetchPortfolioHistory()
        ]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error selling stock';
      toast.error(errorMessage);
      console.error('Error selling stock:', error);
    }
  };



  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Company', 'Type', 'Quantity', 'Price', 'Total'];
      const csvData = transactions.map(transaction => [
        new Date(transaction.date).toLocaleString(),
        transaction.stockId.companyName,
        transaction.type,
        transaction.quantity,
        transaction.price,
        (transaction.price * transaction.quantity).toFixed(2)
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Transactions exported successfully!');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  const portfolioChartData = {
    labels: portfolioHistory.map(item => 
      new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    ),
    datasets: [{
      label: 'Portfolio Value ($)',
      data: portfolioHistory.map(item => item.totalValue),
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgb(147, 51, 234)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(147, 51, 234)',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(147, 51, 234, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Value: $${context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#fff',
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    }
  };

  useEffect(() => {
    if (portfolio || wallet) {
      fetchPortfolioHistory();
    }
  }, [portfolio, wallet]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] text-white p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Profile Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-300">User Information</h2>
            <div className="space-y-2 text-purple-200">
              <p>Username: {user.username}</p>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phoneNumber}</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
              <FaWallet className="inline mr-2" />
              Wallet
            </h2>
            <p className="text-2xl font-bold text-green-400 mb-4">
              Balance: ${wallet?.balance.toFixed(2) || 0}
            </p>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Deposit Amount"
                className="flex-1 px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-800/50 focus:outline-none focus:border-purple-500 text-white"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                onClick={handleDeposit}
              >
                Deposit
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-purple-300">Total Portfolio Value</h3>
            <p className="text-2xl font-bold text-white">
              ${portfolio?.totalValue?.toFixed(2) || '0.00'}
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-green-400">
              <FaArrowUp className="inline mr-2" />
              Total Profit
            </h3>
            <p className="text-2xl font-bold text-green-400">
              ${totalProfit.toFixed(2)}
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-red-400">
              <FaArrowDown className="inline mr-2" />
              Total Loss
            </h3>
            <p className="text-2xl font-bold text-red-400">
              ${totalLoss.toFixed(2)}
            </p>
          </motion.div>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold mb-6 text-purple-300">Portfolio Performance</h2>
          <div className="h-96">
            {portfolioHistory.length > 0 ? (
              <Line data={portfolioChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-purple-300">No portfolio history available</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold mb-6 text-purple-300">
            <FaChartLine className="inline mr-2" />
            Portfolio Holdings
          </h2>
          <div className="space-y-6">
            {portfolio?.stocks.map((item) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-purple-800/30 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.stockId.companyName}
                    </h3>
                    <p className="text-purple-300">
                      Owned: {item.quantity} shares
                    </p>
                    <p className="text-purple-300">
                      Purchase Price: ${item.purchasePrice.toFixed(2)}
                    </p>
                    <p className="text-purple-300">
                      Current Price: ${item.stockId.price}
                    </p>
                    <p className={`font-semibold ${
                      item.stockId.price > item.purchasePrice ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Profit/Loss: ${((item.stockId.price - item.purchasePrice) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="number"
                      placeholder="Quantity to sell"
                      className="px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-800/50 focus:outline-none focus:border-purple-500 text-white"
                      value={sellQuantities[item.stockId._id] || ''}
                      onChange={(e) => setSellQuantities({
                        ...sellQuantities,
                        [item.stockId._id]: e.target.value
                      })}
                      max={item.quantity}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      onClick={() => handleSell(item.stockId._id, item.stockId.price)}
                      disabled={!sellQuantities[item.stockId._id] || sellQuantities[item.stockId._id] > item.quantity}
                    >
                      Sell
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {(!portfolio?.stocks || portfolio.stocks.length === 0) && (
              <p className="text-purple-300 text-center">
                No stocks in portfolio
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-purple-900/20 rounded-lg border border-purple-800/50 p-6 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-purple-300">
              <FaHistory className="inline mr-2" />
              Transaction History
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </motion.button>
          </div>

          <div className="space-y-4">
            {currentTransactions.map((transaction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-purple-800/30 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-white">{transaction.stockId.companyName}</h3>
                    <p className="text-sm text-purple-300">
                      {new Date(transaction.date).toLocaleDateString()} at{' '}
                      {new Date(transaction.date).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-purple-300">
                      Type: {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'buy' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {transaction.type === 'buy' ? '-' : '+'}${(transaction.price * transaction.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-300">
                      {transaction.quantity} shares @ ${transaction.price}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {(!transactions || transactions.length === 0) && (
              <p className="text-purple-300 text-center">
                No transaction history
              </p>
            )}
          </div>

          {transactions.length > transactionsPerPage && (
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
        </motion.div>

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

export default Profile;