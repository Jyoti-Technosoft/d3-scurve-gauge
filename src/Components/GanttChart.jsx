import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const styles = {
    ganttChart: {
      margin: "auto",
      width: "90%",
      paddingBottom: "5rem"
    },
    chartTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      marginTop: "5rem",
    },
    legendFilter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    legends: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
    },
    legend: {
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
    },
    legendIcon: {
      width: "16px",
      height: "16px",
      marginRight: "5px",
      display: "inline-block",
      borderRadius: "4px",
    },
    legendIconPlanned: {
      backgroundColor: "steelblue",
      opacity: "0.7",
    },
    legendIconActual: {
      backgroundColor: "red",
      opacity: "0.7",
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
      margin: "20px",
      height: "450px",
      maxHeight: "450px",
      border: "1px solid var(--gray-200)",
      borderRadius: "8px",
      boxShadow: "var(--shadow-md)"
    },
    taskTableContainer:{
      overflowY: "auto",
      height: "100%",
      maxWidth: "80%",
      borderRight: "1px solid var(--gray-200)",
      minWidth:"200px"
    },
    splitBar: {
      width: "5px", /* Thickness of the split bar */
      /* background: #ccc; Visual appearance */
      cursor: "ew-resize", /* Resizing cursor */
      position: "relative",
      zIndex: 1,
    },
    taskTable: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.875rem"
    },
    taskTable_head:{
      position: "sticky",
      top: 0,
      background: "var(--gray-50)",
      zIndex: 10,
      height: "55px"
    },
    taskTable_darkmode_thead:{
      background: "#121212"
    },
    taskTable_th:{
      padding: "12px",
      textAlign: "left",
      fontWeight: 600,
      borderBottom: "1px solid var(--gray-200)",
      whiteSpace: "nowrap",
      verticalAlign: "bottom",
      height: "55px"
    },
    taskTable_td:{
      textAlign: "left",
      padding: "8px 12px",
      borderBottom: "1px solid var(--gray-100)",
      whiteSpace: "nowrap",
      height: "40px"
    },
    taskTable_tr:{
      "&:hover":{
        backgroundColor: "var(--gray-50)"
      }
    },
    taskRow:{
      transition: "background-color 0.2s"
    },
    expandButton:{
      background: "#FFFFFF",
      // padding:"8px 8px",
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
    expanded:{
      transform: "rotate(0deg)",
    },
    darkmode_expand_button:{
      background: "#121212",
      color: "#FFFFFF",
      border: "1px solid #FFFFFF"
    },
    chartContainer:{
      height: "100%",
      flex: 1,
      overflowX: "hidden",
      position: "relative",
    },
    chart_container_svg: {
      display: "block",
      minWidth:"100%"
    },
    chartContainer_1 :{
      height: "calc(100% - 80px)",
      flex: 1,
      position: "relative"
    },
    chartContainer_1_svg:{
      display: "block",
      minWidth: "100%"
    },
    header_group:{
      position: "sticky",
      top: 0,
      zIndex: 2,
      fontFamily: "inherit",
      boxShadow: "var(--shadow-sm)",
    },
    month_background: {
      fill: "var(--gray-50)",
      stroke: "var(--gray-200)",
      strokeWidth: 1
    },
    darkmode_month_background: {
      fill: "#121212",
      stroke: "#FFFFFF",
      strokeWidth: 1
    },
    month_label:{
      fill: "var(--gray-700)",
      fontSize: "0.875rem",
      fontWeight: 600,
      pointerEvents: "none",
      userSelect: "none",
      textAnchor: "middle",
      dominantBaseline: "central"
    },
    darkmode_month_text:{
      fill: "#FFFFFF"
    },
    month_separator:{
      stroke: "var(--gray-200)",
      strokeWidth: 1
    },
    year_header: {
      height: "30px",
      fill: "white",
      stroke: "var(--gray-200)",
      strokeWidth: 1,
      pointerEvents: "none"
    },
    year_header_text:{
      fontSize: "14px",
      fontWeight: 600,
      fill: "var(--gray-900)",
      pointerEvents: "none"
    },
    month_header:{
      height: "25px",
      fill: "var(--gray-50)",
      pointerEvents: "none"
    },
    day_header:{
      height: "25px",
    },
    day_header_text:{
      fontSize: "12px",
      fontWeight: 500,
      fill: "var(--gray-700)",
      textAnchor: "middle",
      dominantBaseline: "central",
      pointerEvents: "none"
    },
    darkmode_day_header_text:{
      fill: "#FFFFFF",
    },
    headerCell:{
      fill:"var(--gray-50)",
      stroke: "var(--gray-200)",
      strokeWidth: 1
    },
    day_header_cell:{
      fill: "white",
      pointerEvents: "none"
    },
    darkmode_day_header_cell :{
      fill:"#121212",
      stroke: "var(--gray-200)"
    },
    bar:{
      rx: "4px",
      ry: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    darkmode_bar:{
      fill: "#FFFFFF"
    },
    grid_line:{
      stroke:"var(--gray-100)",
      strokeWidth: 1,
      strokeDasharray: "2,2"
    },
    darkmode_grid_line:{
      stroke:"#000000"
    },
    milestoneDiamond: {
      fill: "var(--danger-color)",
      opacity: 1,
      cursor: "pointer"
    },
    base:{
      fill: "#4E91FD"
    }
  };

const TaskTable = ({ tasks, expandedTasks, onToggleExpand, showTaskTable, isTaskClicked,isDarkMode }) => {
  const renderTask = (task, level = 0) => {
    const isExpanded = expandedTasks.includes(task.objectId);
    const hasChildren = task.children && task.children.length > 0;
    // const duration = Math.ceil((task.finishDate - task.startDate) / (1000 * 60 * 60 * 24));
    // const progress = task.progress || 0;
    // const status = task.status || 'Not Started';
    // const owner = task.owner || '-';
    // const priority = task.priority || 'Medium';

    return (
      <React.Fragment key={task.objectId}>
        <tr style={{...styles.taskRow}} className={`task-row ${task.type}`}>
          <td style={{...styles.taskTable_td,fontWeight:`${task.type == "WBS" ?"600":"normal"} `, paddingLeft: `${(level * 20) + 10}px`, cursor: 'pointer' }} onClick={()=> showTaskTable(task)}>
            {hasChildren && (
              <button 
              style={{padding:`${isExpanded?"4px 8px 6px":"8px 8px"}`,...styles.expandButton,...styles.expanded,...(isDarkMode ? styles.darkmode_expand_button : {})}}
                // className={`expand-button ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'darkmode-expand-button' : ''}`}
                // style={{ width: '18px', height: '16px', verticalAlign: 'middle' }}
                onClick={() => onToggleExpand(task.objectId)}
              >
                {isExpanded ? '-' : '+'}
              </button>
            )}
            {task.name}
          </td>
          {/* <td>{task.type}</td>
          <td>{task.startDate.toLocaleDateString()}</td>
          <td>{task.finishDate.toLocaleDateString()}</td>
          <td>{duration} days</td>
          <td>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
              <span>{progress}%</span>
            </div>
          </td>
          <td>{status}</td>
          <td>{owner}</td>
          <td>{priority}</td> */}
        </tr>
        {isExpanded && task.children && task.children.map(child => (
          renderTask(child, level + 1)
        ))}
      </React.Fragment>
    );
  };

  return (
    // <div className="" style={{ width: "100%" }}>
      <table style={styles.taskTable} className="task-table">
        <thead style={{...styles.taskTable_head,...(isDarkMode ? styles.taskTable_darkmode_thead : {})}}>
          <tr>
            <th style={styles.taskTable_th}>Task Name</th>
            {/* <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Priority</th> */}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => renderTask(task))}
        </tbody>
      </table>
    // </div>
  );
};

