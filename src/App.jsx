// App.jsx – Fixed import path + routes

import React from "react";
import { Routes, Route } from "react-router-dom";
import PageLayout from "./components/layout/PageLayout";
import LoginSignupPage from "./pages/LoginSignupPage/LoginSignupPage.jsx";
// import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import DocumentUploadPage from "./pages/Dashboard/DocumentUploadPage/DocumentUploadPage.jsx"; // Correct path
import AiAssistantPage from "./pages/Dashboard/AiAssistantPage/AiAssistantPage.jsx";
import TradeLane from "./pages/Dashboard/TradeLane.jsx";
import MultiAgentPage from "./pages/Dashboard/MultiAgentPage/MultiAgentPage.jsx";
import "./index.css";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<PageLayout><div>Home Page Content</div></PageLayout>}/>
      {/* Login */}
      <Route path="/login" element={<LoginSignupPage />} />
      {/* Dashboard */}
      <Route path="/tradelane" element={<TradeLane />} />
      <Route path="/ai-assistant" element={<AiAssistantPage />} />
      <Route path="/dashboard/documents" element={<DocumentUploadPage />} />
      <Route path="/multi-agent" element={<MultiAgentPage />} />
    </Routes>
  );
}

export default App;
