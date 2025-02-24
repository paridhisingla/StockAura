"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  Save,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react"

export default function AddStock() {
  const initialFormData = {
    companyName: "",
    description: "",
    price: "",
    maxStocks: "",
    sector: "technology",
    marketCap: "",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [stockId, setStockId] = useState(null)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const id = searchParams.get("id")
    if (id) {
      fetchStockDetails(id)
      setEditMode(true)
      setStockId(id)
    }
  }, [])

  const fetchStockDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/stocks/${id}`)
      setFormData(response.data)
    } catch (error) {
      toast.error("Error fetching stock details")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      if (name === "price" || name === "maxStocks") {
        if (newData.price && newData.maxStocks) {
          const marketCap = parseFloat(newData.price) * parseFloat(newData.maxStocks)
          newData.marketCap = marketCap.toString()
        }
      }
      
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/stocks/${stockId}`, {
          ...formData,
          updatedAt: new Date().toISOString()
        })
        toast.success("Stock updated successfully")
      } else {
        await axios.post("http://localhost:5000/api/stocks", formData)
        toast.success("Stock added successfully")
        setFormData(initialFormData) 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing request")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setFormData(initialFormData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-400">
          {editMode ? "Edit Stock" : "Add New Stock"}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-900/20 p-6 rounded-lg shadow-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-purple-200 mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            
            <div>
              <label className="block text-purple-200 mb-2">Stock Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded bg-gray-800 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            
            <div>
              <label className="block text-purple-200 mb-2">Maximum Stocks</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                <input
                  type="number"
                  name="maxStocks"
                  value={formData.maxStocks}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded bg-gray-800 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                  min="1"
                />
              </div>
            </div>

            
            <div>
              <label className="block text-purple-200 mb-2">Market Cap ($)</label>
              <input
                type="text"
                value={formData.marketCap ? `$${parseFloat(formData.marketCap).toLocaleString()}` : ""}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-purple-500"
                disabled
              />
            </div>

            
            <div>
              <label className="block text-purple-200 mb-2">Sector</label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              >
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="consumer">Consumer</option>
                <option value="energy">Energy</option>
              </select>
            </div>

            
            <div>
              <label className="block text-purple-200 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          
          <div>
            <label className="block text-purple-200 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows="4"
              required
            ></textarea>
          </div>

          
          <div className="flex space-x-4">
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? "Processing..." : (editMode ? "Update Stock" : "Add Stock")}</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Reset</span>
            </motion.button>
          </div>
        </form>

        
        <div className="mt-6 flex items-start space-x-2 text-purple-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
          <p className="text-sm">
            Market Cap is automatically calculated based on the stock price and maximum stocks.
            Make sure to provide accurate values for both fields.
          </p>
        </div>
      </motion.div>
      
      <ToastContainer position="top-right" theme="dark" />
    </div>
  )
}

