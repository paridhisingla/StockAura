import React from 'react'
import Navbar from '../Basic/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../Basic/Footer'
function Layout() {
  return (
    <>
      <Navbar/>
      <Outlet/>
      <Footer/>
    </>
  )
}

export default Layout
