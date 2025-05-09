import React, { useState } from 'react';
import { replace, useNavigate } from 'react-router-dom';    
import axios from 'axios';
import ToastMessage from '../ToastMessage'; 
const Login = () => {
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const [notification,setNotification]=useState({message:"",type:""});
    const [isVisible,setVisible]=useState(false);
    const Navigate=useNavigate();
    const handleInputChange = (e) => {
        if (!e || !e.target) {
          console.error("Invalid event object");
          return;
        }
      
        const { id, value } = e.target;
        
        if (!id) {
          console.error("Event target has no ID");
          return;
        }
      
        switch (id) {
          case "username":
            setUsername(value || ""); 
            break;
          case "password":
            setPassword(value || "");
            break;
          default:
            console.warn(`Unknown input field: ${id}`);
        }
      };
    const handleAuthentication=async(e)=>
    {
        try
        {
        e.preventDefault();
        const response = await axios.post('http://localhost:5000/auth/login', {
            username,
            password
          });
        if(response.data.type==="success")
        {
            
            localStorage.setItem("AuthToken", response.data.token);
            const decodedToken = JSON.parse(atob(response.data.token.split('.')[1]));
            const { firstname, lastname} = decodedToken;
            setNotification({ message: `Welcome, ${firstname} ${lastname}!`, type: "success" });
            if(localStorage.getItem("AuthToken"))
                {
             Navigate("/dashboard");
                } 
            else
            {
                Navigate("/login",replace);
            }
        
        }
        else if(response.data.type==="error")
        {
            setNotification({message:response.data.message,type:"error"});
        }
        else
        {
            setNotification({message:"Invalid username or password",type:"error"});
        }
    }
    catch(error)
    {
        console.error("Error during authentication:", error);
        setNotification({message:"Login failed:" +error.message,type:"error"});
    }
    }
    const showPassword = (e) => {
        e.preventDefault();
        const passwordField = document.getElementById("password");
        if (passwordField.type === "password") {
            passwordField.type = "text";
            setVisible(true);
        } else {
            passwordField.type = "password";
            setVisible(false);
        }
    };
    return (
        <>
       {notification.message && <ToastMessage message={notification.message} type={notification.type} />}
        <div className="login-container d-flex justify-content-center align-items-center" id="login-page">
            <div className="login-form col-md-4 col-lg-3 col-sm-6 col-11">
                <div className="text-center mb-4">
                    <img src="/assets/img/logo/logo-app.jpg" alt="EduManage Logo" className="login-logo"/>
                    <h2 className="text-primary">EduManage</h2>
                    <p className="text-muted">Educational Curriculum Management System</p>
                </div>
                <form id="login-form" onSubmit={handleAuthentication}>
                    <div className="mb-3">
                        <div className="input-group">
                            <span className="input-group-text"><i className="fas fa-user"></i></span>
                            <input type="text" name='username' onChange={handleInputChange} className="form-control" id="username" placeholder="Username"/>
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="input-group">
                            <span className="input-group-text"><i className="fas fa-lock"></i></span>
                            <input type="password" name='password' id="password" onChange={handleInputChange} className="form-control" placeholder="Password"/>
                            <button className="btn btn-sm btn-outline-info" onClick={showPassword}>
                            <i className={isVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i></button>
                        </div>
                        
                    </div>
                    <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="remember"/>
                        <label className="form-check-label" htmlFor="remember">Remember me</label>
                    </div>
                       
                    <div className="d-grid">
                    <button type="submit" className="btn btn-primary">Login</button>
                    </div>
                   
                    <div className="text-center mt-3">
                        <a href="#" className="text-decoration-none">Forgot password?</a>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default Login;
