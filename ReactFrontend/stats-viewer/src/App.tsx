import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import BatterStats from "./BatterStats";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BatterStats player_id={1} />
      <BatterStats player_id={2} />
      <BatterStats player_id={3} />
    </>
  );
}

export default App;
