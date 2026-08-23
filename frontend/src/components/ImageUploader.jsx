import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import './ImageUploader.css';

const ImageUploader = ({ onImageSelect, selectedImage, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="uploader-container animate-fade-in">
      <div 
        className={`upload-zone glass-panel ${isDragging ? 'dragging' : ''} ${selectedImage ? 'has-image' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          accept="image/*" 
          onChange={handleChange} 
          disabled={isLoading}
        />
        
        {selectedImage ? (
          <div className="preview-container">
            <img src={URL.createObjectURL(selectedImage)} alt="Selected crop" className="image-preview" />
            <div className="preview-overlay">
              <label htmlFor="file-upload" className="change-image-btn">
                Change Image
              </label>
            </div>
          </div>
        ) : (
          <label htmlFor="file-upload" className="upload-content">
            <div className="upload-icon-wrapper">
              <UploadCloud size={48} className="upload-icon" />
            </div>
            <h3>Drag & drop an image here</h3>
            <p>or click to browse your files</p>
            <span className="upload-formats">Supports JPG, PNG, JPEG</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
