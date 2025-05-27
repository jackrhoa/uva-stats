import "./App.css";
import BatterStats from "./BatterStats";
import AllPlayerStats from "./AllPlayerStats";
import PitcherStats from "./PitcherStats";
import BetterPitcherStats from "./BetterPitcherStats";
import { Routes, Route } from "react-router-dom";
import PitcherStatsTanStack from "./PitcherStatsTanStack";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AllPlayerStats />} />
      <Route path="/batter/:id" element={<BatterStats />} />
      {/* <Route path="/pitcher/:id" element={<PitcherStats />} /> */}
      <Route path="/pitcher/:id" element={<PitcherStatsTanStack />} />
    </Routes>
  );
}

export default App;
