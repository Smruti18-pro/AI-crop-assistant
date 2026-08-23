import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Activity, CheckCircle, AlertCircle, LayoutDashboard, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scans'); // 'scans' or 'users'
  const { getAuthHeader } = useContext(AuthContext);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/admin/history`, { headers: { ...getAuthHeader() } }),
          fetch(`${API_URL}/admin/users`, { headers: { ...getAuthHeader() } })
        ]);

        if (historyRes.ok && usersRes.ok) {
          const historyData = await historyRes.json();
          const usersData = await usersRes.json();
          setHistory(historyData);
          setUsers(usersData);
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalScans = history.length;
  const healthyScans = history.filter(s => s.prediction.toLowerCase().includes('healthy')).length;
  const diseasedScans = totalScans - healthyScans;
  const totalUsers = users.length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="admin-container">
      <header className="admin-header glass-panel">
        <div className="admin-header-content">
          <div className="admin-title">
            <LayoutDashboard size={28} className="text-gradient" />
            <h1>Admin <span className="text-gradient">Dashboard</span></h1>
          </div>
          <Link to="/" className="btn-secondary back-btn">
            <ArrowLeft size={18} /> Back to Website
          </Link>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon-wrapper blue"><Database size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Scans</span>
              <span className="stat-value">{totalScans}</span>
            </div>
          </div>
          
          <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon-wrapper green"><CheckCircle size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Healthy Crops</span>
              <span className="stat-value">{healthyScans}</span>
            </div>
          </div>
          
          <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon-wrapper orange"><AlertCircle size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Diseases Detected</span>
              <span className="stat-value">{diseasedScans}</span>
            </div>
          </div>

          <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{totalUsers}</span>
            </div>
          </div>
        </section>

        {/* Tab Controls */}
        <div className="admin-tabs-control">
          <button 
            className={`admin-tab-btn ${activeTab === 'scans' ? 'active' : ''}`}
            onClick={() => setActiveTab('scans')}
          >
            <Database size={18} /> Scan Activity
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Registered Users
          </button>
        </div>

        {/* Data Table */}
        <section className="table-section glass-panel animate-fade-in" style={{ animationDelay: '0.5s' }}>
          
          <div className="table-container" style={{ marginTop: '1rem' }}>
            {isLoading ? (
              <div className="loading-state">
                <Activity className="animate-spin" size={32} />
                <p>Loading database records...</p>
              </div>
            ) : activeTab === 'scans' ? (
              /* Scans Table */
              history.length === 0 ? (
                <div className="empty-state">
                  <p>No scans found in the database.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User ID</th>
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
                          <td className="col-id">#{scan.id}</td>
                          <td className="col-id">User {scan.user_id}</td>
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
              )
            ) : (
              /* Users Table */
              users.length === 0 ? (
                <div className="empty-state">
                  <p>No users found in the database.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="col-id">#{user.id}</td>
                        <td className="col-pred">{user.username}</td>
                        <td className="col-status">
                          <span className={`status-badge ${user.is_admin ? 'disease' : 'healthy'}`} style={user.is_admin ? { background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' } : {}}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
