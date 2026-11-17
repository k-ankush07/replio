import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import FunnelPage from "./Funnel";
import UpSell from "./UpSell";
import ConfirmationPage from "./ConfirmationPage";
import Replio from "./replio"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FunnelPage />} />
        <Route path="/upsell" element={<UpSell />} />
        <Route path="/upsell" element={<UpSell />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/replio" element={<Replio />} />
      </Routes>
    </BrowserRouter>
  );
}
