import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Configure axios instance for API calls
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: false,
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by Error Boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`error-fallback ${this.props.isDarkMode ? 'dark-mode' : ''}`}>
          <h2>Something went wrong</h2>
          <p className="error-message">{this.state.error?.toString()}</p>
          <details className="error-details">
            <summary>Error Details</summary>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle steering wheel rotation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const steeringWheel = document.querySelector('.steering-wheel');
      if (steeringWheel) {
        const scrollPosition = window.scrollY;
        steeringWheel.style.transform = `rotate(${scrollPosition}deg)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSocialLinks = () => {
    setShowSocialLinks(!showSocialLinks);
  };

  const handleSteeringClick = () => {
    if (window.scrollY === 0) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleButtonClick = (e) => {
    const button = e.currentTarget;
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 300);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadedImageUrl(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload an image for accident detection.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setResult(response.data.result || 'No accident detected');
      setUploadedImageUrl(response.data.image_path || `http://localhost:5000/uploads/${response.data.image}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      let errorMessage = 'An error occurred while processing the image.';
      
      if (error.response) {
        errorMessage = error.response.data.message || error.response.statusText || errorMessage;
      } else if (error.request) {
        errorMessage = 'Server is not responding. Please try again later.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary isDarkMode={darkMode}>
      <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="background-image"></div>

        <div className="steering-wheel" onClick={handleSteeringClick}>
          <div className="peace-symbol"></div>
        </div>

        <div className="steering-wheel-left">
          <div className="peace-symbol-left"></div>
        </div>

        <header className="header">
          <h1>Accident Detection</h1>
          <div className="header-buttons">
            <button onClick={(e) => { toggleDarkMode(); handleButtonClick(e); }} className="theme-toggle car-button">
              {darkMode ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </button>
            <button onClick={(e) => { toggleSocialLinks(); handleButtonClick(e); }} className="more-button car-button">
              More {showSocialLinks ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
            </button>
            {showSocialLinks && (
              <div className="social-links">
                <a href="https://www.linkedin.com/in/palla-tarun-teja-337746276/" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://github.com/PALLATARUNTEJA" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://www.instagram.com/p_tarun_teja/" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="mailto:pallatarunteja333@.com">
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            )}
          </div>
        </header>

        <main className="main-content">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-upload-container">
              <div className="file-upload-wrapper">
                <label htmlFor="file-upload" className="custom-file-upload car-button" onClick={handleButtonClick}>
                  <i className="fas fa-folder-open"></i> Choose File
                </label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button car-button" 
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing...
                </>
              ) : (
                'Detect Accident'
              )}
            </button>
          </form>

          <div className="result-section">
            <h2>Result</h2>
            <div className="image-container">
              {uploadedImageUrl && (
                <div className="image-box">
                  <h3>Uploaded Image</h3>
                  <img src={uploadedImageUrl} alt="Uploaded Image" className="uploaded-image" />
                </div>
              )}
            </div>
            {result && (
              <div className="result-text">
                <h3>Detection Result</h3>
                <p>{result}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;