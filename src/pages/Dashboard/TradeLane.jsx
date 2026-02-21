// src/pages/TradeLane/TradeLanePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import Sidebar from "../../components/layout/Sidebar";
import indiaToNepalData from "./india_to_nepal.json";
import "./Tradelane.css"; // Keep your wizard styles
// import "../../pages/Dashboard/DashboardPage.css"; 

// ── Icons ─────────────────────────────────────
const Icon = ({ path }) => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

// ── Dropdowns ─────────────────────────────────
const countries = ["India", "Nepal", "China", "Sri Lanka"];
const categories = ["Electronics", "Food", "Textiles", "Machinery", "Pharmaceuticals"];

const CountrySelect = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = countries.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="select-group">
      <label>{label}</label>
      <div className="dropdown">
        <button className="dropdown-btn" onClick={() => setOpen(!open)}>
          {value || "Select country"} <Icon path="M19 9l-7 7-7-7" />
        </button>
        {open && (
          <div className="dropdown-menu">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              autoFocus
            />
            {filtered.map((c) => (
              <div
                key={c}
                className="dropdown-item"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CategorySelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="select-group">
      <label>Product Category</label>
      <div className="dropdown">
        <button className="dropdown-btn" onClick={() => setOpen(!open)}>
          {value || "Select category"} <Icon path="M19 9l-7 7-7-7" />
        </button>
        {open && (
          <div className="dropdown-menu">
            {categories.map((c) => (
              <div
                key={c}
                className="dropdown-item"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── TradeLaneItem with Remove ─────────────────
const TradeLaneItem = ({ lane, onClick, isSelected, onRemove }) => {
  const [deleting, setDeleting] = useState(false);

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Remove "${lane.from} to ${lane.to}"?`)) return;
    setDeleting(true);
    try {
      await onRemove(lane.id);
    } catch (err) {
      alert("Failed to remove. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`trade-lane-item ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="lane-content">
        <div className="lane-route">{lane.from} to {lane.to}</div>
        <div className="lane-category">{lane.category}</div>
      </div>
      <button
        className="remove-btn"
        onClick={handleRemove}
        disabled={deleting}
        title="Remove trade lane"
      >
        {deleting ? "..." : "×"}
      </button>
    </div>
  );
};

// ── ItemCard ──────────────────────────────────
const ItemCard = ({ item }) => {
  const totalTax =
    item.tax_breakdown.import_duty_percent +
    item.tax_breakdown.vat_percent +
    item.tax_breakdown.other_charges_percent;

  return (
    <div className="item-card">
      <h4>{item.name}</h4>
      <p className="hs-code">HS Code: {item.hs_code}</p>
      <div className="tax-breakdown">
        <span>Duty: {item.tax_breakdown.import_duty_percent}%</span>
        <span>VAT: {item.tax_breakdown.vat_percent}%</span>
        {item.tax_breakdown.other_charges_percent > 0 && (
          <span>Other: {item.tax_breakdown.other_charges_percent}%</span>
        )}
        <strong>Total: {totalTax}%</strong>
      </div>
      {item.tax_breakdown.notes && (
        <p className="note">{item.tax_breakdown.notes}</p>
      )}
      <details className="docs-details">
        <summary>Required Documents ({item.required_documents.length})</summary>
        <ul>
          {item.required_documents.map((doc, i) => (
            <li key={i}>{doc}</li>
          ))}
        </ul>
      </details>
    </div>
  );
};

// ── RulesModal ───────────────────────────────
const RulesModal = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title} - Rules</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p><strong>Purpose:</strong> Official proof of sale and value.</p>
          <p><strong>Format:</strong> PDF only. Must include HS codes.</p>
          <p><strong>Submit:</strong> 48 hours before shipment.</p>
        </div>
        <div className="modal-footer">
          <small>Last updated: Oct 15, 2025</small>
        </div>
      </div>
    </div>
  );
};

// ── ComingSoon ───────────────────────────────
const ComingSoon = () => (
  <div className="coming-soon">
    <h3>Coming Soon</h3>
    <p>This trade lane is under development.</p>
  </div>
);

// ── Main TradeLanePage Component ───────────────
const TradeLanePage = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [lanes, setLanes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Load saved lanes
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const snap = await getDocs(collection(db, "users", user.uid, "tradeLanes"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLanes(data);
      if (data.length && !selected) setSelected(data[0]);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!from || !to || !category) return;
    setIsSaving(true);
    try {
      const payload = { from, to, category, createdAt: new Date() };
      const ref = await addDoc(collection(db, "users", user.uid, "tradeLanes"), payload);
      const newLane = { id: ref.id, ...payload };
      setLanes((prev) => [...prev, newLane]);
      setSelected(newLane);
      reset();
      setShowWizard(false); // Close wizard after save
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (laneId) => {
    await deleteDoc(doc(db, "users", user.uid, "tradeLanes", laneId));
    setLanes((prev) => prev.filter((l) => l.id !== laneId));
    if (selected?.id === laneId) setSelected(lanes[0] || null);
  };

  const reset = () => {
    setFrom("");
    setTo("");
    setCategory("");
    setStep(1);
  };

  const openModal = (t) => {
    setModalTitle(t);
    setModalOpen(true);
  };

  const isIndiaToNepal = selected?.from === "India" && selected?.to === "Nepal";
  const selectedCategory = isIndiaToNepal ? selected?.category.toLowerCase() : null;
  const items = isIndiaToNepal
    ? indiaToNepalData.india_to_nepal[selectedCategory]?.items || []
    : [];

  if (!user) {
    return (
      <div className="dashboard1">
        <main className="main1" style={{ padding: "2rem", textAlign: "center" }}>
          <p>Please log in to continue.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard1">
      {/* Mobile Sidebar */}
      <Sidebar isMobile={true} isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main1">
        <header className="header1">
          <h1>Customs Clearance Wizard</h1>
        </header>

        {/* Trade Lanes Section */}
        <section className="trade-lanes-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Your Trade Lanes ({lanes.length})</h2>
            <button className="btn-green small" onClick={() => setShowWizard(!showWizard)}>
              {showWizard ? "Hide Wizard" : "New Trade Lane"}
            </button>
          </div>

          <div className="trade-lanes-list">
            {lanes.length === 0 ? (
              <p className="empty">No trade lanes yet. Click “New Trade Lane” to start.</p>
            ) : (
              lanes.map((l) => (
                <TradeLaneItem
                  key={l.id}
                  lane={l}
                  onClick={() => setSelected(l)}
                  isSelected={selected?.id === l.id}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>
        </section>

        {/* Selected Lane Output */}
        {selected && !showWizard && (
          <section className="checklist">
            <h3>
              {selected.from} to {selected.to} ({selected.category})
            </h3>

            {isIndiaToNepal ? (
              items.length > 0 ? (
                <div className="items-grid">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p>No items found for this category.</p>
              )
            ) : (
              <ComingSoon />
            )}
          </section>
        )}

        {/* Wizard */}
        {showWizard && (
          <section className="wizard">
            <div className="wizard-steps">
              <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
              <div className="line"></div>
              <div className={`step ${step === 2 ? "active" : ""}`}>2</div>
            </div>
            <h3>{step === 1 ? "Select Trade Lane" : "Choose Category"}</h3>

            {step === 1 ? (
              <div className="form-row">
                <CountrySelect label="Exporting From" value={from} onChange={setFrom} />
                <CountrySelect label="Importing To" value={to} onChange={setTo} />
              </div>
            ) : (
              <CategorySelect value={category} onChange={setCategory} />
            )}

            <div className="actions">
              {step === 2 && (
                <button className="btn-outline" onClick={() => setStep(1)}>
                  Back
                </button>
              )}
              <button
                className="btn-green"
                onClick={step === 1 ? () => from && to && setStep(2) : handleSave}
                disabled={
                  isSaving ||
                  (step === 1 && (!from || !to)) ||
                  (step === 2 && !category)
                }
              >
                {isSaving ? "Saving…" : step === 2 ? "Save & Generate" : "Next"}
              </button>
            </div>
          </section>
        )}

        {/* Floating AI Button */}
        <div className="widgets1">
          <div className="floating-ai1">
            <a href="/ai-assistant" className="floating-btn1">
              <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8" />
              <span>Ask AI for detailed information.</span>
            </a>
          </div>
        </div>

        <RulesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} />
      </main>
    </div>
  );
};

export default TradeLanePage;