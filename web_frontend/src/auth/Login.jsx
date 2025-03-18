import React from 'react';
import { Link } from 'react-router-dom';    
const Login = () => {
    return (
        <div class="login-container d-flex justify-content-center align-items-center" id="login-page">
            <div class="login-form col-md-4 col-lg-3 col-sm-6 col-11">
                <div class="text-center mb-4">
                    <img src="/api/placeholder/150/150" alt="EduManage Logo" class="login-logo"/>
                    <h2 class="text-primary">EduManage</h2>
                    <p class="text-muted">Educational Management System</p>
                </div>
                <form id="login-form">
                    <div class="mb-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-user"></i></span>
                            <input type="text" class="form-control" id="username" placeholder="Username"/>
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-lock"></i></span>
                            <input type="password" class="form-control" id="password" placeholder="Password"/>
                        </div>
                    </div>
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="remember"/>
                        <label class="form-check-label" for="remember">Remember me</label>
                    </div>
                    <Link to={'/Dashboard'}>    
                    <div class="d-grid">
                    <button type="button" class="btn btn-primary" onclick="login()">Login</button>
                    </div>
                    </Link>
                    <div class="text-center mt-3">
                        <a href="#" class="text-decoration-none">Forgot password?</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
