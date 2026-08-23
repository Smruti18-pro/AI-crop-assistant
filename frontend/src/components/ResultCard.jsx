import React from 'react';
import { AlertCircle, CheckCircle, Leaf, ArrowRight } from 'lucide-react';
import './ResultCard.css';

const ResultCard = ({ result, error }) => {
  if (error) {
    return (
      <div className="result-card glass-panel error-card animate-fade-in">
        <AlertCircle size={48} className="error-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const { prediction, confidence } = result;
  
  // Format the prediction name to be more readable
  const formattedName = prediction.replace(/_/g, ' ').replace(/___/g, ' - ');
  
  // Determine status color based on confidence and if it's healthy
  const isHealthy = prediction.toLowerCase().includes('healthy');
  const statusClass = isHealthy ? 'status-healthy' : 'status-disease';

  return (
    <div className="result-card glass-panel animate-fade-in">
      <div className="result-header">
        <div className={`status-icon-wrapper ${statusClass}`}>
          {isHealthy ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
        </div>
        <div className="result-title">
          <span className="subtitle">AI Analysis Result</span>
          <h2>{isHealthy ? 'Healthy Crop' : 'Disease Detected'}</h2>
        </div>
      </div>

      <div className="prediction-box">
        <Leaf size={20} className="leaf-icon" />
        <span className="prediction-text text-gradient">{formattedName}</span>
      </div>

      <div className="confidence-section">
        <div className="confidence-header">
          <span>Confidence Score</span>
          <span className="confidence-value">{confidence}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
      
      {!isHealthy && (
        <div className="action-recommendation">
          <p>We recommend treating your crop based on this diagnosis to prevent further spread.</p>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
