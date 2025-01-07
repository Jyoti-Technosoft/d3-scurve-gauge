import React from "react";

import Dashboard from "./Components/Dashboard";
import SCurveChart from "./Components/SCurveChart";
import data from "./Constants/Data.json";
import "./App.css";
import GroupedBarChart from "./Components/GroupedBarChart";

function App() {
  const isDarkMode = true;
  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <Dashboard />
      <SCurveChart 
        data={data}
        chartTitle="S-Curve"
        xAxisTitle="Start Date"
        yAxisTitleLeft="Baseline Planned Total Cost (%)"
        yAxisTitleRight="Physical Progress (%)"
      />
      <GroupedBarChart
        data={data}
        chartTitle="Cost Performance Summary"
        xAxisTitle="Start Date"
        yAxisTitleLeft="Sum Cummulative Baseline Planned Total Cost"
        yAxisTitleRight="Cummulative Sum Actual Cost"
      />
      {/* <SCurveHistogramChart data={data} /> */}
    </div>
  );
}

export default App;
