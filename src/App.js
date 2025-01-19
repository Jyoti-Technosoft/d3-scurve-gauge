import React, { useState } from "react";

import Dashboard from "./Components/Dashboard";
import SCurveChart from "./Components/SCurveChart";
import GroupedBarChart from "./Components/GroupedBarChart";
import GanttChart from "./Components/GanttChart";
import data from "./Json/spread-period.json";
import projectInfoData from "./Json/project-info.json";
import blMilestoneActivity from "./Json/BL-milestoneActivity.json";
import upMilestoneActivity from "./Json/UP-milestoneActivity.json";
import wbsData from "./Json/wbsFile.json";
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };
  let tasks = [];

  const preparedTasks = () => {
    const map = new Map();
    const mapItem = new Map(); // Keeps track of milestones grouped by WBS Object IDs
    const result = [];
    // Step 1: Add all WBS objects to the map and initialize `children` array
    wbsData.forEach(item => {
      // if (item.parentObjectId != null) {
        map.set(item.code, {
          ...item,
          children: [],
          startDate: new Date(item.startDate),
          finishDate: new Date(item.finishDate),
          type: "WBS",
        });
      // }
    });

    const groupedMilestones = {};
    // Iterate over each milestone
    blMilestoneActivity.forEach(milestone => {
      const { wbsId, name } = milestone;
      // Initialize the outer object if it doesn't exist
      if (!groupedMilestones[wbsId]) {
        groupedMilestones[wbsId] = {};
      }

      // Initialize the inner object if it doesn't exist
      if (!groupedMilestones[wbsId][name]) {
        groupedMilestones[wbsId][name] = [];
      }

      // Push the milestone object into the appropriate array
      if (groupedMilestones[wbsId][name].length == 0) {
        groupedMilestones[wbsId][name].push({
          ...milestone,
          type: "milestone",
          children: [],
          startDate: new Date(milestone.startDate),
          finishDate: new Date(milestone.finishDate),
          BL_milestoneActivityStartDate: milestone.type === "START_MILESTONE" ? new Date(milestone.startDate) : null, 
          BL_milestoneActivityFinishDate: milestone.type === "FINISH_MILESTONE" ? new Date(milestone.finishDate) : null,
        });
      } else {
        groupedMilestones[wbsId][name][0] = {
          ...milestone,
          ...groupedMilestones[wbsId][name][0],
          type: "milestone",
          children: [],
          BL_milestoneActivityStartDate: milestone.type === "START_MILESTONE" ? new Date(milestone.startDate) : null, 
          BL_milestoneActivityFinishDate: milestone.type === "FINISH_MILESTONE" ? new Date(milestone.finishDate) : null,
        };
      }
    });
    // Iterate over each milestone
    upMilestoneActivity.forEach(milestone => {
      const { wbsId, name } = milestone;

      // Initialize the outer object if it doesn't exist
      if (!groupedMilestones[wbsId]) {
        groupedMilestones[wbsId] = {};
      }

      // Initialize the inner object if it doesn't exist
      if (!groupedMilestones[wbsId][name]) {
        groupedMilestones[wbsId][name] = [];
      }

      // Push the milestone object into the appropriate array
      if (groupedMilestones[wbsId][name].length == 0) {
        groupedMilestones[wbsId][name].push({
          ...milestone,
          type: "milestone",
          children: [],
          UP_milestoneActivityStartDate: milestone.type === "START_MILESTONE" ? new Date(milestone.startDate) : null,
          UP_milestoneActivityFinishDate: milestone.type === "FINISH_MILESTONE" ? new Date(milestone.finishDate) : null,
        });
      } else {
        groupedMilestones[wbsId][name][0] = {
          ...milestone,
          ...groupedMilestones[wbsId][name][0],
          children: [],
          UP_milestoneActivityStartDate: milestone.type === "START_MILESTONE" ? new Date(milestone.startDate) : null,
          UP_milestoneActivityFinishDate: milestone.type === "FINISH_MILESTONE" ? new Date(milestone.finishDate) : null,
        };
      }
    });
    console.log("Final mapItem with all milestones:", groupedMilestones);
    // Step 4: Build the hierarchy
    // let wbsMapping = {};
    Object.keys(groupedMilestones).forEach((key) => {
      console.log("VALUES ===> ", key, groupedMilestones[key])
      let wbs = map.get(key);
      // let mapping = wbsMapping[key];
      if (wbs && wbs.parentObjectId != null) {
        let children = [];
        Object.values(groupedMilestones[key]).forEach(value => {
          children = children.concat(value);
        });
        wbs.children = wbs.children.concat(children);
        result.push({...wbs});
        // if (mapping) {
          // result[mapping].children = result[mapping].children.concat
        // } else {
        //   mapping = {
        //     ...mapping,
        //     [key] : result.length
        //   }
        // }
      }
    })
    // wbsData.forEach(item => {
    //   if (item.parentObjectId === null) {
    //       // Top-level WBS (no parent)
    //       result.push({ ...map.get(item.objectId), type: "WBS" });
    //   } else {
    //       // Child WBS: find its parent and add it to the `children` array
    //       // result.push({ ...map.get(item.objectId), type: "WBS" });
    //       // let parentNode = result.filter(value => value.objectId === item.parentObjectId);
    //       // console.log("PARENT NOEE ", parentNode)
    //       // if (parentNode.length > 0) {
    //       //   parentNode[0].children.push(map.get(item.objectId));
    //       // } else {
    //       //   // let obj = { ...map.get(item.objectId), type: "WBS" };
    //       //   // if (obj.parentObjectId != null) {
    //       //   result.push({ ...map.get(item.objectId), type: "WBS" });
    //       //   // }
    //       // }
    //       const parent = map.get(item.parentObjectId);
    //       if (parent) {
    //           parent.children.push(map.get(item.objectId));
    //       }
    //   }
    // });

    // if (groupedMilestones[item.code]) {
    //   // children = children.concat(Object.values(groupedMilestones[item.code])[0]);
    //   // console.log("FOUND VALUE ===>", children);
    // }
    // console.log("GROUPED ===>", mapNewMilestones(result, groupedMilestones));

    console.log("DATA ==> ", result)
    // wbsData.forEach(item => {
    //   const enrichedItem = map.get(item.objectId);
    //   enrichedItem.milestones = mapItem.get(item.objectId) || []; // Add milestones if any
    //   if (item.parentObjectId === null) {
    //     // Top-level WBS (no parent)
    //     result.push(enrichedItem);
    //   } else {
    //     // Child WBS: find its parent and add it to the `children` array
    //     const parent = map.get(item.parentObjectId);
    //     if (parent) {
    //       parent.children.push(enrichedItem);
    //     }
    //   }
    // });
    // console.log("Final WBS hierarchy with milestones:", result);
    tasks = result;
    return result;
  }

  // Recursive function to traverse and map new milestones
