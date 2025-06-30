import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const styles = {
  ganttChart: {
    margin: "auto",
    width: "90%",
    paddingBottom: "5rem"
  },
  dropdownContainer: {
    margin: "20px 0",
    display: "flex",
    justifyContent: "end"
  },
  dropdown: {
    width: "200px",
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "5px",
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  dropdownOption: {
    padding: "10px"
  },
  ganttChartContainer: {
    display: "flex",
    marginBottom: "20px",
    height: "450px",
    maxHeight: "450px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  },
  taskTableContainer: {
    overflowY: "auto",
    height: "100%",
    width: "300px",
    maxWidth: "80%",
    borderRight: "1px solid #e5e7eb",
    minWidth: "200px"
  },
  splitBar: {
    width: "5px", /* Thickness of the split bar */
    background: "#ccc",
    cursor: "ew-resize", /* Resizing cursor */
    position: "relative",
    zIndex: 1,
  },
  taskTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.875rem"
  },
  taskTable_head: {
    position: "sticky",
    top: 0,
    background: "#07545e",
    color: "#FFFFFF",
    zIndex: 10,
    height: "55px"
  },
  taskTable_darkmode_thead: {
    background: "#07545e",
  },
  taskTable_th: {
    textAlign: "left",
    fontWeight: 600,
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  taskTable_td: {
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
    height: "20px"
  },
  taskRow: {
    transition: "background-color 0.2s"
  },
  expandButton: {
    background: "#FFFFFF",
    marginRight: "8px",
    cursor: "pointer",
    color: "#000000",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "5px",
    border: "1px solid #000000",
    fontSize: "18px",
    width: '18px',
    height: '16px',
    verticalAlign: 'middle'
  },
  expanded: {
    transform: "rotate(0deg)",
  },
  darkmode_expand_button: {
    background: "#121212",
    color: "#FFFFFF",
    border: "1px solid #FFFFFF"
  },
  chartContainer: {
    height: "100%",
    flex: 1,
    overflowX: "hidden",
    position: "relative",
  },
  chart_container_svg: {
    display: "block",
    minWidth: "100%"
  },
  chartContainer_1: {
    height: "calc(100% - 80px)",
    flex: 1,
    position: "relative"
  },
  chartContainer_1_svg: {
    display: "block",
    minWidth: "100%"
  },
  header_group: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    fontFamily: "inherit",
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
  month_background: {
    fill: "#f9fafb",
    stroke: "#e5e7eb",
    strokeWidth: 1
  },
  month_label: {
    fill: "#374151",
    fontSize: "0.875rem",
    fontWeight: 600,
    pointerEvents: "none",
    userSelect: "none",
    textAnchor: "middle",
    dominantBaseline: "central"
  },
  month_separator: {
    stroke: "#e5e7eb",
    strokeWidth: 1
  },
  year_header: {
    height: "30px",
    fill: "white",
    pointerEvents: "none",
  },
  year_header_text: {
    fontSize: "14px",
    fontWeight: 600,
    fill: "#111827",
    pointerEvents: "none",
    userSelect: "none",
    textAnchor: "middle",
    dominantBaseline: "central"
  },
  year_separator: {
    stroke: "#e5e7eb",
    strokeWidth: 1
  },
  month_header: {
    height: "25px",
    fill: "#f9fafb",
    pointerEvents: "none"
  },
  day_header: {
    height: "25px",
  },
  day_header_text: {
    fontSize: "12px",
    fontWeight: 500,
    fill: "#374151",
    textAnchor: "middle",
    dominantBaseline: "central",
    pointerEvents: "none"
  },
  headerCell: {
    fill: "#f9fafb",
    stroke: "#e5e7eb",
    strokeWidth: 1
  },
  day_header_cell: {
    fill: "white",
    pointerEvents: "none"
  },
  darkmode_day_header_cell: {
    fill: "#121212",
    stroke: "#e5e7eb"
  },
  bar: {
    rx: "4px",
    ry: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  darkmode_bar: {
    fill: "#FFFFFF"
  },
  grid_line: {
    stroke: "#f3f4f6",
    strokeWidth: 1,
    strokeDasharray: "2,2"
  },
  darkmode_grid_line: {
    stroke: "#000000"
  },
  ganttChartFilter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  ganttCharts: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  legendButton: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
  },
  legendIconBase: {
    width: "0",
    height: "0",
    marginRight: "10px",
    display: "inline-block",
    borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent",
    borderTop: "8px solid transparent",
    borderBottom: "8px solid transparent",
    transform: "rotate(45deg)",
  },
  legendIconBaseline: {
    backgroundColor: "#4E91FD",
  },
  taskDataTable_th: {
    verticalAlign: "middle",
    paddingTop: "5px",
    textAlign: "center"
  },
  taskDataTable_td: {
    padding: "5px",
    textAlign:'left'
  }
};

const TaskTable = ({ tasks, expandedTasks, onToggleExpand, showTaskTable, isDarkMode, timeInterval }) => {
  const renderTask = (task, level = 0) => {
    const isExpanded = expandedTasks.includes(task.objectId);
    const hasChildren = task.children && task.children.length > 0;

    return (
      <React.Fragment key={task.objectId}>
        <tr style={{ ...styles.taskRow }} className={`task-row ${task.type}`}>
          <td style={{ ...styles.taskTable_td, fontWeight: `${task.type === "WBS" ? "600" : "normal"} `, paddingLeft: `${(level * 20) + 10}px`, cursor: 'pointer' }} onClick={() => showTaskTable(task)}>
            {hasChildren && (
              <button
                style={{ padding: `${isExpanded ? "4px 8px 6px" : "8px 8px"}`, ...styles.expandButton, ...styles.expanded, ...(isDarkMode ? styles.darkmode_expand_button : {}) }}
                onClick={() => onToggleExpand(task.objectId)}
              >
                {isExpanded ? '-' : '+'}
              </button>
            )}
            {task.name}
          </td>
        </tr>
        {isExpanded && task.children && task.children.map(child => (
          renderTask(child, level + 1)
        ))}
      </React.Fragment>
    );
  };

  return (
    <table style={styles.taskTable} className="task-table">
      <thead style={{ ...styles.taskTable_head, ...(isDarkMode ? styles.taskTable_darkmode_thead : {}) }}>
        {timeInterval === "monthly" && <tr>
          <th style={{ ...styles.taskTable_th, borderBottom: "none" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                position: "relative",
                borderBottom: "1px solid #e5e7eb",
                height: "38px"
              }}
            >
              <span style={{ position: "sticky", left: 0 }}></span>
              <span
                style={{
                  position: "sticky",
                  right: 5,
                }}
              >
                Year  →
              </span>
            </div>
          </th>
        </tr>}
        {timeInterval !== "monthly" && <tr>
          <th style={{ ...styles.taskTable_th, borderBottom: "none", }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                position: "relative",
                borderBottom: "1px solid #e5e7eb",
                height: "38px"
              }}
            >
              <span style={{ position: "sticky", left: 5 }}></span>
              <span
                style={{
                  position: "sticky",
                  right: 5,
                }}
              >
                Month & Year →
              </span>
            </div>
          </th>
        </tr>}
        <tr>
          <th style={{ ...styles.taskTable_th, borderBottom: "none" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                position: "relative",
                borderBottom: "1px solid #e5e7eb",
                height: "38px"
              }}
            >
              <span style={{ position: "sticky", left: 10 }}>Task Name</span>
              <span
                style={{
                  position: "sticky",
                  right: 5,
                }}
              >
                {timeInterval === "monthly" ? "Month " : timeInterval === "daily" ? "Day " : "Week "}  →
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => renderTask(task))}
      </tbody>
    </table>
  );
};

