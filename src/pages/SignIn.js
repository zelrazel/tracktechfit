import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../styles/Signin.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_URL}api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
            mode: 'cors'
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Dispatch a custom event to notify all components about the authentication change
            window.dispatchEvent(new CustomEvent('auth-change', { 
                detail: { status: 'signed-in', user: data.user } 
            }));
            
            // Show success animation
            await Swal.fire({
                title: 'Welcome!',
                text: 'Successfully signed in',
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
                background: 'rgba(16, 16, 28, 0.95)',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    content: 'swal-custom-content',
                    icon: 'swal-custom-icon'
                },
                didOpen: () => {
                    Swal.getIcon().style.animation = 'none';
                    Swal.getIcon().style.border = 'none';
                    Swal.getIcon().style.backgroundColor = 'transparent';
                }
            });

            navigate('/');
        } else {
            Swal.fire({
                title: 'Sign In Failed',
                text: data.error || 'Invalid credentials',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonColor: '#00ff84',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    content: 'swal-custom-content'
                }
            });
        }
    } catch (error) {
        console.error('Login failed:', error);
        Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred',
            icon: 'error',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00ff84',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                content: 'swal-custom-content'
            }
        });
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1 className="signin-title">GYMFLOW</h1>
          <p className="signin-subtitle">Train Hard, Stay Consistent</p>
        </div>
        <form className="signin-form" onSubmit={handleSignIn}>
          <div className="signin-input-container">
            <FaEnvelope size={24} className="signin-input-icon" />
            <input 
              type="email" 
              placeholder="Email" 
              className="signin-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="signin-input-container">
            <FaLock size={24} className="signin-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="signin-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <div 
              className="signin-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye size={24} className="signin-password-icon" />
              ) : (
                <FaEyeSlash size={24} className="signin-password-icon" />
              )}
            </div>
          </div>
          <button type="submit" className="signin-button">
            SIGN IN
          </button>
        </form>
        <div className="signin-signup-link">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;