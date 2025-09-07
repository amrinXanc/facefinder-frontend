import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleFailure, handleSuccess } from "../utils";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return handleFailure("Please enter your email");
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return handleFailure("Please enter a valid email address");
    }
    try {
      const response = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();

      if (response.ok) {
        handleSuccess(result.message || "Reset link sent");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // backend will send 404 with message "User with this email does not exist"
        handleFailure(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      handleFailure("Server error, try again later");
    }
  };

  return (
    <div>
      <div className="auth-container">
        <div className="auth-form">
          <h2>Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary full-width">
              Send Reset Link
            </button>
          </form>
          <p className="auth-switch">
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", color: "#007bff" }}
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
