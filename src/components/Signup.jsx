import React, { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import '../utils'
import { handleFailure, handleSuccess } from '../utils'
const Signup = ({ setAuthenticated }) => {

    const [signupinfo, setSignupInfo] = useState({
        name: '',
        email : '',
        password : ''
    })
    const navigate = useNavigate()
    const handleChange = (e) => {
        const {name, value} = e.target;
        const copySignupInfo = {...signupinfo};
        copySignupInfo[name] = value
        setSignupInfo(copySignupInfo)
    };

    // console.log(signupinfo);
    const handleSubmit = async (e) => {
        e.preventDefault()
        const {name, email, password} = signupinfo
        if(!name || !email || !password){
            return handleFailure(" madarchod ho  tum")
        }
        try{
            const url = "http://localhost:8080/auth/signup"
            const response = await fetch(url, {
                method : "POST",
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(signupinfo)
            })
    
            const result = await response.json();
            const { success , message, jwtToken, error } = result; // ❌ remove name

            if (success) { 
              handleSuccess(message);
              localStorage.setItem('token', jwtToken);

              // ✅ Save the name entered during signup
              localStorage.setItem('loggedInUser', signupinfo.name);

              setAuthenticated(true);
              setTimeout(() => {
                  navigate('/home');
              }, 500);
            } else {
              handleFailure(message || "Something went wrong");
            }

        }catch(err){
            handleFailure(err)
        }
    }

  return (
    <div className="auth-container">
        <div className="auth-form">
            <h2>Create an Account</h2>
           
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                <input type="text" name="name" placeholder="Full Name"  
                onChange={handleChange}/>
                </div>
                <div className="input-group">
                <input type="email" name="email" placeholder="Email"  
                onChange={handleChange}/>
                </div>
                <div className="input-group">
                <input type="password" name="password" placeholder="Password"  
                onChange={handleChange}/>
                </div>
                <button type="submit" className="btn-primary full-width" >
                    Sign Up
                </button>
            </form>
            <p className="auth-switch">Already have an account? <span> <Link to ="/login"> Login</Link> </span></p>
        </div>
    </div>
  )
}

export default Signup


