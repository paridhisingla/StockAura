import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.svg';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'black' }}>
      <Spline scene="https://prod.spline.design/xzGbgnYJDXq4Osdj/scene.splinecode" style={{ position: 'absolute', bottom: '-10px', left: 0, width: '100%', height: '100%' }} />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{ position: 'absolute', top: '20%', left: '10%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#fff', width: '80%' }} // Positioning of text container
      >
        <motion.img
          src={logo}
          alt="Logo"
          style={{ width: '100px', marginBottom: '20px', position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)' }} // Positioning of logo
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
        <motion.h1
          style={{ fontSize: '48px', margin: '0', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', marginTop: '180px' }} // Positioning of main text
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          StockAura-Analyzer
        </motion.h1>
        <motion.p
          style={{ fontSize: '24px', margin: '10px 0', fontFamily: 'Arial, sans-serif', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', marginTop: '60px' }} // Positioning of subtext
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          Trade Smarter, Invest Wiser
        </motion.p>
      </motion.div>
      <motion.button
        onClick={() => navigate('/home')}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '45%', // Positioning of "Get Started" button
          transform: 'translateX(-50%)',
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#6200ea',
          color: '#fff',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#3700b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#6200ea'}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.5 }}
      >
        Get Started
      </motion.button>
    </div>
  );
}