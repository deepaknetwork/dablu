import React from 'react';
import { useLoading } from './loadingContext.jsx';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-backdrop"></div>
      <div className="loading-content">
        <div className="spinner-container">
          <div className="spinner"></div>
          <div className="spinner-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
        <p className="loading-text">Please wait...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 