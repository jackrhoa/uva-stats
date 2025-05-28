import "./App.css";
import BatterStats from "./components/BatterStats";
import AllPlayerStats from "./components/AllPlayerStats";
import { Routes, Route } from "react-router-dom";
import PitcherStatsTanStack from "./components/PitcherStatsTanStack";

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
