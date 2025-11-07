// src/components/FeatureCard.jsx
import React from "react";
import "../styles/Dashboard.css";

const FeatureCard = ({ title, description, onClick }) => {
  return (
    <div className="feature-card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
