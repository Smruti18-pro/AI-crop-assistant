import React, { useState, useEffect, useContext } from 'react';
import { Scan, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HistorySection from '../components/HistorySection';
import Footer from '../components/Footer';
import ImageUploader from '../components/ImageUploader';
import ResultCard from '../components/ResultCard';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAuthHeader } = useContext(AuthContext);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchHistory = async () => {
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
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setResult(null);
    setError(null);
    setTimeout(() => {
      document.getElementById('scanner-tool').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const resetState = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image. Ensure the API server is running and you are logged in.');
      }

      const data = await response.json();
      setResult(data);
      fetchHistory();
      
      setTimeout(() => {
        document.getElementById('result-area').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        
        <div id="scanner" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
          <div className="app-header animate-fade-in" style={{ marginBottom: '3rem' }}>
            <h2>AI <span className="text-gradient">Diagnosis Zone</span></h2>
            <p>Upload your image here to get started</p>
          </div>

          <div id="scanner-tool" className={`app-container ${result || error ? 'has-result' : ''}`} style={{ paddingTop: '0' }}>
            <div className={`content-grid ${result || error ? 'has-result' : ''}`}>
              
              <div className="upload-section glass-panel" style={{ padding: '2rem' }}>
                <ImageUploader 
                  onImageSelect={handleImageSelect} 
                  selectedImage={selectedImage}
                  isLoading={isLoading}
                />
                
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {selectedImage && !result && (
                    <button 
                      className="btn-primary" 
                      onClick={analyzeImage}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '1rem' }}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <Scan size={20} />
                          Analyze Crop
                        </>
                      )}
                    </button>
                  )}

                  {(result || error) && (
                    <button className="btn-primary" onClick={resetState} style={{ background: 'rgba(255,255,255,0.1)', width: '100%' }}>
                      <RefreshCw size={20} />
                      Scan Another
                    </button>
                  )}
                </div>
              </div>

              <div id="result-area">
                {(result || error) && (
                  <ResultCard result={result} error={error} />
                )}
              </div>
            </div>
          </div>
        </div>

        <HistorySection history={history} />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
};

export default Home;