const GanttChart = ({ tasks, blMilestoneActivity, upMilestoneActivity, wbsData,isDarkMode }) => {
    const [timeInterval, setTimeInterval] = useState("daily");
  const svgRef = useRef();
  const headerSvgRef = useRef();
  const taskTableRef = useRef();
  const headerContainerRef = useRef();
  const chartContainerRef = useRef();
  const splitBarRef = useRef();
  const [expandedTasks, setExpandedTasks] = useState([1, 5]); // Initially expand top-level tasks
  const [isTaskClicked, setIsTaskClicked] = useState(false);
  const [task, setTask] = useState();
  const [expandedSubTasks, setExpandedSubTasks] = useState({}); // State to track which tasks are expanded
  const [maxWidth, setMaxWidth] = useState("80%");

  var addToDate = function addToDate(date, quantity, scale) {
    var newDate = new Date(date.getFullYear() + (scale === "year" ? quantity : 0), date.getMonth() + (scale === "month" ? quantity : 0), date.getDate() + (scale === "day" ? quantity : 0), date.getHours() + (scale === "hour" ? quantity : 0), date.getMinutes() + (scale === "minute" ? quantity : 0), date.getSeconds() + (scale === "second" ? quantity : 0), date.getMilliseconds() + (scale === "millisecond" ? quantity : 0));
    return newDate;
  };
  var startOfDate = function startOfDate(date, scale) {
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
  
  
  const ganttDateRange = (
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
      // case ViewMode.QuarterDay:
      //   newStartDate = startOfDate(newStartDate, "day");
      //   newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      //   newEndDate = startOfDate(newEndDate, "day");
      //   newEndDate = addToDate(newEndDate, 66, "hour"); // 24(1 day)*3 - 6
      //   break;
      // case ViewMode.HalfDay:
      //   newStartDate = startOfDate(newStartDate, "day");
      //   newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      //   newEndDate = startOfDate(newEndDate, "day");
      //   newEndDate = addToDate(newEndDate, 108, "hour"); // 24(1 day)*5 - 12
      //   break;
      // case ViewMode.Hour:
      //   newStartDate = startOfDate(newStartDate, "hour");
      //   newStartDate = addToDate(newStartDate, -1 * preStepsCount, "hour");
      //   newEndDate = startOfDate(newEndDate, "day");
      //   newEndDate = addToDate(newEndDate, 1, "day");
      //   break;
    }
    return [newStartDate, newEndDate];
  };  
  
  const showTaskTable = (task) => {
    setTask(task);
    setIsTaskClicked(true);
  }
  // const preparedTasks = () => {
  //   // console.log("DATA BASE ===> ", blMilestoneActivity);
  //   // console.log("DATA UPDA ===> ", upMilestoneActivity);
  //   // console.log("WBS1 DATA ===> ", wbsData);
  //   const map = new Map(); // Map to store objects by their `objectId`
  //   const result = []; // Final hierarchical list

  //   // Step 1: Add all objects to the map and initialize `childrens` array
  //   wbsData.forEach(item => {
  //       map.set(item.objectId, { ...item, children: [] });
  //   });

  //   // Step 2: Build the hierarchy
  //   wbsData.forEach(item => {
  //       if (item.parentObjectId === null) {
  //           // Top-level WBS (no parent)
  //           result.push({ ...map.get(item.objectId), type: "WBS" });
  //       } else {
  //           // Child WBS: find its parent and add it to the `children` array
  //           const parent = map.get(item.parentObjectId);
  //           if (parent) {
  //               parent.children.push(map.get(item.objectId));
  //           }
  //       }
  //   });
  //   console.log("DATA ==> ", result)
  //   return result;
  // }
  // preparedTasks();

  const flattenTasks = (tasks, result = []) => {
    tasks.forEach(task => {
      result.push(task);
      if (task.children && expandedTasks.includes(task.objectId)) {
        flattenTasks(task.children, result);
      }
    });
    return result;
  };

  const styleToString = (styleObject) =>
    Object.entries(styleObject)
      .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value};`)
      .join(" ");

      
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

    // Set up dimensions
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
    const minDayWidth = 40; // Increased minimum width per day
    let startDate = d3.min(flatTasks, d => d.startDate);
    let endDate = d3.max(flatTasks, d => d.finishDate);
    [startDate, endDate] = ganttDateRange(flatTasks, timeInterval, 1);

    console.log("DATA ===> for dates", startDate, endDate)
    const totalDays = d3.timeDay.count(startDate, endDate);
    const minChartWidth = totalDays * minDayWidth;
     
    // Calculate container width
    const containerWidth = document.querySelector('.chart-container-1').clientWidth;
    const chartWidth = Math.max(minChartWidth, containerWidth);
    const rowHeight = 56; // 40px height + 16px padding (8px top + 8px bottom)
    const barHeight = 32; // Adjusted bar height
    const verticalPadding = (rowHeight - barHeight) / 2; // Center in row
    const chartHeight = flatTasks.length * rowHeight;

    // Create SVG with the calculated dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', chartWidth)
      .attr('height', chartHeight + margin.top + margin.bottom);
    const headerSvg = d3.select(headerSvgRef.current)
      .attr('width', chartWidth)
      .attr('height', totalHeaderHeight);

    // debugger
    // Update time scale with new width
    const timeScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, chartWidth - margin.left - margin.right]);

    // Create chart container with horizontal scroll if needed
    const chartContainer = d3.select('.chart-container-1')
      .style('overflow-x', chartWidth > containerWidth ? 'auto' : 'hidden');

    // Create header group
    const headerGroup = headerSvg.append('g')
      .attr('class', 'header-group')
      // .attr('transform', `translate(${margin.left},0)`);
      .attr('style', styleToString(styles.header_group))
      .attr('transform', `translate(-25,0)`);

    // Create chart group with proper offset
    const chartGroup = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales with proper domain and range
    // const taskScale = d3.scaleLinear()
    //   .domain([0, flatTasks.length - 1])  // Adjust domain to account for zero-based index
    //   .range([0, chartHeight - rowHeight]); // Adjust range to account for row height
    // const startOfFirstMonth = d3.timeMonth.floor(startDate);
    // const startOfFirstYear = d3.timeYear.floor(startDate);

    if (timeInterval === "monthly") {
      headerHeights.year = headerHeights.year + 12.5;
      headerHeights.month = headerHeights.month + 12.5;
    }
    // Add year headers
    const years = d3.timeYear.range(startDate, endDate);
    headerGroup.append('g')
      .attr('class', 'year-header')
      .attr('style',styleToString(styles.year_header))
      .selectAll('.year-cell')
      .data(years)
      .enter()
      .append('g')
      .attr('class', 'year-cell')
      .each(function(d) {
        const year = d3.select(this);
        const yearStart = timeScale(d);
        const yearEnd = timeScale(d3.timeYear.offset(d, 1));
        const yearWidth = yearEnd - yearStart;
        
        // Add year background
        year.append('rect')
          .attr('x', yearStart)
          .attr('y', 0)
          .attr('width', yearWidth)
          .attr('height', headerHeights.year)
          // .attr('class', isDarkMode?'darkmode-year-background':'year-background');
        // Add year text centered in the visible area
        year.append('text')
          .attr('x', function() {
            return d.getFullYear() === years[0].getFullYear() ? yearStart + yearWidth - 30 : yearStart + 30;
          })
          .attr('y', (headerHeights.year / 2) - 5)
          .attr('dy', '0.35em')
          // .attr('text-anchor', 'middle')
          .attr('class', 'year-label')
          .text(d => (d3.timeFormat('%Y')(d)) + (d.getFullYear() === years[0].getFullYear() ? " ← " : " → "));

        // Add vertical separator line
        year.append('line')
          .attr('class', 'year-separator')
          .attr('x1', yearStart)
          .attr('x2', yearStart)
          .attr('y1', 0)
          .attr('y2', headerHeights.year);
      });

    // Add month headers with similar dynamic centering
    const months = d3.timeMonth.range(startDate, endDate);
    headerGroup.append('g')
      .attr('class', 'month-header')
      .attr('style',styleToString(styles.month_header))
      .attr('transform', `translate(0,${headerHeights.year})`)
      .selectAll('.month-cell')
      .data(months)
      .enter()
      .append('g')
      .attr('class', 'month-cell')
      .each(function(d) {
        const month = d3.select(this);
        const monthStart = timeScale(d);
        const monthEnd = timeScale(d3.timeMonth.offset(d, 1));
        const monthWidth = monthEnd - monthStart;
        // Add month background
        month.append('rect')
          .attr('x', monthStart)
          .attr('y', 0)
          .attr('width', monthWidth)
          .attr('height', headerHeights.month)
          // .attr('class', isDarkMode?'darkmode-month-background':'month-background')
          .attr('style', styleToString(isDarkMode ? (styles.darkmode_month_background) : styles.month_background))
        // Add month text centered
        month.append('text')
          .attr('x', function() {
            return d.getMonth() === 0 ? (monthStart + monthWidth - 15) : (monthStart + monthWidth / 2);
          })
          .attr('y', (headerHeights.month / 2) - 5)
          .attr('dy', '0.35em')
          // .attr('text-anchor', 'middle')
          .attr('class', 'month-label')
          .text(d3.timeFormat('%b')(d));

        // Add separator line
        month.append('line')
          // .attr('class', 'month-separator')
          .attr('style',  styleToString(styles.month_separator))
          .attr('x1', monthStart)
          .attr('x2', monthStart)
          .attr('y1', 0)
          .attr('y2', headerHeights.month);
      });

    if (timeInterval === "daily") {
          // Add day headers with increased minimum width
    const days = d3.timeDay.range(...timeScale.domain());
    headerGroup.append('g')
      .attr('class','day-header')
      .attr('style',styleToString(styles.day_header))
      .attr('transform', `translate(0,${headerHeights.year + headerHeights.month})`)
      .selectAll('.day-cell')
      .data(days)
      .enter()
      .append('g')
      .attr('class', 'day-cell')
      .each(function(d) {
        const dayStart = timeScale(d);
        const dayEnd = timeScale(d3.timeDay.offset(d, 1));
        const dayWidth = Math.max(dayEnd - dayStart, minDayWidth);
        const g = d3.select(this);
        
        g.append('rect')
          .attr('x', dayStart)
          .attr('y', 0)
          .attr('width', dayWidth)
          .attr('height', headerHeights.day)
          // .attr('class', isDarkMode?'darkmode-header-cell':'header-cell')
          .attr('style', styleToString(Object.assign({}, styles.headerCell,styles.day_header_cell, isDarkMode ? styles.darkmode_day_header_cell : {})));
        g.append('text')
          .attr('x', dayStart + (dayWidth / 2))
          .attr('y', headerHeights.day / 2)
          .attr('dy', '.1em')
          .text(d3.timeFormat('%d')(d))
          // .attr('class', isDarkMode?'darkmode-day-text':'');
          .attr('style', styleToString(Object.assign({}, styles.day_header_text, isDarkMode ? styles.darkmode_day_header_text : {})));
        });
    } else if (timeInterval === "weekly") {
          // Add day headers with increased minimum width
    const days = d3.timeWeek.range(...timeScale.domain());
    headerGroup.append('g')
      .attr('class','day-header')
      .attr('style',styleToString(styles.day_header))
      .attr('transform', `translate(0,${headerHeights.year + headerHeights.month})`)
      .selectAll('.day-cell')
      .data(days)
      .enter()
      .append('g')
      .attr('class', 'day-cell')
      .each(function(d) {
        const dayStart = timeScale(d);
        const dayEnd = timeScale(d3.timeWeek.offset(d, 1));
        const dayWidth = Math.max(dayEnd - dayStart, minDayWidth);
        const g = d3.select(this);
        
        g.append('rect')
          .attr('x', dayStart)
          .attr('y', 0)
          .attr('width', dayWidth)
          .attr('height', headerHeights.day)
          // .attr('class', isDarkMode?'darkmode-header-cell':'header-cell')
          .attr('style', styleToString(Object.assign({}, styles.headerCell,styles.day_header_cell, isDarkMode ? styles.darkmode_day_header_cell : {})));
        g.append('text')
          .attr('x', dayStart + (dayWidth / 2))
          .attr('y', headerHeights.day / 2)
          .attr('dy', '.1em')
          .text(`W${+d3.timeFormat("%U")(d) + 1}`)
          // .attr('class', isDarkMode?'darkmode-day-text':'');
          .attr('style', styleToString(Object.assign({}, styles.day_header_text, isDarkMode ? styles.darkmode_day_header_text : {})));
        });
    }

    // Add bars and milestones with proper vertical positioning
    flatTasks.forEach((task, index) => {
      const rowY = index * rowHeight; // Exact row position
      
      if (task.type === 'milestone') {
        if (task.BL_milestoneActivityStartDate) {
          const x = timeScale(task.BL_milestoneActivityStartDate);
          const y = rowY + (rowHeight / 2); // Center of row
          const milestoneSize = Math.pow(barHeight * 0.7, 2); // Reduced size, squared for area
          
          chartGroup.append('path')
            .attr('class', 'milestoneDiamond base')
            .attr('style', styleToString(Object.assign({}, styles.milestoneDiamond,styles.base)))
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30}, ${y})`)
            .attr('data-task-id', task.objectId);
        } 
        if (task.BL_milestoneActivityFinishDate) {
          const x = timeScale(task.BL_milestoneActivityFinishDate);
          const y = rowY + (rowHeight / 2); // Center of row
          const milestoneSize = Math.pow(barHeight * 0.7, 2); // Reduced size, squared for area
          
          chartGroup.append('path')
            .attr('class', 'milestoneDiamond base')
            .attr('style', styleToString(Object.assign({}, styles.milestoneDiamond,styles.base)))
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30}, ${y})`)
            .attr('data-task-id', task.objectId);
        }
        if (task.UP_milestoneActivityStartDate) {
          const x = timeScale(task.UP_milestoneActivityStartDate);
          const y = rowY + (rowHeight / 2); // Center of row
          const milestoneSize = Math.pow(barHeight * 0.7, 2); // Reduced size, squared for area
          
          chartGroup.append('path')
            .attr('class', 'milestoneDiamond')
            .attr('style', styleToString(Object.assign({}, styles.milestoneDiamond)))
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30}, ${y})`)
            .attr('data-task-id', task.objectId);
        }
        if (task.UP_milestoneActivityFinishDate) {
          const x = timeScale(task.UP_milestoneActivityFinishDate);
          const y = rowY + (rowHeight / 2); // Center of row
          const milestoneSize = Math.pow(barHeight * 0.7, 2); // Reduced size, squared for area
          
          chartGroup.append('path')
            .attr('class', 'milestoneDiamond')
            .attr('style', styleToString(Object.assign({}, styles.milestoneDiamond)))
            .attr('d', d3.symbol()
              .type(d3.symbolDiamond)
              .size(milestoneSize))
            .attr('transform', `translate(${x - 30}, ${y})`)
            .attr('data-task-id', task.objectId);
        }
        // const x = timeScale(task.startDate);
        // const y = rowY + (rowHeight / 2); // Center of row
        // const milestoneSize = Math.pow(barHeight * 0.7, 2); // Reduced size, squared for area
        
        // chartGroup.append('path')
        //   .attr('class', 'milestoneDiamond')
        //   .attr('d', d3.symbol()
        //     .type(d3.symbolDiamond)
        //     .size(milestoneSize))
        //   .attr('transform', `translate(${x - 30}, ${y})`)
        //   .attr('data-task-id', task.objectId);
      } else {
        // chartGroup.append('rect')
        //   .attr('class', `${isDarkMode?'darkmode-bar':'bar'} ${task.type}`)
        // .attr('style', styleToString(Object.assign({}, styles.bar, isDarkMode ? styles.darkmode_bar : {})));
        //   .attr('y', rowY + verticalPadding)
        //   .attr('x', timeScale(task.startDate))
        //   .attr('height', barHeight)
        //   .attr('width', Math.max(timeScale(task.finishDate) - timeScale(task.startDate), 1))
        //   .attr('rx', 3)
        //   .attr('ry', 3)
        //   .attr('data-task-id', task.objectId);
      }
    });

    // Add grid lines with proper offset
    const gridLines = chartGroup.append('g')
      .attr('class', 'grid-lines');

    d3.timeDay.range(...timeScale.domain()).forEach(date => {
      gridLines.append('line')
        .attr('class', isDarkMode?'darkmode-grid-line':'grid-line')
        // .attr('style', styleToString(Object.assign({}, styles.grid_line, isDarkMode ? styles.darkmode_grid_line : {})))  
        .attr('x1', timeScale(date) + 15)
        .attr('x2', timeScale(date))
        .attr('y1', 0)
        .attr('y2', chartHeight);
    });

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    let tooltipTimeout;

    // Helper function to find task by element
    const findTaskByElement = (element) => {
      const taskId = element.getAttribute('data-task-id');
      return flatTasks.find(t => t.objectId.toString() === taskId);
    };

    svg.selectAll('.bar, .milestoneDiamond')
    // .attr('style', styleToString(Object.assign({}, styles.milestoneDiamond)))
    .on('mouseover', (event) => {
      const task = findTaskByElement(event.target);
      
      if (task) {
        clearTimeout(tooltipTimeout);
        
        const tooltipContent = `
          <strong>${task.name}</strong><br/>
          <span class="tooltip-label">Start:</span> ${task.UP_milestoneActivityStartDate ? task.UP_milestoneActivityStartDate.toLocaleDateString() : '-'}<br/>
          <span class="tooltip-label">${task.type === 'milestone' ? 'Due' : 'End'}:</span> ${task.UP_milestoneActivityFinishDate ? task.UP_milestoneActivityFinishDate.toLocaleDateString() : '-'}
          ${task.type !== 'milestone' ? `<br/><span class="tooltip-label">Duration:</span> ${Math.ceil((task.finishDate - task.startDate) / (1000 * 60 * 60 * 24))} days` : ''}
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
    .on('mouseout', () => {
      tooltipTimeout = setTimeout(() => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      }, 100);
    });

    svg.selectAll('.bar, .milestoneDiamond.base')
    .on('mouseover', (event) => {
      const task = findTaskByElement(event.target);
      
      if (task) {
        clearTimeout(tooltipTimeout);
        
        const tooltipContent = `
          <strong>${task.name}</strong><br/>
          <span class="tooltip-label">Start:</span> ${task.BL_milestoneActivityStartDate ? task.BL_milestoneActivityStartDate.toLocaleDateString() : '-'}<br/>
          <span class="tooltip-label">${task.type === 'milestone' ? 'Due' : 'End'}:</span> ${task.BL_milestoneActivityFinishDate ? task.BL_milestoneActivityFinishDate.toLocaleDateString() : '-'}
          ${task.type !== 'milestone' ? `<br/><span class="tooltip-label">Duration:</span> ${Math.ceil((task.finishDate - task.startDate) / (1000 * 60 * 60 * 24))} days` : ''}
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
    .on('mouseout', () => {
      tooltipTimeout = setTimeout(() => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      }, 100);
    });

    // Clean up tooltip when component unmounts
    return () => {
      tooltip.remove();
    };
  }, [tasks, expandedTasks, flattenTasks]);

  const startDragging = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const taskTableStartWidth = taskTableRef.current.offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, taskTableStartWidth + deltaX); // Enforce minimum width
      const containerWidth = taskTableRef.current.parentElement.offsetWidth;
      const maxWidth = containerWidth * 0.8; // Enforce maximum width as 80% of container
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
    // const sourceScrollLeft = source.scrollLeft;
    target.scrollTop = sourceScrollTop;
    // target.scrollLeft = sourceScrollLeft;
  };

  const handleHorizontalScroll = (source, target) => {
    const sourceScrollLeft = source.scrollLeft;
    target.scrollLeft = sourceScrollLeft;
  };

  const toggleExpandCollapse = (taskId) => {
    setExpandedSubTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const getFormattedDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const renderTaskRows = (task) => {
    const isExpanded = expandedSubTasks[task.objectId];
    return (
      <>
        <tr>
          <td style={styles.taskTable_td}>
            {task.children.length > 0 && (
              <span
                onClick={() => toggleExpandCollapse(task.objectId)}
                style={{ cursor: "pointer", padding: "0 5px" }}
              >
                {isExpanded ? "−" : "+"}
              </span>
            )}
          </td>
          <td style={styles.taskTable_td}>{task.code}</td>
          <td style={styles.taskTable_td}>{task.name}</td>
          <td style={styles.taskTable_td}>{task.projectType}</td>
          <td style={styles.taskTable_td}>{getFormattedDate(task.startDate)}</td>
          <td style={styles.taskTable_td}>{getFormattedDate(task.finishDate)}</td>
        </tr>
        {isExpanded && task.children.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Task Code</th>
                    <th>Task Name</th>
                    <th>Project Type</th>
                    <th>Start Date</th>
                    <th>Finish Date</th>
                  </tr>
                </thead>
                <tbody>
                  {task.children.map((child, index) => (
                    <React.Fragment key={index}>
                      {renderTaskRows(child)}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
        )}
      </>
    );
  };

  return (
    <div style={styles.ganttChart}>
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
        <div style={styles.ganttChartContainer}>
            <div style={styles.taskTableContainer} className='task-table-container' ref={taskTableRef} onScroll={() =>
          handleScroll(taskTableRef.current, chartContainerRef.current)
        }>
                <TaskTable
                    tasks={tasks} 
                    expandedTasks={expandedTasks}
                    onToggleExpand={handleToggleExpand}
                    showTaskTable={showTaskTable}
                    isTaskClicked={isTaskClicked}
                    isDarkMode={isDarkMode}
                />
            </div>
            <div style={styles.splitBar} ref={splitBarRef} onMouseDown={startDragging} ></div>
            <div style={styles.chartContainer} className="chart-container">
              <div className='hidden-scrollbar' style={{ overflowX: "auto", overflowY: "hidden" }} ref={headerContainerRef} onScroll={() =>
                  handleHorizontalScroll(headerContainerRef.current, chartContainerRef.current)
                }>
                <svg style={styles.chart_container_svg} ref={headerSvgRef}></svg>
              </div>
              <div style={styles.chartContainer_1} className="chart-container-1" ref={chartContainerRef} onScroll={(event) =>
                {handleScroll(chartContainerRef.current, taskTableRef.current); handleHorizontalScroll(chartContainerRef.current, headerContainerRef.current);}
              }>
                  <svg style={styles.chartContainer_1_svg} ref={svgRef}></svg>
              </div>
            </div>
        </div>
        {isTaskClicked && (
          <table style={styles.taskTable} className="task-table">
            <thead style={{...styles.taskTable_head,...(isDarkMode ? styles.taskTable_darkmode_thead : {})}}>
              <tr>
                <th></th>
                <th style={styles.taskTable_th}>Task Code</th>
                <th style={styles.taskTable_th}>Task Name</th>
                <th style={styles.taskTable_th}>Project Type</th>
                <th style={styles.taskTable_th}>Start Date</th>
                <th style={styles.taskTable_th}>Finish Date</th>
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
