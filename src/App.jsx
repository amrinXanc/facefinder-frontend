import { useEffect, useState } from 'react'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";   
import './App.css'
import Home from './components/Home'
import Signup from './components/Signup'
import Login from './components/Login'
import Footer from './components/Footer'
import Hero from './components/Hero';
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  const[isAuthenticated, setAuthenticated] = useState(false)
  useEffect( ()=> {
      const token = localStorage.getItem("token")
      if(token){
        setAuthenticated(true);
      }else{
        setAuthenticated(false)
      }
  }, [])
  const PrivateRoute = ({element})  => {
    return isAuthenticated ? element : <Navigate to = "/hero"/>
  }
  const PublicRoute = ({element}) =>{
    return !isAuthenticated ? element : <Navigate to = "/home" />
  }
  return (
    <div className='App'>
      <Routes>
          <Route path="/forgot-password" element={ <PublicRoute element = {<div className="main-content"><ForgotPassword /></div>} />} />
          <Route path="/reset-password/:token" element={ <PublicRoute element={<div className="main-content"><ResetPassword /></div>} />} />
          <Route path="/hero" element={<PublicRoute element={<div className="main-content"><Hero /></div>} />} />
          <Route path='/login' element={<PublicRoute element={<div className="main-content"><Login setAuthenticated={setAuthenticated} /></div>} />} />
          <Route path='/signup' element={<PublicRoute element={<div className="main-content"><Signup setAuthenticated={setAuthenticated} /></div>} />} />
          <Route path='/home' element={<PrivateRoute element={<Home setAuthenticated={setAuthenticated} />} />} />
          <Route path='/' element={<Navigate to='/hero' />} />
      </Routes>
      <Footer />
      <ToastContainer position="top-right" autoClose={1000} />
    </div>
  )
}

export default App
