// src/pages/Dashboard/AiAssistantPage/AiAssistantPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/layout/Sidebar";
import "./AiAssistantPage.css";

const Icon = ({ path, className }) => (
  <svg className={`icon ${className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const ChatBubble = ({ type, text, source, fileName }) => (
  <div className={`bubble ${type}`}>
    <div className="bubble-inner">
      <p>{text}</p>
      {fileName && <small className="file-info">📎 Attached: {fileName}</small>}
      {source && <small className="source">Source: {source}</small>}
    </div>
  </div>
);

const FileChip = ({ file, onRemove }) => (
  <div className="file-chip">
    <span>📎 {file.name}</span>
    <button onClick={onRemove} className="remove-file" title="Remove file">
      ×
    </button>
  </div>
);

const AiAssistantPage = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // File selected for current message

  const API_URL = "http://127.0.0.1:5000/chat";  // 🔥 Change if needed
  const UPLOAD_URL = "http://127.0.0.1:5000/upload";  // 🔥 Add upload endpoint to backend

  // Persistent storage key (per user)
  const STORAGE_KEY = `chatHistory_${user?.id || 'guest'}`;

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    }
  }, [user, STORAGE_KEY]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, user, STORAGE_KEY]);

  // Optional: Clear history function (e.g., add a button to UI)
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    document.getElementById('file-upload').value = '';
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    const userText = input.trim() || "Analyze this document"; // Default text if no input but file attached
    const userMsg = { 
      type: "user", 
      text: userText, 
      fileName: selectedFile?.name 
    };
    setMessages(prev => [...prev, userMsg]);

    const fileToUpload = selectedFile;
    setSelectedFile(null); // Clear immediately after adding to message
    setInput("");
    setLoading(true);

    let docId = null;
    let verified = false;

    // Upload file if selected
    if (fileToUpload) {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      // Add loading message for upload
      setMessages(prev => [...prev, {
        type: "ai",
        text: `Uploading ${fileToUpload.name}...`,
        source: "Upload System"
      }]);

      try {
        const uploadResponse = await fetch(UPLOAD_URL, {
          method: "POST",
          body: formData
        });

        const uploadData = await uploadResponse.json();
        docId = uploadData.doc_id;
        verified = uploadData.verified || false;

        // Update the loading message with success
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            type: "ai",
            text: `✅ Document "${fileToUpload.name}" uploaded successfully. ${verified ? 'It has been verified.' : 'Verification failed or incomplete.'}`,
            source: "Upload System"
          };
          return updated;
        });

        // If no query text, ask for follow-up and stop here
        if (!input.trim()) {
          setMessages(prev => [...prev, {
            type: "ai",
            text: "What would you like to know about this document?",
            source: "Upload System"
          }]);
          setLoading(false);
          return;
        }

      } catch (uploadError) {
        // Update loading to error
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            type: "ai",
            text: `❌ Error uploading document: ${fileToUpload.name}. Please try again.`,
            source: "System"
          };
          return updated;
        });
        console.error(uploadError);
        setLoading(false);
        return;
      }
    }

    const question = userText;
    const requestBody = { query: question };
    if (docId) {
      requestBody.doc_id = docId;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      let aiText = data.answer || "No response from AI.";
      const aiSource = data.source || (docId ? `Document: ${fileToUpload?.name || 'Uploaded'}` : "Chatbot Engine");

      // Structure the response: First verification status, then the answer
      if (docId) {
        const verificationStatus = verified 
          ? "**Document Verification for Customs Clearance:** ✅ The document has been verified and appears compliant for customs clearance."
          : "**Document Verification for Customs Clearance:** ❌ The document could not be verified for customs clearance. Please review and resubmit if necessary.";
        aiText = `${verificationStatus}\n\n**Response to Your Query:** ${aiText}`;
      }

      setMessages(prev => [...prev, {
        type: "ai",
        text: aiText,
        source: aiSource
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        type: "ai",
        text: "Error connecting to chatbot backend.",
        source: "System"
      }]);
      console.error(error);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="dashboard1">
        <main className="main1" style={{ padding: "2rem", textAlign: "center" }}>
          <p>Please log in to use AI Assistant.</p>
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
          <h1>AI Customs Assistant</h1>
          {/* Optional: Add clear history button */}
          <button onClick={clearHistory} className="clear-history-btn" title="Clear Chat History">
            Clear History
          </button>
        </header>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <ChatBubble 
                key={i} 
                type={msg.type} 
                text={msg.text} 
                source={msg.source}
                fileName={msg.fileName}
              />
            ))}

            {loading && (
              <ChatBubble
                type="ai"
                text="Thinking..."
                source="Processing"
              />
            )}
          </div>

          <div className="chat-input">
            <div className="input-row">
              <input
                type="text"
                className="textbox"
                placeholder="Ask me anything about customs regulations... (or attach a document)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <div className="input-actions">
                <label 
                  htmlFor="file-upload" 
                  className="file-upload-btn"
                  title="Attach a document"
                >
                  <Icon path="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                <button className="send-btn" onClick={handleSend} disabled={loading}>
                  <Icon path="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </button>
              </div>
            </div>
            {selectedFile && (
              <FileChip file={selectedFile} onRemove={removeFile} />
            )}
          </div>

          <p className="disclaimer">
            Responses may contain errors. Confirm essential information independently.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AiAssistantPage;