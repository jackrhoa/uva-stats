import "./App.css";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import AllPlayerStats from "./components/AllPlayerStats";
import PlayerStats from "./components/PlayerStats";
import { Error } from "./components/Error";
function App() {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<AllPlayerStats />} />
        <Route path="/player/:id" element={<PlayerStats />} />
        <Route
          path="*"
          element={<Error message={"Error 404: Page not found"} />}
        />
      </Routes>
    </div>
  );
}

export default App;