function mapNewMilestones(existingList, newMilestones) {
  existingList.forEach(item => {
      // Check if the item has children
      if (item.children && item.children.length > 0) {
          item.children.forEach(child => {
              // Check if the child's code matches any key in newMilestones
              if (newMilestones[child.code]) {
                  // Map the new milestones to the child
                  const milestoneEntries = newMilestones[child.code];
                  Object.values(milestoneEntries).forEach(milestone => {
                    child.children = child.children.concat(milestone);
                  });
                  // for (const milestoneName in milestoneEntries) {
                  //     if (milestoneEntries.hasOwnProperty(milestoneName)) {
                  //         child.children.push(milestoneEntries[milestoneName]);
                  //     }
                  // }
              }
              // Recursively check for children of the current child
              mapNewMilestones(child.children, newMilestones);
          });
      } else if (newMilestones[item.code]) {
        let children = [];
        Object.values(newMilestones[item.code]).forEach(milestone => {
          children = children.concat(milestone);
        });
        item.children = children;
        // console.log("VALUES ===> ", Object.values(newMilestones[item.code]))
      }
  });
}

// Call the function to map new milestones
  preparedTasks();

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <div className="button-container">
        <button className="mode-toggle-button" onClick={toggleDarkMode}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <GanttChart isDarkMode={isDarkMode} tasks={tasks} blMilestoneActivity={blMilestoneActivity} upMilestoneActivity={upMilestoneActivity} wbsData={wbsData} />
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
