import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {initSocketConnection, getSocket} from "./utils/api2";
import AppRoutes from './components/Routes.jsx'  
import {BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from './context/DataProvider.jsx';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function App() {
  const [count, setCount] = useState(0)

  // useEffect(()=>{
  //   const soc = getSocket();
  //   soc.onAny((event, ...args) => {
  //     console.log(event, args);
  //   });

  //   soc.on("error",(data)=>{
  //     toast.error(data.message || "not found")
  //   })

  // },[])
  
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
