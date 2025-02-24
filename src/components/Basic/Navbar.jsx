

import { useState } from "react"
import { Menu, X, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import logo from "../../assets/logo.svg"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignup = () => {
    navigate('/signup')
  }

  return (
    <nav className="bg-purple-900 fixed w-full z-50 top-0 left-0 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="StockAura Logo" className="w-8 h-8" />
          <span className="text-white text-2xl font-bold">StockAura</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#features" className="text-purple-200 hover:text-white">Features</a>
          <a href="#about" className="text-purple-200 hover:text-white">About</a>
          <a href="#pricing" className="text-purple-200 hover:text-white">Pricing</a>
          <a href="#testimonials" className="text-purple-200 hover:text-white">Testimonials</a>
          <a href="#cta" className="text-purple-200 hover:text-white">Get Started</a>
        </div>
        <div className="hidden md:flex space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">Hi, {user?.username}</span>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={handleLogin}
                className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
              >
                Login
              </button>
              <button 
                onClick={handleSignup}
                className="bg-transparent border-2 border-purple-400 text-purple-400 px-4 py-2 rounded-full hover:bg-purple-500 hover:text-white hover:border-purple-500"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-purple-800">
          <a href="#features" className="block px-4 py-2 text-purple-200 hover:text-white">Features</a>
          <a href="#about" className="block px-4 py-2 text-purple-200 hover:text-white">About</a>
          <a href="#pricing" className="block px-4 py-2 text-purple-200 hover:text-white">Pricing</a>
          <a href="#testimonials" className="block px-4 py-2 text-purple-200 hover:text-white">Testimonials</a>
          <a href="#cta" className="block px-4 py-2 text-purple-200 hover:text-white">Get Started</a>
          <div className="flex flex-col space-y-2 px-4 py-2">
            {isAuthenticated ? (
              <>
                <span className="text-white px-4 py-2">Hi, {user?.username}</span>
                <button 
                  onClick={logout}
                  className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLogin}
                  className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
                >
                  Login
                </button>
                <button 
                  onClick={handleSignup}
                  className="bg-transparent border-2 border-purple-400 text-purple-400 px-4 py-2 rounded-full hover:bg-purple-500 hover:text-white hover:border-purple-500"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar