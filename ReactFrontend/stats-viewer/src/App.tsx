import "./App.css";
import BatterStats from "./components/BatterStats";
// import AllPlayerStats from "./components/AllPlayerStats";
import { Routes, Route } from "react-router-dom";
import PitcherStatsTanStack from "./components/PitcherStatsTanStack";
import Nav from "./components/Nav";
import NewAllPlayerStats from "./components/AllPlayerStats";
function App() {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<NewAllPlayerStats />} />
        {/* <Route path="/" element={<AllPlayerStats />} /> */}
        <Route path="/batter/:id" element={<BatterStats />} />
        {/* <Route path="/pitcher/:id" element={<PitcherStats />} /> */}
        <Route path="/pitcher/:id" element={<PitcherStatsTanStack />} />
      </Routes>
    </div>
  );
}

export default App;
