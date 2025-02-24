"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LineChart,
  PlusCircle,
  List
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: <LayoutDashboard />, label: "Overview", path: "/admin" },
    {
      icon: <TrendingUp />,
      label: "Stocks",
      path: "/admin/stocks",
      subItems: [
        { icon: <LineChart />, label: "Analytics", path: "/admin/stocks/analytics" },
        { icon: <PlusCircle />, label: "Add Stock", path: "/admin/stocks/add" },
        { icon: <List />, label: "Stock List", path: "/admin/stocks/list" }
      ]
    },
    { icon: <Users />, label: "Users", path: "/admin/users" },
    { icon: <Settings />, label: "Settings", path: "/admin/settings" },
    { icon: <HelpCircle />, label: "Help", path: "/admin/help" }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <motion.div
      initial={{ width: "240px" }}
      animate={{ width: isCollapsed ? "80px" : "240px" }}
      className="bg-purple-900 min-h-screen p-4 relative"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-purple-500 p-1 rounded-full text-white"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex items-center mb-8">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white text-xl font-bold ml-2"
          >
            StockAura
          </motion.span>
        )}
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <div key={index}>
            <motion.a
              href={item.path}
              className={`flex items-center space-x-2 text-white p-3 rounded-lg hover:bg-purple-800 transition-colors ${
                isActive(item.path) ? "bg-purple-800" : ""
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-purple-300">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </motion.a>
            
            {!isCollapsed && item.subItems && (
              <div className="ml-8 space-y-2 mt-2">
                {item.subItems.map((subItem, subIndex) => (
                  <motion.a
                    key={subIndex}
                    href={subItem.path}
                    className={`flex items-center space-x-2 text-white p-2 rounded-lg hover:bg-purple-800 transition-colors ${
                      isActive(subItem.path) ? "bg-purple-800" : ""
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-purple-300">{subItem.icon}</span>
                    <span>{subItem.label}</span>
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <motion.button
        onClick={logout}
        className="flex items-center space-x-2 text-white p-3 rounded-lg hover:bg-purple-800 transition-colors absolute bottom-4 w-[calc(100%-2rem)]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-purple-300">
          <LogOut />
        </span>
        {!isCollapsed && <span>Logout</span>}
      </motion.button>
    </motion.div>
  )
}