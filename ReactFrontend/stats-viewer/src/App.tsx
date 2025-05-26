import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import BatterStats from "./BatterStats";
import AllPlayerStats from "./AllPlayerStats";
import PitcherStats from "./PitcherStats";
import { Routes, Route } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);
  return (
    <Routes>
      <Route path="/" element={<AllPlayerStats />} />
        <Route path="/batter/:id" element={<BatterStats />} />
        {/* <Route path="/pitcher/:id" element={<PitcherStats />} /> */}
    </Routes>
  );
}

export default App;
