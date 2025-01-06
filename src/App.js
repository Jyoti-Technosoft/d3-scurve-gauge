import React from "react";

import Dashboard from "./Components/Dashboard";
import SCurveChart from "./Components/SCurveChart";
import data from "./Constants/Data.json";
import "./App.css";
import GroupedBarChart from "./Components/GroupedBarChart";

function App() {
  return (
    <div className="App">
      <Dashboard />
      <SCurveChart data={data} />
      <GroupedBarChart data={data} />
      {/* <SCurveHistogramChart data={data} /> */}
    </div>
  );
}

export default App;
