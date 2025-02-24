"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Download,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function StockList() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSector, setFilterSector] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/stocks");
        setStocks(response.data);
    } catch (error) {
        console.error("Error fetching stocks:", error);
        toast.error("Error fetching stocks");
        setStocks([]); 
    } finally {
        setLoading(false);
    }
};

  const handleEdit = async (stock) => {
    try {
       
        const response = await axios.get(`http://localhost:5000/api/stocks/${stock._id}`);
        if (response.data) {
            navigate(`/admin/stocks/add?id=${stock._id}`);
        }
    } catch (error) {
        console.error("Error:", error);
        toast.error("Stock not found or has been deleted");
        
        fetchStocks();
    }
};

const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this stock?")) {
        try {
            await axios.delete(`http://localhost:5000/api/stocks/${id}`);
            toast.success("Stock deleted successfully");
            
            setStocks(prevStocks => prevStocks.filter(stock => stock._id !== id));
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error deleting stock");
            
            fetchStocks();
        }
    }
};


  const handleStatusChange = async (id, newStatus) => {
    try {
        // First verify if the stock exists
        const response = await axios.patch(`http://localhost:5000/api/stocks/${id}`, {
            status: newStatus
        });
        
        if (response.data) {
            toast.success("Status updated successfully");
            // Update the local state
            setStocks(prevStocks => 
                prevStocks.map(stock => 
                    stock._id === id ? { ...stock, status: newStatus } : stock
                )
            );
        }
    } catch (error) {
        console.error("Error updating status:", error);
        const errorMessage = error.response?.data?.message || "Error updating status";
        toast.error(errorMessage);
        
        // Refresh the stock list to ensure data consistency
        fetchStocks();
    }
};

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle numeric values
    if (sortConfig.key === 'price' || sortConfig.key === 'marketCap') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredStocks = sortedStocks.filter(stock => {
    const matchesSearch = stock.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === "all" || stock.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  const exportToCSV = () => {
    const headers = ['Company Name', 'Price', 'Market Cap', 'Sector', 'Status', 'Description'];
    const csvData = filteredStocks.map(stock => [
      stock.companyName,
      stock.price,
      stock.marketCap,
      stock.sector,
      stock.status,
      stock.description
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stocks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-400">Stock List</h1>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/stocks/add')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Stock</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchStocks}
            className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-purple-900/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <select
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          className="px-4 py-2 bg-purple-900/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Sectors</option>
          <option value="technology">Technology</option>
          <option value="finance">Finance</option>
          <option value="healthcare">Healthcare</option>
          <option value="consumer">Consumer</option>
          <option value="energy">Energy</option>
        </select>
      </div>

      {/* Stocks Table */}
      <div className="bg-purple-900/20 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-900/40">
                <th 
                  className="p-4 text-left text-purple-200 cursor-pointer"
                  onClick={() => handleSort('companyName')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Company</span>
                    <SortIcon column="companyName" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-purple-200 cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Price</span>
                    <SortIcon column="price" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-purple-200 cursor-pointer"
                  onClick={() => handleSort('marketCap')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Market Cap</span>
                    <SortIcon column="marketCap" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-purple-200 cursor-pointer"
                  onClick={() => handleSort('sector')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Sector</span>
                    <SortIcon column="sector" />
                  </div>
                </th>
                <th className="p-4 text-left text-purple-200">Status</th>
                <th className="p-4 text-left text-purple-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-white">
                    Loading...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-white">
                    No stocks found
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <motion.tr
                    key={stock._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-purple-800 hover:bg-purple-900/30"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{stock.companyName}</div>
                        <div className="text-sm text-purple-300">{stock.description}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="text-white">${parseFloat(stock.price).toFixed(2)}</span>
                        {stock.priceChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      ${(parseFloat(stock.marketCap) / 1000000).toFixed(2)}M
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={stock.status}
                        onChange={(e) => handleStatusChange(stock._id, e.target.value)}
                        className="bg-transparent text-white border border-purple-500 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(stock)}
                          className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(stock._id)}
                          className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ToastContainer position="top-right" theme="dark" />
    </div>
  )
}