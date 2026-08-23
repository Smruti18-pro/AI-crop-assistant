import React, { useState, useEffect, useContext } from 'react';
import { Cloud, TrendingUp, AlertTriangle, Scan, MessageSquare, Mic, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageUploader from '../components/ImageUploader';
import ResultCard from '../components/ResultCard';
import { AuthContext } from '../context/AuthContext';
import KrishiChatbot from '../components/KrishiChatbot';
import './Dashboard.css';

const Dashboard = () => {
  const { user, getAuthHeader } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({ weather: null, market: null });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
  // Image Upload State
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`, { headers: getAuthHeader() });
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    
    try {
      // 1. Scan Image
      const formData = new FormData();
      formData.append('file', selectedImage);
      const scanRes = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });
      const scanData = await scanRes.json();
      setResult(scanData);
      
      // 2. Get AI Recommendation
      const recRes = await fetch(`${API_URL}/api/recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          disease: scanData.prediction,
          confidence: scanData.confidence,
          crop: 'Tomato',
          language: 'English'
        })
      });
      const recData = await recRes.json();
      setRecommendation(recData.recommendation);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, {user?.username} 👋</h1>
          <p>Your KRISHIAI Command Center</p>
        </header>

        <div className="dashboard-grid">
          {/* LEFT COLUMN: Tools */}
          <div className="dashboard-left">
            <section className="dashboard-card scan-card">
              <h3><Scan size={20} /> AI Disease Detection</h3>
              <ImageUploader onImageSelect={setSelectedImage} selectedImage={selectedImage} />
              {selectedImage && (
                <button className="btn-primary analyze-btn" onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? <><Loader2 className="animate-spin" /> Analyzing...</> : "Analyze Crop"}
                </button>
              )}
            </section>
            
            {result && (
              <section className="dashboard-card result-card">
                <ResultCard result={result} />
                {recommendation && (
                  <div className="recommendation-box">
                    <h4>💡 Expert Recommendation</h4>
                    <p>{recommendation}</p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Data */}
          <div className="dashboard-right">
            <section className="dashboard-card weather-card">
              <h3><Cloud size={20} /> Weather & Conditions</h3>
              {loadingDashboard ? <p>Loading...</p> : (
                <div className="weather-info">
                  <h2>{dashboardData.weather?.temperature}°C</h2>
                  <p>{dashboardData.weather?.description}</p>
                  <p>Rain Chance: {dashboardData.weather?.rain_chance}%</p>
                </div>
              )}
            </section>

            <section className="dashboard-card market-card">
              <h3><TrendingUp size={20} /> Market Prices</h3>
              {loadingDashboard ? <p>Loading...</p> : (
                <div className="market-info">
                  <div className="market-item">
                    <span>Tomato</span>
                    <strong>{dashboardData.market?.price} ({dashboardData.market?.trend})</strong>
                  </div>
                </div>
              )}
            </section>
            
            <KrishiChatbot />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
