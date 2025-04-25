import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from './context/AuthContext';

import Home from "./components/Home/Home"
import Login from "./components/Auth/Login"
import Signup from "./components/Auth/Signup"
import Layout from "./components/Layout/Layout"
import Admin from './components/Admin/Admin';
import Overview from './components/Admin/Overview';
import StockList from './components/Stocks/StockList';
import StockAnalytics from './components/Stocks/StockAnalytics';
import AddStock from './components/Stocks/AddStock';
import PrivateRoute from './Protected_Routes/PrivateRoute';
import Learning from "./components/Learning/Learning"

import "./App.css"
import Purchase from "./components/Purchase/Purchase";
import Profile from "./components/Profile/Profile";
import Users from "./components/Admin/Users";
function App() {
  return (
    
      <Router>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
           <Route path="/login" element={<Login />} />
           <Route path="/profile" element={<Profile />} />
           <Route path="/signup" element={<Signup />} />
            
            
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/learning" element={<Learning />} />
          </Route>

          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>}>
            <Route index element={<Overview />} />
            <Route path="stocks">
              <Route index element={<StockList />} />
              <Route path="analytics" element={<StockAnalytics />} />
              <Route path="add" element={<AddStock />} />
              <Route path="list" element={<StockList />} />
            </Route>
            <Route path="users" element={<Users />} />
          </Route>
        
        </Routes>
        </AuthProvider>
      </Router>
    
  )
}

export default App