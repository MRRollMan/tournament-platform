import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { api } from "../../api";
import './Auth.css';
import  { ErrorIcon, PasswordIcon, UserIcon } from "../Icons";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const { access, refresh, user } = await api.login(username, password);
      console.log("Login successful", access, refresh, user);
      
      login(access, refresh, user);
      navigate("/");
    } catch (err) {
      console.log(err);
      setError("Invalid login or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Log in to continue to your esports tournament</p>
        </div>
        
        {error && (
          <div className="error-message">
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <UserIcon />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <div className="remember-forgot">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/password-reset" className="main-link">Forgot password?</Link>
            </div>
            
            <button type="submit" className="main-button" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
        
        <div className="auth-prompt">
          <span>Don't have an account?</span>
          <Link to="/register" className="auth-link main-link">Register now</Link>
        </div>
      </div>
    </div>
  );
}