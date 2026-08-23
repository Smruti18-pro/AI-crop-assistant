import React from 'react';
import { Leaf, Globe, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo-section">
            <Leaf className="logo-icon" size={24} />
            <span className="logo-text">Crop<span className="text-gradient">AI</span></span>
          </div>
          <p>Empowering farmers with state-of-the-art artificial intelligence for a sustainable future.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Product</h4>
            <a href="#scanner">Scanner</a>
            <a href="#features">Features</a>
            <a href="#">Pricing</a>
          </div>
          <div className="link-group">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="link-group">
            <h4>Social</h4>
            <div className="social-icons">
              <a href="#"><Globe size={20} /></a>
              <a href="#"><Mail size={20} /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CropAI Assistant. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
