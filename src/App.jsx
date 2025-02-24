import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Home from "./components/Home/Home"

import Layout from "./components/Layout/Layout"
import "./App.css"

function App() {
  return (
    
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
           
            
            
          </Route>
        </Routes>
      </Router>
    
  )
}

export default App