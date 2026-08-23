import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Activity, User, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './AdminPanel.css'; // Reuse table styles

const Profile = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, getAuthHeader } = useContext(AuthContext);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/history`, {
          headers: { ...getAuthHeader() }
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <div className="admin-container" style={{ paddingTop: '100px' }}>
        <header className="admin-header glass-panel">
          <div className="admin-header-content">
            <div className="admin-title">
              <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.5rem', marginRight: '1rem' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ margin: 0 }}>My <span className="text-gradient">Profile</span></h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Logged in as {user.username}
                </p>
              </div>
            </div>
            <Link to="/" className="btn-secondary back-btn">
              <ArrowLeft size={18} /> Back to Scanner
            </Link>
          </div>
        </header>

        <main className="admin-main">
          {/* User Stats Grid */}
          <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon-wrapper blue"><Database size={24} /></div>
              <div className="stat-info">
                <span className="stat-label">My Total Scans</span>
                <span className="stat-value">{history.length}</span>
              </div>
            </div>
            <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon-wrapper green"><User size={24} /></div>
              <div className="stat-info">
                <span className="stat-label">Account Role</span>
                <span className="stat-value" style={{ fontSize: '1.5rem' }}>
                  {user.isAdmin ? 'Admin' : 'Standard'}
                </span>
              </div>
            </div>
          </section>

          {/* Personal Scan History Table */}
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar className="text-gradient" size={24} /> My Scan History
          </h2>
          
          <section className="table-section glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="table-container">
              {isLoading ? (
                <div className="loading-state">
                  <Activity className="animate-spin" size={32} />
                  <p>Loading your scans...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't scanned any crops yet. Head to the scanner to get started!</p>
                  <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Scan Now</Link>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image File</th>
                      <th>Prediction</th>
                      <th>Confidence</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((scan) => {
                      const isHealthy = scan.prediction.toLowerCase().includes('healthy');
                      const formattedName = scan.prediction.replace(/_/g, ' ').replace(/___/g, ' - ');
                      return (
                        <tr key={scan.id}>
                          <td className="col-file">{scan.filename}</td>
                          <td className="col-pred">{formattedName}</td>
                          <td className="col-conf">
                            <div className="conf-bar-bg">
                              <div className="conf-bar-fill" style={{ width: `${scan.confidence}%` }}></div>
                            </div>
                            <span>{scan.confidence.toFixed(1)}%</span>
                          </td>
                          <td className="col-date">{formatDate(scan.timestamp)}</td>
                          <td className="col-status">
                            <span className={`status-badge ${isHealthy ? 'healthy' : 'disease'}`}>
                              {isHealthy ? 'Healthy' : 'Disease'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Profile;
