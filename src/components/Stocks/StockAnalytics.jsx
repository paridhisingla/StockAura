"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"

export default function StockAnalytics() {
  const [stockData, setStockData] = useState([])
  const [sectorData, setSectorData] = useState([])
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE']

  useEffect(() => {
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stocks")
      const stocks = response.data

      setStockData(stocks.map(stock => ({
        name: stock.companyName,
        price: parseFloat(stock.price),
        marketCap: parseFloat(stock.marketCap) / 1000000,
        volume: Math.random() * 1000000 
      })))

      const sectors = {}
      stocks.forEach(stock => {
        sectors[stock.sector] = (sectors[stock.sector] || 0) + parseFloat(stock.marketCap)
      })
      setSectorData(Object.entries(sectors).map(([name, value]) => ({ name, value })))
    } catch (error) {
      console.error("Error fetching stock data:", error)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-purple-400">Stock Analytics</h1>

      <ChartCard title="Price vs Market Cap Analysis">
        <ResponsiveContainer width="100%" height={400}>
          <RechartsLineChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ stroke: '#8884d8', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="marketCap"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ stroke: '#82ca9d', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Trading Volume Distribution">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="volume" fill="#8884d8">
              {stockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sector Market Cap Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Market Trends">
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
      </div>
    </div>
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