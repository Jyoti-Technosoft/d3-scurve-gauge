import React from "react";

import Dashboard from "./Components/Dashboard";
import SCurveChart from "./Components/SCurveChart";
import data from "./Constants/Data.json";
import "./App.css";
import SCurveHistogramChart from "./Components/SCurveHistogramChart";

function App() {
  return (
    <div className="App">
      <Dashboard />
      <SCurveChart data={data} />
      <SCurveHistogramChart data={data} />
    </div>
  );
}

export default App;
