import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppRoutes from './components/Routes.jsx'  
import {BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from './context/DataProvider.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function App() {
  const [count, setCount] = useState(0)

  return (
    
    <BrowserRouter>
      <DataProvider>
          <ToastContainer position="top-right" autoClose={2000} />
        <AppRoutes />
      </DataProvider>
    </BrowserRouter>
      
    
  )
}

export default App
