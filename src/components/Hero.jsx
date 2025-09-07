import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h2>Find Your Face in Photos</h2>
        <p>
          Upload a folder of photos and we'll find all the pictures containing
          your face
        </p>
        <div className="auth-buttons">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-secondary" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>

      <div className="hero-image">
        <div className="image-placeholder">
          <span className="placeholder-icon">📸</span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
