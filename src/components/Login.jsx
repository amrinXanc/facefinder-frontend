import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleFailure, handleSuccess } from '../utils'
import API_BASE_URL from "../config";
const Login = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const [loginInfo, setLoginInfo] = useState({
     email : '',
    password : ''
  })

  const handleChange = (e) =>{
    const {name, value} = e.target;
    const copyLoginInfo = {...loginInfo};
    copyLoginInfo[name] = value
    setLoginInfo(copyLoginInfo)
  }
  const handleSubmit = async (e)=>{
    e.preventDefault();
    const { email, password} =  loginInfo
    if( !email){
        return handleFailure(" please enter your email address ")
    }
    else if(!password){
        return handleFailure(" please enter the password ")
    }
    try{
          const url = `${API_BASE_URL}/auth/login`;
          const response = await fetch(url, {
              method : "POST",
              headers : {
                  'Content-Type' : 'application/json'
              },
              body : JSON.stringify(loginInfo)
          })
  
          const result = await response.json()
          const {success , message, jwtToken, name, error} = result;
          if (success) { 
            handleSuccess(message);
            localStorage.setItem('token', jwtToken);
            localStorage.setItem('loggedInUser', name);
            setAuthenticated(true);
            setTimeout(() => {
                navigate('/home');
            }, 500);
            } else {
                handleFailure(message || "Something went wrong");
            }
          console.log(result)
          
    }catch(err){
        handleFailure(err);
    }

  }
  return (
     <div>
        <div className="auth-container">
            <div className="auth-form">
                <h2>Login to Your Account</h2>
               
                <form onSubmit={handleSubmit} > 
                <div className="input-group">
                    <input type="email" name="email" placeholder="Email" onChange={handleChange}
                    value={loginInfo.email}
                     />
                </div>
                <div className="input-group">
                    <input type="password" name="password" placeholder="Password"  
                    onChange={handleChange}
                    value={loginInfo.password}/>
                </div>
                <button type="submit" className="btn-primary full-width" >
                Login
                </button>
                
                </form>
                
                <p className="auth-switch">Don't have an account? <span> <Link to ="/signup"> Sign Up</Link> </span></p>
                <p className="auth-switch">
                Forgot your password? <span><Link to="/forgot-password"> Reset Here</Link></span>
                </p>
            </div>
        </div>
      </div>
  )
}

export default Login
