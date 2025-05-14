import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Travels from './pages/Travels'
import Locations from './pages/Locations'
import Alerts from './pages/Alerts'
import Scanner from './pages/Scanner'

const App = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="travels" element={<Travels />} />
          <Route path="locations" element={<Locations />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>
      </Routes>
    </Box>
  )
}

export default App