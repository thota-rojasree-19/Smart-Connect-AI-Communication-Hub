import React from "react";
import "../styles/Home.css";
import heroImage from "../assets/hero.jpg";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login"); // Navigate to Login page
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to Smart Connect AI</h1>
        <p>Your ultimate AI communication hub for seamless collaboration.</p>
        <button className="cta-btn" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
      <img src={heroImage} alt="Hero" className="hero-img" />
    </section>
  );
};

export default HeroSection;