const GanttChart = ({ blMilestoneActivity, upMilestoneActivity, wbsData, baselineActivityMarkerColor = "#1600F0", updatedActivityMarkerColor = "#E12F23", isDarkMode }) => {
  const [timeInterval, setTimeInterval] = useState("daily");
  const svgRef = useRef();
  const headerSvgRef = useRef();
  const taskTableRef = useRef();
  const headerContainerRef = useRef();
  const chartContainerRef = useRef();
  const splitBarRef = useRef();
  const [task, setTask] = useState();

  const transformDataToTask = () => {    
    const map = new Map();
    const result = [];
    wbsData.forEach(item => {
      map.set(item.objectId, {
        ...item,
        children: [],
        startDate: new Date(item.startDate),
        finishDate: new Date(item.finishDate),
        type: "WBS",
      });
    });

    const groupedMilestones = {};
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
      if (groupedMilestones[wbsId][name].length === 0) {
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
      if (groupedMilestones[wbsId][name].length === 0) {
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
    wbsData.forEach(item => {
      if (item.parentObjectId === null) {
          // Top-level WBS (no parent)
          result.push({ ...map.get(item.objectId), type: "WBS", visible: false });
        } else {
          // Child WBS: find its parent and add it to the `children` array
          const parent = map.get(item.parentObjectId);
          if (parent) {
            parent.children.push(map.get(item.objectId));
          }
          
        }
    });

    mapNewMilestones(result, groupedMilestones)

    // function processWBSAndMilestones(objects) {
    //   let result = [];
  
    //   for (const obj of objects) {
    //     if (obj.type === "WBS" && obj.parentObjectId == null) {
    //       let appendChildren = obj.children.filter(value => value.type === "WBS");
    //       appendChildren = appendChildren.filter(value => value.children.length > 0);
    //       result = result.concat(appendChildren);
    //     } else {
    //       result.push(obj);
    //     }
    //   }
  
    //   return result;
    // }

    // return processWBSAndMilestones(result);
    return result;
  };

  const expandInitialTopLevelTasks = (tasksList) => {
    let expandedTasks = [];
  
    const addTaskAndChildren = (task) => {
      // Add the current task's objectId to the list
      expandedTasks.push(task.objectId);
  
      // If the task has children, recursively process them
      if (task.children && Array.isArray(task.children)) {
        for (let child of task.children) {
          addTaskAndChildren(child);
        }
      }
    };
  
    // Iterate through the top-level tasks
    for (let t of tasksList) {
      addTaskAndChildren(t);
    }
  
    return expandedTasks;
  };

  const [tasks] = useState(transformDataToTask());
  const [expandedTasks, setExpandedTasks] = useState(expandInitialTopLevelTasks(tasks));

    // Recursive function to traverse and map new milestones
  function mapNewMilestones(existingList, newMilestones) {
    existingList.forEach(item => {
        if (item.children && item.children.length > 0) {
            item.children.forEach(child => {
                if (newMilestones[child.code]) {
                    const milestoneEntries = newMilestones[child.code];
                    Object.values(milestoneEntries).forEach(milestone => {
                      child.children = child.children.concat(milestone);
                    });
                }
                // Recursively check for children of the current child
                mapNewMilestones(child.children, newMilestones);
            });
        } else if (newMilestones[item.code]) {
          // if (item.parentObjectId != null) {
            let children = [];
            Object.values(newMilestones[item.code]).forEach(milestone => {
              children = children.concat(milestone);
            });
            item.children = children;
          // }
        }
    });
  }

  const addToDate = (date, quantity, scale) => {
    var newDate = new Date(date.getFullYear() + (scale === "year" ? quantity : 0), date.getMonth() + (scale === "month" ? quantity : 0), date.getDate() + (scale === "day" ? quantity : 0), date.getHours() + (scale === "hour" ? quantity : 0), date.getMinutes() + (scale === "minute" ? quantity : 0), date.getSeconds() + (scale === "second" ? quantity : 0), date.getMilliseconds() + (scale === "millisecond" ? quantity : 0));
    return newDate;
  };

  const startOfDate = (date, scale) => {
    var scores = ["millisecond", "second", "minute", "hour", "day", "month", "year"];


    var shouldReset = function shouldReset(_scale) {
      var maxScore = scores.indexOf(scale);
      return scores.indexOf(_scale) <= maxScore;
    };


    var newDate = new Date(date.getFullYear(), shouldReset("year") ? 0 : date.getMonth(), shouldReset("month") ? 1 : date.getDate(), shouldReset("day") ? 0 : date.getHours(), shouldReset("hour") ? 0 : date.getMinutes(), shouldReset("minute") ? 0 : date.getSeconds(), shouldReset("second") ? 0 : date.getMilliseconds());
    return newDate;
  };

  const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };


  const ganttDateRange = useCallback((
    tasks,
    viewMode,
    preStepsCount
  ) => {
    let newStartDate = tasks[0].startDate;
    let newEndDate = tasks[0].startDate;
    for (const task of tasks) {
      if (task.startDate < newStartDate) {
        newStartDate = task.startDate;
      }
      if (task.finishDate > newEndDate) {
        newEndDate = task.finishDate;
      }
    }
    switch (viewMode) {
      case "yearly":
        newStartDate = addToDate(newStartDate, -1, "year");
        newStartDate = startOfDate(newStartDate, "year");
        newEndDate = addToDate(newEndDate, 1, "year");
        newEndDate = startOfDate(newEndDate, "year");
        break;
      case "":
        newStartDate = addToDate(newStartDate, -3, "month");
        newStartDate = startOfDate(newStartDate, "month");
        newEndDate = addToDate(newEndDate, 3, "year");
        newEndDate = startOfDate(newEndDate, "year");
        break;
      case "monthly":
        newStartDate = addToDate(newStartDate, -1 * preStepsCount, "month");
        newStartDate = startOfDate(newStartDate, "month");
        newEndDate = addToDate(newEndDate, 1, "year");
        newEndDate = startOfDate(newEndDate, "year");
        break;
      case "weekly":
        newStartDate = startOfDate(newStartDate, "day");
        newStartDate = addToDate(
          getMonday(newStartDate),
          -7 * preStepsCount,
          "day"
        );
        newEndDate = startOfDate(newEndDate, "day");
        newEndDate = addToDate(newEndDate, 1.5, "month");
        break;
      case "daily":
        newStartDate = startOfDate(newStartDate, "day");
        newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
        newEndDate = startOfDate(newEndDate, "day");
        newEndDate = addToDate(newEndDate, 19, "day");
        break;
      default:
        break;
    }
    return [newStartDate, newEndDate];
  }, []);

  const showTaskTable = (task) => {
    // if ((task.parentObjectId !== null && task.children.length > 0) || task.type === "milestone") {
    setTask(task);
    // }
    // setIsTaskClicked(true);
  }

  const flattenTasks = useCallback((tasks, result = []) => {
    tasks.forEach(task => {
      result.push(task);
      if (task.children && expandedTasks.includes(task.objectId)) {
        flattenTasks(task.children, result);
      }
    });
    return result;
  }, [expandedTasks]);

  const handleToggleExpand = (taskId) => {
    setExpandedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const flatTasks = flattenTasks(tasks);

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    d3.select(headerSvgRef.current).selectAll("*").remove();

    const headerHeights = {
      year: 30,
      month: 25,
      day: 25
    };
    const totalHeaderHeight = headerHeights.year + headerHeights.month + headerHeights.day;
    const margin = {
      top: 0,
      right: 30,
      bottom: 20,
      left: 0
    };

    // Calculate minimum width needed for all days
    let minDayWidth = 40;
    let startDate = d3.min(flatTasks, d => d.startDate);
    let endDate = d3.max(flatTasks, d => d.finishDate);
    [startDate, endDate] = ganttDateRange(flatTasks, timeInterval, 1);

    let totalDays = d3.timeDay.count(startDate, endDate);
    if (timeInterval === "monthly") {
      totalDays = d3.timeMonth.count(startDate, endDate);
      minDayWidth = 150;
    } else if (timeInterval === "weekly") {
      totalDays = d3.timeWeek.count(startDate, endDate);
      minDayWidth = 80;
    }
    const minChartWidth = totalDays * minDayWidth;

    // Calculate container width
    const containerWidth = document.querySelector('.chart-container-1').clientWidth;
    const chartWidth = Math.max(minChartWidth, containerWidth);
    const rowHeight = 37; 
    const barHeight = 25; 
    const chartHeight = flatTasks.length * rowHeight;

    // Create SVG with the calculated dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', chartWidth - 45)
      .attr('height', chartHeight);
    const headerSvg = d3.select(headerSvgRef.current)
      .attr('width', chartWidth - 45)
      .attr('height', totalHeaderHeight);

    // Update time scale with new width
    const timeScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, chartWidth - margin.left - margin.right]);

    // Create chart container with horizontal scroll if needed
    d3.select('.chart-container-1')
      .style('overflow-x', chartWidth > containerWidth ? 'auto' : 'hidden');

    // Create header group
    const headerGroup = headerSvg.append('g')
      .attr('class', 'header-group')
      .style('position', styles.header_group.position)
      .style('top', styles.header_group.top)
      .style('z-index', styles.header_group.zIndex)
      .style('font-family', styles.header_group.fontFamily)
      .style('box-shadow', styles.header_group.boxShadow)
      .attr('transform', `translate(-25,0)`);

    // Create chart group with proper offset
    const chartGroup = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (timeInterval === "monthly") {
      headerHeights.year = headerHeights.year + 12.5;
      headerHeights.month = headerHeights.month + 12.5;
    } else {
      headerHeights.month = headerHeights.month + 15;
      headerHeights.day = headerHeights.day + 15;
    }
    // Add year headers
    if (timeInterval === "monthly") {
      const years = d3.timeYear.range(startDate, endDate, 1);
      headerGroup.append('g')
        .attr('class', 'year-header')
        .style('fill', isDarkMode ? "#121212" : styles.year_header.fill)
        .style('height', styles.year_header.height)
        .style('stroke', styles.year_header.stroke)
        .style('stroke-width', styles.year_header.strokeWidth)
        .style('pointer-events', styles.year_header.pointerEvents)
        .selectAll('.year-cell')
        .data(years)
        .enter()
        .append('g')
        .attr('class', 'year-cell')
        .each(function (d) {
          const year = d3.select(this);
          let yearStartDate = d;
          const yearStart = timeScale(yearStartDate);
          let yearEndDate = d3.timeYear.offset(d, 1);
          if (endDate < yearEndDate) {
            yearEndDate = endDate;
          }
          const yearEnd = timeScale(yearEndDate);
          const yearWidth = yearEnd - yearStart;

          // Add year background
          year.append('rect')
            .attr('x', yearStart)
            .attr('y', 0)
            .attr('width', yearWidth)
            .attr('height', headerHeights.year)
            .attr('class', 'year-background');
          year.append('text')
            .attr('x', function () {
              return yearStart + yearWidth / 2;
            })
            .attr('y', (headerHeights.year / 2) - 5)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('class', 'year-label')
            .style('fill', isDarkMode ? "#FFFFFF" : styles.year_header_text.fill)
            .style('font-size', styles.year_header_text.fontSize)
            .style('font-weight', styles.year_header_text.fontWeight)
            .style('pointer-events', styles.year_header_text.pointerEvents)
            .style('user-select', styles.year_header_text.userSelect)
            .style('text-anchor', styles.year_header_text.textAnchor)
            .style('dominant-baseline', styles.year_header_text.dominantBaseline)
            .text(d => (d3.timeFormat('%Y')(d)));

          // Add vertical separator line
          year.append('line')
            .style('stroke', styles.year_separator.stroke)
            .style('stroke-width', styles.year_separator.strokeWidth)
            .attr('x1', yearStart)
            .attr('x2', yearStart)
            .attr('y1', 0)
            .attr('y2', headerHeights.year);
        });
    }

    // Add month headers with similar dynamic centering
    const months = d3.timeMonth.range(startDate, endDate);
    headerGroup.append('g')
      .attr('class', 'month-header')
      .style('fill', styles.month_header.fill)
      .style('height', styles.month_header.height)
      .style('pointer-events', styles.month_header.pointerEvents)
      .attr('transform', timeInterval === "monthly" ? `translate(0,${headerHeights.year})` : 'translate(0,0)')
      .selectAll('.month-cell')
      .data(months)
      .enter()
      .append('g')
      .attr('class', 'month-cell')
      .each(function (d) {
        const month = d3.select(this);
        const monthStart = timeScale(d);
        let monthEndDate = d3.timeMonth.offset(d, 1);
        if (endDate < monthEndDate) {
          monthEndDate = endDate;
        }
        const monthEnd = timeScale(monthEndDate);
        const monthWidth = monthEnd - monthStart;
        // Add month background
        month.append('rect')
          .attr('x', monthStart)
          .attr('y', 0)
          .attr('width', monthWidth)
          .attr('height', headerHeights.month)
          .style('fill', isDarkMode ? "#121212" : styles.month_background.fill)
          .style('stroke', styles.month_background.stroke)
          .style('stroke-width', styles.month_background.strokeWidth)
        month.append('text')
          .attr('x', function () {
            return (monthStart + monthWidth / 2);
          })
          .attr('y', (headerHeights.month / 2) - 5)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('class', 'month-label')
          .style('fill', isDarkMode ? "#FFFFFF" : styles.month_label.fill)
          .style('font-size', styles.month_label.fontSize)
          .style('font-weight', styles.month_label.fontWeight)
          .style('pointer-events', styles.month_label.pointerEvents)
          .style('user-select', styles.month_label.userSelect)
          .style('text-anchor', styles.month_label.textAnchor)
          .style('dominant-baseline', styles.month_label.dominantBaseline)
          .text(d3.timeFormat(timeInterval === "monthly" ? '%b' : '%b %Y')(d));

        // Add separator line
        month.append('line')
          .attr('class', 'month-separator')
          .style('stroke', styles.month_separator.stroke)
          .style('stroke-width', styles.month_separator.strokeWidth)
          .attr('x1', monthStart)
          .attr('x2', monthStart)
          .attr('y1', 0)
          .attr('y2', headerHeights.month);
      });

    if (timeInterval === "daily") {
      // Add day headers with increased minimum width
      const days = d3.timeDay.range(...timeScale.domain());
      headerGroup.append('g')
        .attr('height', styles.day_header.height)
        .attr('transform', `translate(0,${headerHeights.month})`)
        .selectAll('.day-cell')
        .data(days)
        .enter()
        .append('g')
        .attr('class', 'day-cell')
        .each(function (d) {
          const dayStart = timeScale(d);
          const dayEnd = timeScale(d3.timeDay.offset(d, 1));
          const dayWidth = Math.max(dayEnd - dayStart, minDayWidth);
          const g = d3.select(this);

          g.append('rect')
            .attr('x', dayStart)
            .attr('y', 0)
            .attr('width', dayWidth)
            .attr('height', headerHeights.day)
            .style('fill', isDarkMode ? "#121212" : styles.day_header_cell.fill)
            .style('pointer-events', styles.day_header_cell.pointerEvents)
            .style('stroke', isDarkMode ? "#e5e7eb" : styles.headerCell.stroke)
            .style('stroke-width', styles.headerCell.strokeWidth)
          g.append('text')
            .attr('x', dayStart + (dayWidth / 2))
            .attr('y', headerHeights.day / 2)
            .attr('dy', '.1em')
            .text(d3.timeFormat('%d')(d))
            .style('fill', isDarkMode ? "#FFFFFF" : styles.day_header_text.fill)
            .style('font-size', styles.day_header_text.fontSize)
            .style('font-weight', styles.day_header_text.fontWeight)
            .style('text-anchor', styles.day_header_text.textAnchor)
            .style('dominant-baseline', styles.day_header_text.dominantBaseline)
            .style('pointer-events', styles.day_header_text.pointerEvents)
        });
    } else if (timeInterval === "weekly") {
      // Add day headers with increased minimum width
      const days = d3.timeWeek.range(...timeScale.domain());
      headerGroup.append('g')
        .attr('class', 'day-header')
        .style('height', styles.day_header.height)
        .attr('transform', `translate(0,${headerHeights.month})`)
        .selectAll('.day-cell')
        .data(days)
        .enter()
        .append('g')
        .attr('class', 'day-cell')
        .each(function (d) {
          const dayStart = timeScale(d);
          let weekEndDate = d3.timeWeek.offset(d, 1);
          if (endDate < weekEndDate) {
            weekEndDate = endDate;
          }
          const dayEnd = timeScale(weekEndDate);
          const dayWidth = Math.max(dayEnd - dayStart, minDayWidth);
          const g = d3.select(this);

          g.append('rect')
            .attr('x', dayStart)
            .attr('y', 0)
            .attr('width', dayWidth)
            .attr('height', headerHeights.day)
            .style('fill', isDarkMode ? "#121212" : styles.day_header_cell.fill)
            .style('pointer-events', styles.day_header_cell.pointerEvents)
            .style('stroke', isDarkMode ? "#e5e7eb" : styles.headerCell.stroke)
            .style('stroke-width', styles.headerCell.strokeWidth)
          g.append('text')
            .attr('x', dayStart + (dayWidth / 2))
            .attr('y', headerHeights.day / 2)
            .attr('dy', '.1em')
            .text(`W${+d3.timeFormat("%U")(d)}`)
            .style('fill', isDarkMode ? "#FFFFFF" : styles.day_header_text.fill)
            .style('font-size', styles.day_header_text.fontSize)
            .style('font-weight', styles.day_header_text.fontWeight)
            .style('text-anchor', styles.day_header_text.textAnchor)
            .style('dominant-baseline', styles.day_header_text.dominantBaseline)
            .style('pointer-events', styles.day_header_text.pointerEvents)
        });
    }

    // Add bars and milestones with proper vertical positioning
    const milestonePositions = {};
    flatTasks.forEach((task, index) => {
      const rowY = index * rowHeight;

      if (task.type === 'milestone') {
        if (task.BL_milestoneActivityStartDate) {
          const x = timeScale(task.BL_milestoneActivityStartDate);
          const y = rowY + (rowHeight / 2); 
          const milestoneSize = Math.pow(barHeight * 0.5, 2); 

          chartGroup.append('path')
            .attr('class', 'milestoneDiamond base')
            .style('opacity', "0.7")
            .style('cursor', "pointer")
            .style('fill', baselineActivityMarkerColor)
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30}, ${y})`)
            .attr('data-task-id', task.objectId);
        }
        if (task.BL_milestoneActivityFinishDate) {
          const x = timeScale(task.BL_milestoneActivityFinishDate);
          const y = rowY + (rowHeight / 2); 
          const milestoneSize = Math.pow(barHeight * 0.5, 2); 

          chartGroup.append('path')
            .attr('class', 'milestoneDiamond base')
            .style('opacity', "0.7")
            .style('cursor', "pointer")
            .style('fill', baselineActivityMarkerColor)
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30}, ${y})`)
            .attr('data-task-id', task.objectId);
        }
        if (task.UP_milestoneActivityStartDate) {
          const date = task.UP_milestoneActivityStartDate;
          const x = timeScale(date);
          // const x = timeScale(task.UP_milestoneActivityStartDate);
          const y = rowY + (rowHeight / 2); 
          const milestoneSize = Math.pow(barHeight * 0.5, 2);

          // chartGroup.append('path')
          //   .attr('class', 'milestoneDiamond')
          //   .style('fill', updatedActivityMarkerColor)
          //   .style('opacity', "0.7")
          //   .style('cursor', "pointer")
          //   .attr('d', d3.symbol()
          //     .type(d3.symbolDiamond)
          //     .size(milestoneSize))
          //   .attr('transform', `translate(${x - 30}, ${y})`)
          //   .attr('data-task-id', task.objectId);
          if (!milestonePositions[date]) {
            milestonePositions[date] = 1; // Initialize counter for this date
          }

          const offset = milestonePositions[date] * 5; // Adjust the "20" for desired spacing
          milestonePositions[date]++;
          chartGroup.append('path')
            .attr('class', 'milestoneDiamond')
            .style('opacity', "0.7")
            .style('cursor', "pointer")
            .style('fill', updatedActivityMarkerColor)
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30 + offset}, ${y})`) // Apply offset here
            .attr('data-task-id', task.objectId);
        }
        if (task.UP_milestoneActivityFinishDate) {
          const date = task.UP_milestoneActivityFinishDate;
          const x = timeScale(date);
          // const x = timeScale(task.UP_milestoneActivityFinishDate);
          const y = rowY + (rowHeight / 2); 
          const milestoneSize = Math.pow(barHeight * 0.5, 2); 

          if (!milestonePositions[date]) {
            milestonePositions[date] = 1; // Initialize counter for this date
          }

          const offset = milestonePositions[date] * 5; // Adjust the "20" for desired spacing
          milestonePositions[date]++;
          chartGroup.append('path')
            .attr('class', 'milestoneDiamond')
            .style('opacity', "0.7")
            .style('cursor', "pointer")
            .style('fill', updatedActivityMarkerColor)
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30 + offset}, ${y})`) // Apply offset here
            .attr('data-task-id', task.objectId);
          // chartGroup.append('path')
          //   .attr('class', 'milestoneDiamond')
          //   .style('fill', updatedActivityMarkerColor)
          //   .style('opacity', "0.7")
          //   .style('cursor', "pointer")
          //   .attr('d', d3.symbol()
          //     .type(d3.symbolDiamond)
          //     .size(milestoneSize))
          //   .attr('transform', `translate(${x - 30}, ${y})`)
          //   .attr('data-task-id', task.objectId);
          // chartGroup.append('path')
          //   .attr('class', 'milestoneDiamond base')
          //   .style('fill', baselineActivityMarkerColor)
          //   .style('opacity', "0.7")
          //   .attr('d', d3.symbol()
          //     .type(d3.symbolDiamond)
          //     .size(milestoneSize))
          //   .attr('transform', `translate(${x - 25}, ${y})`);
        }
      }
    });

    // Add grid lines with proper offset
    const gridLines = chartGroup.append('g')
      .attr('class', 'grid-lines');

    if (timeInterval === "daily") {
      d3.timeDay.range(...timeScale.domain()).forEach(date => {
        gridLines.append('line')
          .attr('class', isDarkMode ? 'darkmode-grid-line' : 'grid-line')
          .attr('x1', timeScale(date) + 15)
          .attr('x2', timeScale(date) + 15)
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .style('stroke', '#f3f4f6')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '2,2');
      });
    } else if (timeInterval === "weekly") {
      d3.timeWeek.range(...timeScale.domain()).forEach(date => {
        gridLines.append('line')
          .attr('class', isDarkMode ? 'darkmode-grid-line' : 'grid-line')
          .attr('x1', timeScale(date) - 104)
          .attr('x2', timeScale(date) - 104)
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .style('stroke', '#f3f4f6')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '2,2');
      });
    } else if (timeInterval === "monthly") {
      d3.timeMonth.range(...timeScale.domain()).forEach(date => {
        gridLines.append('line')
          .attr('class', isDarkMode ? 'darkmode-grid-line' : 'grid-line')
          .attr('x1', timeScale(date) - 25)
          .attr('x2', timeScale(date) - 25)
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .style('stroke', '#f3f4f6')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '2,2');
      });
    } else {
      d3.timeDay.range(...timeScale.domain()).forEach(date => {
        gridLines.append('line')
          .attr('class', isDarkMode ? 'darkmode-grid-line' : 'grid-line')
          .attr('x1', timeScale(date) + 15)
          .attr('x2', timeScale(date))
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .style('stroke', '#f3f4f6')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '2,2');
      });
    }

    // Add Horizontal Grid Lines
    d3.range(rowHeight, chartHeight, rowHeight).forEach(y => {
      gridLines.append('line')
          .attr('class', isDarkMode ? 'darkmode-grid-line' : 'grid-line')
          .attr('x1', 0)
          .attr('x2', chartWidth)
          .attr('y1', y)
          .attr('y2', y)
          .style('stroke', '#f3f4f6')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '2,2');
  });
  

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'fixed')
      .style('padding', '8px 12px')
      .style('background', 'white')
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '6px')
      .style('box-shadow', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)')
      .style('font-size', '0.875rem')
      .style('line-height', '1.5')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '200px')
      .style('transition', 'opacity 0.2s ease')
      .style('will-change', 'transform')
      .style('opacity', 0);

    let tooltipTimeout;

    // Helper function to find task by element
    const findTaskByElement = (element) => {
      const taskId = element.getAttribute('data-task-id');
      return flatTasks.find(t => t.objectId.toString() === taskId);
    };

    svg.selectAll('.bar, .milestoneDiamond')
      .on('mouseover', (event) => {
        event.target.style.opacity = 1;
        const task = findTaskByElement(event.target);

        if (task) {
          clearTimeout(tooltipTimeout);

          const tooltipContent = `
          <strong style="font-weight: 600; display: block; margin-bottom: 4px;">${task.name}</strong><br/>
          ${task.UP_milestoneActivityStartDate ? `<span class="tooltip-label" style="font-weight: 500; margin-right: 4px;">Start Date:</span>${task.UP_milestoneActivityStartDate.toLocaleDateString('en-GB')}<br/>`: ''}
          ${task.UP_milestoneActivityFinishDate ? `<span class="tooltip-label" style="font-weight: 500; margin-right: 4px;">${task.type === 'milestone' ? 'Finish Date' : 'End'}:</span> ${task.UP_milestoneActivityFinishDate.toLocaleDateString('en-GB')}`: ''}
          ${task.type !== 'milestone' ? `<br/><span class="tooltip-label" style="font-weight: 500; margin-right: 4px;">Duration:</span> ${Math.ceil((task.finishDate - task.startDate) / (1000 * 60 * 60 * 24))} days` : ''}
        `;

          const tooltipWidth = 200;
          const tooltipHeight = 100;

          let left = event.pageX + 10;
          let top = event.pageY - 10;

          if (left + tooltipWidth > window.innerWidth) {
            left = event.pageX - tooltipWidth - 10;
          }

          if (top + tooltipHeight > window.innerHeight) {
            top = event.pageY - tooltipHeight - 10;
          }

          tooltip
            .html(tooltipContent)
            .style('left', `${left}px`)
            .style('top', `${top}px`)
            .transition()
            .duration(200)
            .style('opacity', 1);
        }
      })
      .on('mousemove', (event) => {
        const tooltipWidth = 200;
        const tooltipHeight = 100;

        let left = event.pageX + 10;
        let top = event.pageY - 10;

        if (left + tooltipWidth > window.innerWidth) {
          left = event.pageX - tooltipWidth - 10;
        }

        if (top + tooltipHeight > window.innerHeight) {
          top = event.pageY - tooltipHeight - 10;
        }

        tooltip
          .style('left', `${left}px`)
          .style('top', `${top}px`);
      })
      .on('mouseout', (event) => {
        event.target.style.opacity = 0.7;
        tooltipTimeout = setTimeout(() => {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        }, 100);
      });

    svg.selectAll('.bar, .milestoneDiamond.base')
      .on('mouseover', (event) => {
        const task = findTaskByElement(event.target);
        event.target.style.opacity = 1;

        if (task) {
          clearTimeout(tooltipTimeout);

          const tooltipContent = `
          <strong style="font-weight: 600; display: block; margin-bottom: 4px;">${task.name}</strong><br/>
          ${task.BL_milestoneActivityStartDate ? `<span class="tooltip-label" style="font-weight: 500; margin-right: 4px;">Start Date:</span> ${task.BL_milestoneActivityStartDate.toLocaleDateString('en-GB')}<br/>`: ''}
          ${task.BL_milestoneActivityFinishDate ? `<span class="tooltip-label" style="font-weight: 500; margin-right: 4px;">${task.type === 'milestone' ? 'Finish Date' : 'End'}:</span>${task.BL_milestoneActivityFinishDate.toLocaleDateString('en-GB')}`: ''}
          ${task.type !== 'milestone' ? `<br/><span class="tooltip-label" style="font-weight: 500; margin-right: 4px;">Duration:</span> ${Math.ceil((task.finishDate - task.startDate) / (1000 * 60 * 60 * 24))} days` : ''}
        `;
          const tooltipWidth = 200;
          const tooltipHeight = 100;

          let left = event.pageX + 10;
          let top = event.pageY - 10;

          if (left + tooltipWidth > window.innerWidth) {
            left = event.pageX - tooltipWidth - 10;
          }

          if (top + tooltipHeight > window.innerHeight) {
            top = event.pageY - tooltipHeight - 10;
          }

          tooltip
            .html(tooltipContent)
            .style('left', `${left}px`)
            .style('top', `${top}px`)
            .transition()
            .duration(200)
            .style('opacity', 1);
        }
      })
      .on('mousemove', (event) => {
        const tooltipWidth = 200;
        const tooltipHeight = 100;

        let left = event.pageX + 10;
        let top = event.pageY - 10;

        if (left + tooltipWidth > window.innerWidth) {
          left = event.pageX - tooltipWidth - 10;
        }

        if (top + tooltipHeight > window.innerHeight) {
          top = event.pageY - tooltipHeight - 10;
        }

        tooltip
          .style('left', `${left}px`)
          .style('top', `${top}px`);
      })
      .on('mouseout', (event) => {
        event.target.style.opacity = 0.7;
        tooltipTimeout = setTimeout(() => {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        }, 100);
      });

    return () => {
      tooltip.remove();
    };
  }, [expandedTasks, flattenTasks, isDarkMode, timeInterval, ganttDateRange, tasks, baselineActivityMarkerColor, updatedActivityMarkerColor]);

  const startDragging = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const taskTableStartWidth = taskTableRef.current.offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, taskTableStartWidth + deltaX); 
      const containerWidth = taskTableRef.current.parentElement.offsetWidth;
      const maxWidth = containerWidth * 0.8; 
      taskTableRef.current.style.width = `${Math.min(newWidth, maxWidth)}px`;
    };

    const stopDragging = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);
  };

  const handleScroll = (source, target) => {
    const sourceScrollTop = source.scrollTop;
    target.scrollTop = sourceScrollTop;
  };

  const handleHorizontalScroll = (source, target) => {
    const sourceScrollLeft = source.scrollLeft;
    target.scrollLeft = sourceScrollLeft;
  };

  // const toggleExpandCollapse = (taskId) => {
  //   setExpandedSubTasks((prev) => ({
  //     ...prev,
  //     [taskId]: !prev[taskId],
  //   }));
  // };

  const formatDateTime = (date) => {
    if (!date) return "";
  
    const timeString = date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
  
    const formattedTime = timeString.replace(/am|pm/i, (match) => match.toUpperCase());
  
    return date.toLocaleDateString('en-GB') + ' ' + formattedTime;
  };

  const findNewParentWBS = (data, milestoneObjectId) => {
    for (const task of data) {
        if (task.children.length > 0) {
            const foundChild = task.children.find(child => child.objectId === milestoneObjectId && child.type === 'milestone');
            if (foundChild) {
                return task;
            }

            const foundInNested = findNewParentWBS(task.children, milestoneObjectId);
            if (foundInNested) {
                return foundInNested;
            }
        }
    }
    return null; 
  };

  const findParentWBSFromParentObjectId = (data, parentObjectId) => {
    for (const task of data) {
        if (task.objectId === parentObjectId) {
            return task; 
        }

        if (task.children.length > 0) {
            const foundInNested = findParentWBSFromParentObjectId(task.children, parentObjectId);
            if (foundInNested) {
                return foundInNested;
            }
        }
    }
    return null; 
  };

  const renderTaskRows = (task) => {
    // const isExpanded = expandedSubTasks[task.objectId];
    const parentWBS = findNewParentWBS(tasks, task.objectId);
    const parentOfParentWBS = parentWBS ? findParentWBSFromParentObjectId(tasks, parentWBS.parentObjectId) : null;
    return (
      <>
      {(parentWBS || parentOfParentWBS) &&
        <tr style={{borderBottom: "1px solid #e5e7eb"}}>
          <td style={styles.taskDataTable_td}> {task.type === "milestone" && (parentOfParentWBS ? parentOfParentWBS.name : parentWBS ? parentWBS.name : "")} </td>         
          <td style={styles.taskDataTable_td}> {parentOfParentWBS  ? parentWBS.name : "-"} </td>
          <td style={styles.taskDataTable_td}> {task.name} </td>
          <td style={styles.taskDataTable_td}> {task.BL_milestoneActivityFinishDate ? "Finish Milestone" : "Start Milestone"}</td>
          <td style={styles.taskDataTable_td}> {formatDateTime(task.BL_milestoneActivityStartDate)} </td>
          <td style={styles.taskDataTable_td}> {formatDateTime(task.BL_milestoneActivityFinishDate)} </td> 
          <td style={styles.taskDataTable_td}> {formatDateTime(task.UP_milestoneActivityStartDate)} </td>
          <td style={styles.taskDataTable_td}> {formatDateTime(task.UP_milestoneActivityFinishDate)} </td>
        </tr>
      }
          {
          task.children.map((child, index) => (
            <React.Fragment key={index}>
              {renderTaskRows(child, index === task?.children?.length - 1)}
            </React.Fragment>
          ))}
      </>
    );
  };
  return (
    <div style={styles.ganttChart}>
        <div style={styles.ganttChartFilter}>
        <div style={styles.ganttCharts}>
          <div style={styles.legendButton}>
            <span style={{ ...styles.legendIconBase, backgroundColor: baselineActivityMarkerColor }}></span>
            Baseline Dates
          </div>
          <div style={styles.legendButton}>
            <span style={{ ...styles.legendIconBase, backgroundColor: updatedActivityMarkerColor }}></span>
            Updated Dates
          </div>
        </div>
        <div style={styles.dropdownContainer}>
          <select
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
            style={styles.dropdown}
          >
            <option style={styles.dropdownOption} value="daily">Daily</option>
            <option style={styles.dropdownOption} value="weekly">Weekly</option>
            <option style={styles.dropdownOption} value="monthly">Monthly</option>
          </select>
        </div>
        </div>
      <div style={styles.ganttChartContainer}>
        <div style={styles.taskTableContainer} className='task-table-container' ref={taskTableRef} onScroll={() =>
          handleScroll(taskTableRef.current, chartContainerRef.current)
        }>
          <TaskTable
            tasks={tasks}
            expandedTasks={expandedTasks}
            onToggleExpand={handleToggleExpand}
            showTaskTable={showTaskTable}
            // isTaskClicked={isTaskClicked}
            isDarkMode={isDarkMode}
            timeInterval={timeInterval}
          />
        </div>
        <div style={styles.splitBar} ref={splitBarRef} onMouseDown={startDragging} ></div>
        <div style={styles.chartContainer} className="chart-container">
          <div className='hidden-scrollbar'
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "none", 
              msOverflowStyle: "none"
            }}
            ref={headerContainerRef} onScroll={() =>
              handleHorizontalScroll(headerContainerRef.current, chartContainerRef.current)
            }>
            <svg style={styles.chart_container_svg} ref={headerSvgRef}></svg>
          </div>
          <div style={styles.chartContainer_1} className="chart-container-1" ref={chartContainerRef} onScroll={(event) => { handleScroll(chartContainerRef.current, taskTableRef.current); handleHorizontalScroll(chartContainerRef.current, headerContainerRef.current); }
          }>
            <svg style={styles.chartContainer_1_svg} ref={svgRef}></svg>
          </div>
        </div>
      </div>
      {task && <h3>MILESTONE</h3>}
      {task && (
        <table style={styles.taskTable} className="task-table">
          <thead style={{ ...styles.taskTable_head, height: "50px", background: "#07545e", color: "#FFFFFF" }}>
            <tr>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>WBS</th>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>Child WBS</th>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>Task</th>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>Milestone Type</th>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>Baseline Start Date</th>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>Baseline Finish Date</th>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>Start Date</th>
              <th style={{ ...styles.taskTable_th, ...styles.taskDataTable_th }}>Finish Date</th>
            </tr>
          </thead>
          <tbody>
            {renderTaskRows(task)}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GanttChart;
