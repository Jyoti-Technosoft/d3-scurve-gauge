import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const styles = {
    groupedBarContainer: {
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
      textAlign: "center",
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
  };

const TaskTable = ({ tasks, expandedTasks, onToggleExpand }) => {
  const renderTask = (task, level = 0) => {
    const isExpanded = expandedTasks.includes(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const duration = Math.ceil((task.end - task.start) / (1000 * 60 * 60 * 24));
    const progress = task.progress || 0;
    const status = task.status || 'Not Started';
    const owner = task.owner || '-';
    const priority = task.priority || 'Medium';

    return (
      <React.Fragment key={task.id}>
        <tr className={`task-row ${task.type}`}>
          <td style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren && (
              <button 
                className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                onClick={() => onToggleExpand(task.id)}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {task.task}
          </td>
          {/* <td>{task.type}</td>
          <td>{task.start.toLocaleDateString()}</td>
          <td>{task.end.toLocaleDateString()}</td>
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
      <table className="task-table">
        <thead>
          <tr>
            <th>Task Name</th>
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

const GanttChart = ({ tasks, blMilestoneActivity, upMilestoneActivity }) => {
    const [timeInterval, setTimeInterval] = useState("daily");
  const svgRef = useRef();
  const taskTableRef = useRef();
  const splitBarRef = useRef();
  const [expandedTasks, setExpandedTasks] = useState([1, 5]); // Initially expand top-level tasks
//   const preparedTasks = () => {
//     console.log("DATA BASE ===> ", blMilestoneActivity);
//     console.log("DATA UPDA ===> ", upMilestoneActivity);
//   }
//   preparedTasks();

  const flattenTasks = (tasks, result = []) => {
    tasks.forEach(task => {
      result.push(task);
      if (task.children && expandedTasks.includes(task.id)) {
        flattenTasks(task.children, result);
      }
    });
    return result;
  };

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

    // Set up dimensions
    const headerHeights = {
      year: 30,
      month: 25,
      day: 25
    };
    const totalHeaderHeight = headerHeights.year + headerHeights.month + headerHeights.day;
    const margin = { 
      top: totalHeaderHeight,
      right: 30, 
      bottom: 20, 
      left: 0 
    };
    
    // Calculate minimum width needed for all days
    const minDayWidth = 40; // Increased minimum width per day
    const startDate = d3.min(flatTasks, d => d.start);
    const endDate = d3.max(flatTasks, d => d.end);
    const totalDays = d3.timeDay.count(startDate, endDate);
    const minChartWidth = totalDays * minDayWidth;
    
    // Calculate container width
    const containerWidth = document.querySelector('.chart-container').clientWidth;
    const chartWidth = Math.max(minChartWidth, containerWidth);
    const rowHeight = 56; // 40px height + 16px padding (8px top + 8px bottom)
    const barHeight = 32; // Adjusted bar height
    const verticalPadding = (rowHeight - barHeight) / 2; // Center in row
    const chartHeight = flatTasks.length * rowHeight;

    // Create SVG with the calculated dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', chartWidth)
      .attr('height', 'auto');

    // Update time scale with new width
    const timeScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, chartWidth - margin.left - margin.right]);

    // Create chart container with horizontal scroll if needed
    const chartContainer = d3.select('.chart-container')
      .style('overflow-x', chartWidth > containerWidth ? 'auto' : 'hidden');

    // Create header group
    const headerGroup = svg.append('g')
      .attr('class', 'header-group')
      .attr('transform', `translate(${margin.left},0)`);

    // Create chart group with proper offset
    const chartGroup = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales with proper domain and range
    const taskScale = d3.scaleLinear()
      .domain([0, flatTasks.length - 1])  // Adjust domain to account for zero-based index
      .range([0, chartHeight - rowHeight]); // Adjust range to account for row height

    // Add year headers
    const years = d3.timeYear.range(...timeScale.domain());
    headerGroup.append('g')
      .attr('class', 'year-header')
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
          .attr('class', 'year-background');

        // Add year text centered in the visible area
        year.append('text')
          .attr('x', yearStart + yearWidth / 2)
          .attr('y', headerHeights.year / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('class', 'year-label')
          .text(d3.timeFormat('%Y')(d));

        // Add vertical separator line
        year.append('line')
          .attr('class', 'year-separator')
          .attr('x1', yearStart)
          .attr('x2', yearStart)
          .attr('y1', 0)
          .attr('y2', headerHeights.year);
      });

    // Add month headers with similar dynamic centering
    const months = d3.timeMonth.range(...timeScale.domain());
    headerGroup.append('g')
      .attr('class', 'month-header')
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
          .attr('class', 'month-background');

        // Add month text centered
        month.append('text')
          .attr('x', monthStart + monthWidth / 2)
          .attr('y', headerHeights.month / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('class', 'month-label')
          .text(d3.timeFormat('%b')(d));

        // Add separator line
        month.append('line')
          .attr('class', 'month-separator')
          .attr('x1', monthStart)
          .attr('x2', monthStart)
          .attr('y1', 0)
          .attr('y2', headerHeights.month);
      });

    // Add day headers with increased minimum width
    const days = d3.timeDay.range(...timeScale.domain());
    headerGroup.append('g')
      .attr('class', 'day-header')
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
          .attr('class', 'header-cell');
        
        g.append('text')
          .attr('x', dayStart + (dayWidth / 2))
          .attr('y', headerHeights.day / 2)
          .attr('dy', '.1em')
          .text(d3.timeFormat('%d')(d));
      });

    // Add bars and milestones with proper vertical positioning
    flatTasks.forEach((task, index) => {
      const rowY = index * rowHeight; // Exact row position
      
      if (task.type === 'milestone') {
        const x = timeScale(task.start);
        const y = rowY + (rowHeight / 2); // Center of row
        const milestoneSize = Math.pow(barHeight * 0.7, 2); // Reduced size, squared for area
        
        chartGroup.append('path')
          .attr('class', 'milestoneDiamond')
          .attr('d', d3.symbol()
            .type(d3.symbolDiamond)
            .size(milestoneSize))
          .attr('transform', `translate(${x+20}, ${y})`)
          .attr('data-task-id', task.id);
      } else {
        chartGroup.append('rect')
          .attr('class', `bar ${task.type}`)
          .attr('y', rowY + verticalPadding)
          .attr('x', timeScale(task.start))
          .attr('height', barHeight)
          .attr('width', Math.max(timeScale(task.end) - timeScale(task.start), 1))
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('data-task-id', task.id);
      }
    });

    // Add grid lines with proper offset
    const gridLines = chartGroup.append('g')
      .attr('class', 'grid-lines');

    d3.timeDay.range(...timeScale.domain()).forEach(date => {
      gridLines.append('line')
        .attr('class', 'grid-line')
        .attr('x1', timeScale(date))
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
      return flatTasks.find(t => t.id.toString() === taskId);
    };

    svg.selectAll('.bar, .milestoneDiamond')
      .on('mouseover', (event) => {
        const task = findTaskByElement(event.target);
        
        if (task) {
          clearTimeout(tooltipTimeout);
          
          const tooltipContent = `
            <strong>${task.task}</strong><br/>
            <span class="tooltip-label">Type:</span> ${task.type}<br/>
            <span class="tooltip-label">Start:</span> ${task.start.toLocaleDateString()}<br/>
            <span class="tooltip-label">${task.type === 'milestone' ? 'Due' : 'End'}:</span> ${task.end.toLocaleDateString()}
            ${task.type !== 'milestone' ? `<br/><span class="tooltip-label">Duration:</span> ${Math.ceil((task.end - task.start) / (1000 * 60 * 60 * 24))} days` : ''}
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

  return (
    <div>
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
        <div className="gantt-chart-container">
            <div className="task-table-container" ref={taskTableRef} style={{ minWidth: "200px", maxWidth: "80%" }}>
                <TaskTable 
                    tasks={tasks} 
                    expandedTasks={expandedTasks}
                    onToggleExpand={handleToggleExpand}
                />
            </div>
            <div className="split-bar" ref={splitBarRef} onMouseDown={startDragging}></div>
            <div className="chart-container">
                <svg ref={svgRef}></svg>
            </div>
        </div>
    </div>
  );
};

export default GanttChart;
