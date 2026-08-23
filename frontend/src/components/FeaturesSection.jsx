import React from 'react';
import { Zap, Target, ShieldCheck } from 'lucide-react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap size={32} />,
      title: "Lightning Fast",
      description: "Get instant diagnosis results within milliseconds using our optimized deep learning models."
    },
    {
      icon: <Target size={32} />,
      title: "High Accuracy",
      description: "Trained on thousands of crop images to ensure reliable and precise disease detection."
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Early Prevention",
      description: "Catch diseases early before they spread, saving your harvest and increasing overall yield."
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="section-header">
        <h2 className="section-title">Why Choose Crop<span className="text-gradient">AI</span>?</h2>
        <p className="section-subtitle">The ultimate tool for modern agriculture</p>
      </div>

      <div className="features-grid">
        {features.map((feature, idx) => (
          <div className="feature-card glass-panel" key={idx}>
            <div className="feature-icon-wrapper">
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
