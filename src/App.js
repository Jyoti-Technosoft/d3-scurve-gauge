import React, { useState } from "react";

import Dashboard from "./Components/Dashboard";
import SCurveChart from "./Components/SCurveChart";
import GroupedBarChart from "./Components/GroupedBarChart";
import data from "./Json/spread-period.json";
import projectInfoData from "./Json/project-info.json";
import blMilestoneActivity from "./Json/BL-milestoneActivity.json";
import upMilestoneActivity from "./Json/UP-milestoneActivity.json";
import "./App.css";
import GanttChart from "./Components/GanttChart";
import SynchronizedScroll from "./Components/SynchronizedScroll";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const tasks = [
    {
      id: 1,
      task: 'Product Development 2025',
      type: 'project',
      start: new Date(2025, 0, 1),
      end: new Date(2025, 3, 30),
      children: [
        {
          id: 2,
          task: 'Planning Phase',
          type: 'phase',
          start: new Date(2025, 0, 1),
          end: new Date(2025, 0, 15),
          children: [
            {
              id: 3,
              task: 'Requirements Gathering',
              type: 'task',
              start: new Date(2025, 0, 1),
              end: new Date(2025, 0, 7),
            },
            {
              id: 4,
              task: 'Project Planning',
              type: 'task',
              start: new Date(2025, 0, 8),
              end: new Date(2025, 0, 14),
            },
            {
              id: 5,
              task: 'Planning Review',
              type: 'milestone',
              start: new Date(2025, 0, 15),
              end: new Date(2025, 0, 15),
            }
          ]
        },
        {
          id: 6,
          task: 'Design Phase',
          type: 'phase',
          start: new Date(2025, 0, 16),
          end: new Date(2025, 1, 15),
          children: [
            {
              id: 7,
              task: 'UI/UX Design',
              type: 'task',
              start: new Date(2025, 0, 16),
              end: new Date(2025, 1, 5),
            },
            {
              id: 8,
              task: 'Architecture Design',
              type: 'task',
              start: new Date(2025, 0, 20),
              end: new Date(2025, 1, 10),
            },
            {
              id: 9,
              task: 'Design Review',
              type: 'milestone',
              start: new Date(2025, 1, 15),
              end: new Date(2025, 1, 15),
            }
          ]
        },
        {
          id: 10,
          task: 'Development Phase',
          type: 'phase',
          start: new Date(2025, 1, 16),
          end: new Date(2025, 2, 31),
          children: [
            {
              id: 11,
              task: 'Frontend Development',
              type: 'task',
              start: new Date(2025, 1, 16),
              end: new Date(2025, 2, 15),
              children: [
                {
                  id: 12,
                  task: 'Component Development',
                  type: 'task',
                  start: new Date(2025, 1, 16),
                  end: new Date(2025, 2, 5),
                },
                {
                  id: 13,
                  task: 'Integration',
                  type: 'task',
                  start: new Date(2025, 2, 6),
                  end: new Date(2025, 2, 15),
                }
              ]
            },
            {
              id: 14,
              task: 'Backend Development',
              type: 'task',
              start: new Date(2025, 1, 20),
              end: new Date(2025, 2, 25),
              children: [
                {
                  id: 15,
                  task: 'API Development',
                  type: 'task',
                  start: new Date(2025, 1, 20),
                  end: new Date(2025, 2, 10),
                },
                {
                  id: 16,
                  task: 'Database Setup',
                  type: 'task',
                  start: new Date(2025, 2, 11),
                  end: new Date(2025, 2, 25),
                }
              ]
            },
            {
              id: 17,
              task: 'Development Complete',
              type: 'milestone',
              start: new Date(2025, 2, 31),
              end: new Date(2025, 2, 31),
            }
          ]
        },
        {
          id: 18,
          task: 'Testing Phase',
          type: 'phase',
          start: new Date(2025, 3, 1),
          end: new Date(2025, 3, 30),
          children: [
            {
              id: 19,
              task: 'Unit Testing',
              type: 'task',
              start: new Date(2025, 3, 1),
              end: new Date(2025, 3, 10),
            },
            {
              id: 20,
              task: 'Integration Testing',
              type: 'task',
              start: new Date(2025, 3, 11),
              end: new Date(2025, 3, 20),
            },
            {
              id: 21,
              task: 'User Acceptance Testing',
              type: 'task',
              start: new Date(2025, 3, 21),
              end: new Date(2025, 3, 29),
            },
            {
              id: 22,
              task: 'Project Release',
              type: 'milestone',
              start: new Date(2025, 3, 30),
              end: new Date(2025, 3, 30),
            }
          ]
        }
      ]
    }
  ];

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <SynchronizedScroll />
      <div className="button-container">
        <button className="mode-toggle-button" onClick={toggleDarkMode}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <GanttChart tasks={tasks} blMilestoneActivity={blMilestoneActivity} upMilestoneActivity={upMilestoneActivity} />
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
