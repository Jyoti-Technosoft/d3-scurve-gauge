import React, { useState } from "react";

import Dashboard from "./Components/Dashboard";
import SCurveChart from "./Components/SCurveChart";
import GroupedBarChart from "./Components/GroupedBarChart";
import GanttChart from "./Components/GanttChart";
import data from "./Json/spread-period.json";
import projectInfoData from "./Json/project-info.json";
import blMilestoneActivity from "./Json/BL-milestoneActivity.json";
import upMilestoneActivity from "./Json/UP-milestoneActivity.json";
import cumulativeResourceSpreadPeriodList from "./Json/cumulativeResourceSpreadPeriodList.json";
import tabularResourceSpreadPeriodList from "./Json/tabularResourceSpreadPeriodList.json";
import wbsData from "./Json/wbsFile.json";
import "./App.css";
import HistogramWithSCurve from "./Components/HistogramWithSCurve";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <div className="button-container">
        <button className="mode-toggle-button" onClick={toggleDarkMode}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <HistogramWithSCurve 
        isDarkMode={isDarkMode}
        data={cumulativeResourceSpreadPeriodList}
        tabularResourceSpreadPeriodList={tabularResourceSpreadPeriodList}
        chartTitle="Histogram Chart"
        xAxisTitle="Dates"
        yAxisTitleLeft="Planned Unit"
        yAxisTitleRight="Planned Unit"
        projectInfoData={projectInfoData}
      />
      <GanttChart 
        isDarkMode={isDarkMode} 
        blMilestoneActivity={blMilestoneActivity} 
        upMilestoneActivity={upMilestoneActivity} 
        wbsData={wbsData}
        baselineActivityMarkerColor={"#1600F0"}
        updatedActivityMarkerColor={"#E12F23"}
      />
      <Dashboard isDarkMode={isDarkMode} projectInfoData={projectInfoData}/>
      <SCurveChart 
        isDarkMode={isDarkMode}
        data={data}
        chartTitle="S-Curve"
        xAxisTitle="Dates"
        yAxisTitleLeft="Baseline Planned (%)"
        yAxisTitleRight="Physical Progress (%)"
        projectInfoData={projectInfoData}
      />
      <GroupedBarChart
        isDarkMode={isDarkMode}
        data={data}
        chartTitle="Cost Performance Summary"
        xAxisTitle="Dates"
        yAxisTitleLeft="Sum Cummulative Baseline Planned Total Cost"
        yAxisTitleRight="Cummulative Sum Actual Cost"
        currencySymbol="$" // Pass currency symbols from here ₹,..
      />
    </div>
  );
}

export default App;
