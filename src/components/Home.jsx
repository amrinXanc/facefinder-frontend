import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as faceapi from "face-api.js";
import { handleSuccess } from "../utils";
import { useNavigate } from "react-router-dom";

const Home = ({ setAuthenticated }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFacePhotos, setSelectedFacePhotos] = useState([]);
  const [threshold, setThreshold] = useState(0.5);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [matchedFiles, setMatchedFiles] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [userFolders, setUserFolders] = useState([]);

  const navigate = useNavigate();

  // Get logged in user from localStorage
  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("Logged Out Successfully");
    setAuthenticated(false);
    setTimeout(() => {
      navigate("/hero");
    }, 1000);
  };

  // Load face-api models
  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      console.log("FaceAPI models loaded ✅");
    }
    loadModels();
  }, []);

  // Utility: load image from File
  const loadImageFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => resolve(img);
        img.onerror = reject;
      };
      reader.readAsDataURL(file);
    });
  };

  // Process photos
  const processPhotos = async () => {
    setProcessing(true);
    setUploadProgress(0);
    try {
      let referenceDescriptors = [];
      for (const file of selectedFacePhotos) {
        const img = await loadImageFromFile(file);
        const detections = await faceapi
          .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptors();
        if (detections.length > 0) {
          referenceDescriptors.push(detections[0].descriptor);
        }
      }

      let matches = [];
      let processedCount = 0;
      for (const file of selectedFiles) {
        const img = await loadImageFromFile(file);
        const detections = await faceapi
          .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptors();
        for (const detection of detections) {
          for (const ref of referenceDescriptors) {
            const distance = faceapi.euclideanDistance(ref, detection.descriptor);
            if (distance < threshold) {
              matches.push(file);
              break;
            }
          }
        }
        processedCount++;
        setUploadProgress(Math.round((processedCount / selectedFiles.length) * 100));
      }

      setMatchedFiles(matches);
      setResults({
        facesFound: matches.length,
        totalPhotos: selectedFiles.length,
        thresholdUsed: threshold,
      });
    } catch (err) {
      console.error("Error processing photos:", err);
    }
    setProcessing(false);
  };

  // Download results
  const downloadResults = async () => {
    if (!matchedFiles || matchedFiles.length === 0) {
      alert("No matching photos to download.");
      return;
    }
    const zip = new JSZip();
    matchedFiles.forEach((file) => {
      zip.file(file.name, file);
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "matched-photos.zip");
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <div className="header-content">
          <h1 className="logo" onClick={ ()=>navigate("/home")} >FaceFinder</h1>
          <nav className="header-nav">
            <span className="welcome-text">
              Welcome, <span className="username">{loggedInUser}</span>
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="btn-icon">→</span> Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {processing ? (
          /* Processing UI */
          <div className="processing-container">
            <div className="processing-content">
              <h2>Processing Your Photos</h2>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="progress-text">{uploadProgress}% Complete</p>
              </div>
              <p className="processing-text">
                Analyzing faces in {selectedFiles.length} photos...
              </p>
              <div className="loading-spinner"></div>
            </div>
          </div>

        ) : results ? (
          /* Results UI */
          <div className="results-container">
            <div className="results-content">
              <div className="success-icon">✓</div>
              <h2>Processing Complete!</h2>
              <div className="results-summary">
                <p>
                  We found <strong>{results?.facesFound}</strong> photos with your
                  face out of <strong>{results?.totalPhotos}</strong> total photos.
                </p>
                {results?.thresholdUsed && (
                  <p className="threshold-info">
                    Similarity threshold: {results.thresholdUsed}
                  </p>
                )}
              </div>
              <div className="results-actions">
                {results?.facesFound > 0 && (
                  <button className="btn-primary" onClick={downloadResults}>
                    Download Matching Photos
                  </button>
                )}
                <button
                  className="btn-secondary"
                  onClick={() => setResults(null)}
                >
                  Process More Photos
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard UI */
          <div className="dashboard-container">
            <div className="dashboard-header">
              <h2>Welcome back, {loggedInUser}!</h2>
              <p>Ready to find your face in photos?</p>
            </div>

            <div className="dashboard-content">
              <div className="upload-section">
                <div className="upload-steps">
                  {/* Step 1 */}
                  <div className="upload-box">
                    <div className="step-number">1</div>
                    <h3>Upload Photos Folder</h3>
                    <input
                      type="file"
                      id="folder-upload"
                      multiple
                      webkitdirectory="true"
                      directory=""
                      onChange={(e) => setSelectedFiles([...e.target.files])}
                    />
                    <label htmlFor="folder-upload" className="file-input-label">
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} files selected`
                        : "Choose Folder"}
                    </label>
                  </div>

                  {/* Step 2 */}
                  <div className="upload-box">
                    <div className="step-number">2</div>
                    <h3>Upload Your Photos (1-5)</h3>
                    <input
                      type="file"
                      id="face-upload"
                      accept="image/*"
                      multiple
                      onChange={(e) => setSelectedFacePhotos([...e.target.files])}
                    />
                    <label htmlFor="face-upload" className="file-input-label">
                      {selectedFacePhotos.length > 0
                        ? `${selectedFacePhotos.length} photos selected`
                        : "Choose Photos"}
                    </label>
                  </div>

                  {/* Step 3 */}
                  <div className="upload-box">
                    <div className="step-number">3</div>
                    <h3>Similarity Threshold</h3>
                    <input
                      type="range"
                      min="0.4"
                      max="0.7"
                      step="0.05"
                      value={threshold}
                      onChange={(e) =>
                        setThreshold(parseFloat(e.target.value))
                      }
                    />
                    <div className="threshold-value">
                      Current: {threshold}{" "}
                      {threshold <= 0.55
                        ? "(More strict)"
                        : "(More sensitive)"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={processPhotos}
                  disabled={selectedFiles.length === 0 || selectedFacePhotos.length === 0}
                  className="process-button btn-primary large"
                >
                  Find My Faces
                </button>
              </div>

              {userFolders.length > 0 && (
                <div className="previous-uploads">
                  <h3>Your Previous Uploads</h3>
                  <div className="folder-list">
                    {userFolders.map((folder) => (
                      <div key={folder.id} className="folder-item">
                        <div className="folder-icon">📁</div>
                        <div className="folder-info">
                          <p className="folder-date">
                            {new Date(folder.uploadedAt).toLocaleDateString()}
                          </p>
                          <p className="folder-count">
                            {folder.files.length} photos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
