"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import {
  LineChart,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity
} from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"

export default function Overview() {
  const [stockStats, setStockStats] = useState({
    totalStocks: 0,
    averagePrice: 0,
    totalMarketCap: 0,
    priceChange: 0
  })
  const [stockData, setStockData] = useState([])

  useEffect(() => {
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stocks")
      const stocks = response.data

      const stats = {
        totalStocks: stocks.length,
        averagePrice: stocks.reduce((acc, stock) => acc + parseFloat(stock.price), 0) / stocks.length,
        totalMarketCap: stocks.reduce((acc, stock) => acc + parseFloat(stock.marketCap), 0),
        priceChange: 2.5 
      }
      setStockStats(stats)

      const chartData = stocks.map(stock => ({
        name: stock.companyName,
        price: parseFloat(stock.price),
        marketCap: parseFloat(stock.marketCap) / 1000000,
        profit: Math.random() * 100 - 50 
      }))
      setStockData(chartData)
    } catch (error) {
      console.error("Error fetching stock data:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-purple-400">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Stocks"
          value={stockStats.totalStocks}
          icon={<LineChart className="text-purple-400" />}
          trend={+15}
        />
        <StatsCard
          title="Average Price"
          value={`$${stockStats.averagePrice.toFixed(2)}`}
          icon={<DollarSign className="text-purple-400" />}
          trend={-2.5}
        />
        <StatsCard
          title="Total Market Cap"
          value={`$${(stockStats.totalMarketCap / 1000000000).toFixed(2)}B`}
          icon={<BarChart className="text-purple-400" />}
          trend={+8.3}
        />
        <StatsCard
          title="24h Change"
          value={`${stockStats.priceChange}%`}
          icon={<Activity className="text-purple-400" />}
          trend={stockStats.priceChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Market Overview">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stockData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Performance Analysis">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ stroke: '#82ca9d', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-purple-900/20 p-6 rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-200">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        </div>
        {icon}
      </div>
      <div className="mt-4 flex items-center">
        {trend > 0 ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`ml-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(trend)}%
        </span>
      </div>
    </motion.div>
  )
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-purple-900/20 p-6 rounded-lg shadow-lg"
    >
      <h3 className="text-xl font-bold text-purple-400 mb-4">{title}</h3>
      {children}
    </motion.div>
  )
}