import { useState } from "react";
import { api } from "../../api";
import "./PasswordReset.css";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.resetPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="reset-container">
      <h2>Password Reset</h2>
      <form onSubmit={handleSubmit} className="reset-form">
        <div className="reset-input-wrapper">
          <input type="email"
           value={email} 
           placeholder="Enter your email"
           onChange={(e) => setEmail(e.target.value)}
           required />
        </div>
        <button type="submit" className="main-button">Send</button>
      </form>
      {message && <p className="reset-success">{message}</p>}
      {error && <p className="reset-error">{error}</p>}
    </div>
  );
};
