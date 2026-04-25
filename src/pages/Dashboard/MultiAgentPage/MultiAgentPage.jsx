// src/pages/Dashboard/MultiAgentPage/MultiAgentPage.jsx
import React, { useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/layout/Sidebar";
import "./MultiAgentPage.css";

const AGENTS = [
  { id: "document",   label: "Document Agent",   emoji: "📄" },
  { id: "hs_code",    label: "HS Code Agent",     emoji: "🧾" },
  { id: "duty",       label: "Duty Agent",        emoji: "💰" },
  { id: "compliance", label: "Compliance Agent",  emoji: "⚖️" },
  { id: "decision",   label: "Decision Agent",    emoji: "🧠" },
];

const MultiAgentPage = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // Mark each agent as "processing" one by one while backend runs
  const animateAgents = async () => {
    for (const agent of AGENTS) {
      setStatuses(prev => ({ ...prev, [agent.id]: "processing" }));
      await new Promise(r => setTimeout(r, 500));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResults(null);

    const progressAnim = animateAgents();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:5000/upload", { method: "POST", body: formData });
      await progressAnim;
      const data = await res.json();

      // Map backend keys to each agent
      setResults({
        document:   { type: data.document_type ?? "Unknown", info: data.verification ?? data.analysis ?? "—" },
        hs_code:    data.hs_code ?? "N/A",
        duty:       data.duty ?? null,
        compliance: data.compliance ?? { issues: [] },
        decision:   data.decision ?? data.analysis ?? "N/A",
      });

      const done = {};
      AGENTS.forEach(a => { done[a.id] = "done"; });
      setStatuses(done);

    } catch (err) {
      setError("Could not connect to backend. Is the Flask server running?");
      console.log(err)
      const errMap = {};
      AGENTS.forEach(a => { errMap[a.id] = "error"; });
      setStatuses(errMap);
    }

    setLoading(false);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clearance_report.json";
    a.click();
  };

  if (!user) return <p style={{ padding: "2rem" }}>Please log in first.</p>;

  return (
    <div className="dashboard1">
      <Sidebar isMobile={true} isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
      <Sidebar />

      <main className="main1 ma-page">
        <h1 className="ma-title">🤖 Multi-Agent Clearance Pipeline</h1>
        <p className="ma-subtitle">Upload a document — 5 AI agents will analyse it automatically</p>

        {/* Upload Box */}
        <div className="ma-upload-box" onClick={() => fileRef.current.click()}>
          {file ? (
            <p>📋 <strong>{file.name}</strong> — ready to analyse</p>
          ) : (
            <p>📂 Click to select a file (PDF, DOCX, JPG, PNG)</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={e => { setFile(e.target.files[0]); setResults(null); setStatuses({}); setError(""); }}
          />
        </div>

        {file && (
          <button className="ma-run-btn" onClick={handleUpload} disabled={loading}>
            {loading ? "Running Pipeline…" : "▶ Run 5-Agent Pipeline"}
          </button>
        )}

        {error && <p className="ma-error">❌ {error}</p>}

        {/* Pipeline Steps */}
        {Object.keys(statuses).length > 0 && (
          <div className="ma-pipeline">
            {AGENTS.map((agent, i) => (
              <React.Fragment key={agent.id}>
                <div className={`ma-node ma-node--${statuses[agent.id] || "idle"}`}>
                  <span>{agent.emoji}</span>
                  <span>{agent.label}</span>
                </div>
                {i < AGENTS.length - 1 && <span className="ma-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="ma-results">
            <div className="ma-results-top">
              <h2>Agent Outputs</h2>
              <button className="ma-download-btn" onClick={downloadJSON}>⬇ Download JSON</button>
            </div>

            <div className="ma-cards">

              <div className="ma-card">
                <h3>📄 Document Agent</h3>
                <p><strong>Type:</strong> {results.document.type}</p>
                <p><strong>Info:</strong> {results.document.info}</p>
              </div>

              <div className="ma-card">
                <h3>🧾 HS Code Agent</h3>
                <p className="ma-hs-code">{results.hs_code}</p>
              </div>

              <div className="ma-card">
                <h3>💰 Duty Agent</h3>
                {results.duty ? (
                  <div className="ma-duty-row">
                    <span>BCD: <strong>{results.duty.bcd ?? "—"}</strong></span>
                    <span>IGST: <strong>{results.duty.igst ?? "—"}</strong></span>
                    <span>Total: <strong>{results.duty.total_duty ?? "—"}</strong></span>
                  </div>
                ) : (
                  <p>No duty data</p>
                )}
              </div>

              <div className="ma-card">
                <h3>⚖️ Compliance Agent</h3>
                {results.compliance?.issues?.length > 0 ? (
                  <ul>
                    {results.compliance.issues.map((issue, i) => (
                      <li key={i}>{issue.description} — <strong>{issue.severity}</strong></li>
                    ))}
                  </ul>
                ) : (
                  <p className="ma-ok">✅ No compliance issues</p>
                )}
              </div>

              <div className="ma-card">
                <h3>🧠 Decision Agent</h3>
                <p className={results.decision?.includes("APPROVED") ? "ma-approved" : "ma-rejected"}>
                  {results.decision?.includes("APPROVED") ? "✅" : "❌"} {results.decision}
                </p>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MultiAgentPage;