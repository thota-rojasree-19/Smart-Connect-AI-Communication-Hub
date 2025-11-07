import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Email: support@smartconnectai.com</p>
      </section>
    </div>
  );
};

export default Home;
