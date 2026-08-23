import React from 'react';
import { ArrowRight, Activity } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  const scrollToScanner = () => {
    document.getElementById('scanner').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>
      
      <div className="hero-content">
        <div className="badge animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Activity size={16} className="badge-icon" />
          <span>Next-Generation Crop Analysis</span>
        </div>
        
        <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Identify Crop Diseases with <br/>
          <span className="text-gradient">Unmatched Precision</span>
        </h1>
        
        <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Upload a photo of a leaf and let our advanced AI model instantly detect diseases, providing you with actionable insights to save your harvest.
        </p>
        
        <div className="hero-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button className="btn-primary hero-btn" onClick={scrollToScanner}>
            Start Scanning <ArrowRight size={20} />
          </button>
          <a href="#how-it-works" className="btn-secondary">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
