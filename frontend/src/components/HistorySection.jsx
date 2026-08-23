import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import './HistorySection.css';

const HistorySection = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section className="history-section" id="history">
      <div className="section-header">
        <h2 className="section-title">Recent <span className="text-gradient">Scans</span></h2>
        <p className="section-subtitle">Your crop health history</p>
      </div>

      <div className="history-grid">
        {history.map((scan) => {
          const isHealthy = scan.prediction.toLowerCase().includes('healthy');
          const statusClass = isHealthy ? 'history-healthy' : 'history-disease';
          const formattedName = scan.prediction.replace(/_/g, ' ').replace(/___/g, ' - ');

          return (
            <div className={`history-card glass-panel ${statusClass}`} key={scan.id}>
              <div className="history-card-header">
                {isHealthy ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="history-date">
                  <Clock size={14} className="clock-icon" />
                  {formatDate(scan.timestamp)}
                </span>
              </div>
              
              <div className="history-content">
                <h4 className="history-prediction">{formattedName}</h4>
                <div className="history-confidence">
                  <span>Confidence</span>
                  <strong>{scan.confidence.toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HistorySection;
