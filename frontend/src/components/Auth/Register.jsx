import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import './Auth.css';
import { EmailIcon, ErrorIcon, PasswordIcon, UserIcon } from "../Icons";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setrePassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (email.trim().length === 0) {
      setError("Email should not be empty");
      setIsLoading(false);
      return;
    }
    
    if (password !== rePassword) {
      setError("The passwords must match");
      setIsLoading(false);
      return;
    }
    
    try {
      await api.register(username, password, email);
      
      navigate("/login");
    } catch (err) {
      if (err.response?.data)
        setError(Object.values(err.response.data)[0][0]);
      else
        setError("Error during registration");
        console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Join the Tournament</h1>
          <p>Create an account to participate in esports competitions</p>
        </div>
        
        {error && (
          <div className="error-message">
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <UserIcon />
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-wrapper">
              <EmailIcon />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-wrapper">
              <PasswordIcon />
              <input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-wrapper">
              <PasswordIcon />
              <input
                id="rePassword"
                type="password"
                placeholder="Confirm your password"
                value={rePassword}
                onChange={(e) => setrePassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="terms-container">
            <label className="terms-checkbox">
              <input type="checkbox" required />
              <span>I agree to the <a href="#" className="main-link">Terms & Conditions</a></span>
            </label>
          </div>
          
          <button type="submit" className="main-button" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        
        <div className="auth-prompt">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link main-link">Login</Link>
        </div>
      </div>
    </div>
  );
}