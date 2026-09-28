import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gate from "./routes/Gate";
import Chat from "./routes/Chat";
import Landing from "./routes/Landing";
import LegalPage from "./routes/LegalPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/gate" element={<Gate />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/terms" element={<LegalPage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/safety" element={<LegalPage />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}