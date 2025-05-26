import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import BatterStats from "./BatterStats";
import AllPlayerStats from "./AllPlayerStats";
import { Routes, Route } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);
  return (
    <Routes>
      <Route path="/" element={<AllPlayerStats />} />
      <Route path="/player/:id" element={<BatterStats />} />
    </Routes>
  );
}

export default App;
