import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ArrowRight, Loader, HelpCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AuthPage.css';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your favorite book?",
  "What was the name of your first school?"
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Username, 2: Answer + New Password
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Security Question fields
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? { username, password }
      : { username, password, security_question: securityQuestion, security_answer: securityAnswer };
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          login(data.access_token, {
            username: data.username,
            isAdmin: data.is_admin
          });
          navigate('/');
        } else {
          setIsLogin(true);
          setPassword('');
          setSecurityAnswer('');
          setError('Registration successful! Please log in now.');
        }
      } else {
        setError(data.detail || 'An error occurred');
      }
    } catch (err) {
      setError('Cannot connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (recoveryStep === 1) {
      try {
        const response = await fetch(`${API_URL}/auth/security-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const data = await response.json();
        
        if (response.ok) {
          setSecurityQuestion(data.security_question);
          setRecoveryStep(2);
        } else {
          setError(data.detail || 'User not found');
        }
      } catch (err) {
        setError('Cannot connect to the server');
      }
    } else if (recoveryStep === 2) {
      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, security_answer: securityAnswer, new_password: newPassword })
        });
        const data = await response.json();
        
        if (response.ok) {
          setSuccessMsg(data.message);
          setTimeout(() => {
            setIsRecoveryMode(false);
            setRecoveryStep(1);
            setSuccessMsg('');
            setPassword('');
          }, 3000);
        } else {
          setError(data.detail || 'Incorrect answer');
        }
      } catch (err) {
        setError('Cannot connect to the server');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        
        {/* RECOVERY MODE */}
        {isRecoveryMode ? (
          <div className="auth-content">
            <div className="auth-header">
              <div className="auth-icon-wrapper blue">
                <HelpCircle size={32} className="icon-pulse" />
              </div>
              <h2>Password <span className="text-gradient">Recovery</span></h2>
              <p>Follow the steps to reset your password</p>
            </div>

            <form onSubmit={handleRecoverySubmit} className="auth-form">
              {successMsg ? (
                <div className="success-message">
                  <CheckCircle size={20} />
                  {successMsg}
                </div>
              ) : (
                <>
                  {error && <div className="error-message">{error}</div>}
                  
                  <div className="input-group">
                    <label>Username (Email)</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={recoveryStep === 2}
                      />
                    </div>
                  </div>

                  {recoveryStep === 2 && (
                    <div className="recovery-step-2 animate-fade-in">
                      <div className="input-group">
                        <label>Security Question</label>
                        <div className="security-question-display">
                          {securityQuestion}
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Your Answer</label>
                        <div className="input-wrapper">
                          <HelpCircle size={18} className="input-icon" />
                          <input 
                            type="text" 
                            placeholder="Type your answer"
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                          <Lock size={18} className="input-icon" />
                          <input 
                            type="password" 
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button type="submit" className="btn-primary w-100" disabled={loading}>
                    {loading ? <Loader className="animate-spin mx-auto" size={20} /> : (recoveryStep === 1 ? 'Verify Username' : 'Reset Password')}
                  </button>
                  
                  <button type="button" className="forgot-password-link" onClick={() => { setIsRecoveryMode(false); setRecoveryStep(1); setError(''); }}>
                    Wait, I remember it! Go back to Login
                  </button>
                </>
              )}
            </form>
          </div>
        ) : (
          /* NORMAL AUTH MODE (LOGIN / REGISTER) */
          <>
            <div className="auth-tabs">
              <button 
                className={`tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Login
              </button>
              <button 
                className={`tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Register
              </button>
            </div>

            <div className="auth-content">
              <div className="auth-header">
                <div className={`auth-icon-wrapper ${isLogin ? 'blue' : 'green'}`}>
                  {isLogin ? <Shield size={32} className="icon-pulse" /> : <User size={32} className="icon-pulse" />}
                </div>
                <h2>
                  {isLogin ? 'Welcome ' : 'Create '}
                  <span className="text-gradient">{isLogin ? 'Back' : 'Account'}</span>
                </h2>
                <p>{isLogin ? 'Securely access your crop intelligence dashboard' : 'Join the AI farming revolution today'}</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="auth-form">
                {error && <div className={`error-message ${error.includes('successful') ? 'success' : ''}`}>{error}</div>}
                
                <div className="input-group">
                  <label>Username (Email)</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Enter your email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="animate-fade-in">
                    <div className="input-group">
                      <label>Security Question (For Password Recovery)</label>
                      <div className="input-wrapper select-wrapper">
                        <select 
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          className="auth-select"
                        >
                          {SECURITY_QUESTIONS.map((q, idx) => (
                            <option key={idx} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Security Answer</label>
                      <div className="input-wrapper">
                        <HelpCircle size={18} className="input-icon" />
                        <input 
                          type="text" 
                          placeholder="Your secret answer"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <button type="submit" className="btn-primary w-100" disabled={loading}>
                  {loading ? (
                    <Loader className="animate-spin mx-auto" size={20} />
                  ) : (
                    <>
                      {isLogin ? 'Sign In Securely' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                
                {isLogin && (
                  <button type="button" className="forgot-password-link" onClick={() => { setIsRecoveryMode(true); setError(''); }}>
                    Forgot your password?
                  </button>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
