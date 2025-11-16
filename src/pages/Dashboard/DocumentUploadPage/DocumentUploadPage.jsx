// src/pages/Dashboard/DocumentUploadPage/DocumentUploadPage.jsx
import React, { useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/layout/Sidebar";
import "./DocumentUploadPage.css";

// ── Icons ─────────────────────────────────────
const Icon = ({ path, className }) => (
  <svg className={`icon ${className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const DocumentUploadPage = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🆕 Stores all uploaded documents in history
  const [documents, setDocuments] = useState([]);

  // 🆕 Status message shown on page
  const [statusMessage, setStatusMessage] = useState("");

  const fileInputRef = useRef(null);

  const UPLOAD_URL = "http://127.0.0.1:5000/upload"; // Same backend used in AiAssistantPage

  // ─────────────────────────────────────────────
  // Drag & Drop Handlers
  // ─────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      uploadToBackend(f);
    } else {
      setStatusMessage("Please upload a PDF file only.");
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const pastedFile = items[i].getAsFile();
      if (pastedFile && pastedFile.type === "application/pdf") {
        setFile(pastedFile);
        uploadToBackend(pastedFile);
        break;
      }
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      uploadToBackend(f);
    } else {
      setStatusMessage("Please upload a PDF file only.");
    }
  };

  // ─────────────────────────────────────────────
  // 🧠 REAL BACKEND UPLOAD + VERIFICATION
  // ─────────────────────────────────────────────
  const uploadToBackend = async (uploadedFile) => {
    setUploading(true);
    setStatusMessage("Verifying document...");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const docInfo = {
        id: data.doc_id,
        name: uploadedFile.name,
        verified: data.verified || false,
        uploadedAt: new Date().toLocaleString(), // 🆕 timestamp
      };

      // 🟦 Status message
      setStatusMessage(
        docInfo.verified
          ? `✔ "${uploadedFile.name}" verified successfully!`
          : `❌ "${uploadedFile.name}" uploaded but NOT verified.`
      );

      // 🟦 Add to history list
      setDocuments((prev) => [...prev, docInfo]);

    } catch (error) {
      setStatusMessage("Error verifying document. Try again.");
      console.error(error);
    }

    setUploading(false);
    setFile(null);
  };

  // 🆕 Remove a document from history
  const removeDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setStatusMessage("Document removed successfully.");
  };

  const handleUpload = () => {
    if (!file) return;
    uploadToBackend(file);
  };

  // ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="dashboard1">
        <main className="main1" style={{ padding: "2rem", textAlign: "center" }}>
          <p>Please log in to access this page.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard1">
      <Sidebar isMobile={true} isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
      <Sidebar />

      <main className="main1">
        <header className="header1">
          <h1>Document Verification</h1>
        </header>

        {/* ─────────────────────────────────── */}
        {/* Uploaded Document History List      */}
        {/* ─────────────────────────────────── */}
        <section className="doc-status-section">
          <h2>Uploaded Documents</h2>

          <div className="doc-list">
            {documents.map((doc) => (
              <div key={doc.id} className={`doc-item ${doc.verified ? "verified" : "pending"}`}>
                <Icon path={doc.verified ? "M9 12l2 2 4-4" : "M12 8v4m0 4h.01"} />

                <div className="doc-details">
                  <span className="doc-name">{doc.name}</span>
                  <span className="upload-time">{doc.uploadedAt}</span>
                </div>

                <span className="status">{doc.verified ? "Verified" : "Not Verified"}</span>

                {/* 🗑 Remove Button */}
                <button className="delete-btn" onClick={() => removeDocument(doc.id)}>
                  ❌
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────── */}
        {/* Upload Area                         */}
        {/* ─────────────────────────────────── */}
        <section className="upload-section">
          <h2>Upload Document (PDF)</h2>

          <div
            className={`drop-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onClick={() => fileInputRef.current.click()}
          >
            <Icon path="M7 16h10M12 2v11m-5 5h10" className="upload-icon" />

            <p className="drop-text"><strong>Drag & drop</strong> PDF here</p>
            <p className="or-text">or</p>

            <button type="button" className="btn-browse">Browse Files</button>

            <p className="paste-text">or <strong>paste</strong> (Ctrl+V)</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* File Preview */}
          {file && (
            <div className="file-preview">
              <div className="file-info">
                <Icon
                  path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414"
                  className="file-icon"
                />
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <button className="btn-remove" onClick={() => setFile(null)} disabled={uploading}>
                ❌
              </button>
            </div>
          )}

          {/* Upload Button */}
          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading & Verifying..." : "Upload & Verify"}
          </button>

          {/* Status Box */}
          {statusMessage && (
            <div className="status-box">
              <p>{statusMessage}</p>
            </div>
          )}

          <div className="info-box">
            <p>PDF only • Max 10 MB</p>
          </div>
        </section>

        {/* Floating AI Button */}
        <div className="floating-ai1">
          <a href="/ai-assistant" className="floating-btn1">
            <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8" />
            <span>Ask AI for help</span>
          </a>
        </div>
      </main>
    </div>
  );
};

export default DocumentUploadPage;
