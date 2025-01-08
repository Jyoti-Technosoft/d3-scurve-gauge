import React from "react";

import Dashboard from "./Components/Dashboard";
import SCurveChart from "./Components/SCurveChart";
import GroupedBarChart from "./Components/GroupedBarChart";
import data from "./Json/spread-period.json";
import projectInfoData from "./Json/project-info.json";
import "./App.css";

function App() {
  const isDarkMode = false;
  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <Dashboard isDarkMode={isDarkMode} projectInfoData={projectInfoData}/>
      <SCurveChart 
        isDarkMode={isDarkMode}
        data={data}
        chartTitle="S-Curve"
        xAxisTitle="Start Date"
        yAxisTitleLeft="Baseline Planned (%)"
        yAxisTitleRight="Physical Progress (%)"
        projectInfoData={projectInfoData}
      />
      <GroupedBarChart
        isDarkMode={isDarkMode}
        data={data}
        chartTitle="Cost Performance Summary"
        xAxisTitle="Start Date"
        yAxisTitleLeft="Sum Cummulative Baseline Planned Total Cost"
        yAxisTitleRight="Cummulative Sum Actual Cost"
        currencySymbol="$" // Pass currency symbols from here ₹,..
      />
    </div>
  );
}

export default App;
