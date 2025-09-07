import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { handleFailure, handleSuccess } from "../utils";
import API_BASE_URL from "../config";
const ResetPassword = () => {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      return handleFailure("Please enter a new password");
    }
    if (password.length < 4) {
      return handleFailure("Password must be at least 4 characters long");
    }
    if (password !== confirmPassword) {
      return handleFailure("Passwords do not match");
    }

    try {
      const url = `${API_BASE_URL}/auth/reset-password/${token}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      if (response.ok) {
        handleSuccess(result.message || "Password reset successful");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        handleFailure(result.message || "Something went wrong");
      }
    } catch (err) {
      handleFailure("Server error, try again later");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="auth-container">
        <div className="auth-form">
          <h2>Reset Your Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary full-width">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
