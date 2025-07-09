import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api";
import "./PasswordReset.css";

export default function PasswordResetConfirm(){
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== rePassword) {
      setError("The passwords must match");
      return;
    }

    try {
      await api.confirmResetPassword(
        email,
        newPassword,
        token,
      );
      navigate("/login");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="reset-container">
      <h2>Password Reset</h2>
      <form onSubmit={handleSubmit} className="reset-form">
        <div className="reset-input-wrapper">
          <input
              type="password"
              value={newPassword}
              placeholder="Enter new password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
          />
          <input
              type="password"
              value={rePassword}
              placeholder="Confirm your password"
              onChange={(e) => setRePassword(e.target.value)}
              required
          />
        </div>
        
        <button type="submit" className="main-button">Reset</button>
      </form>
      {message && <p className="reset-success">{message}</p>}
      {error && <p className="reset-error">{error}</p>}
    </div>
  );
};
