import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const styles = {
  scurveChartContainer: {
    margin: "auto",
    width: "90%",
  },
  chartTitle: {
    fontSize: "24px",
    fontWeight: "bold",
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
    backgroundColor: "#00ff00",
  },
  legendIconActual: {
    backgroundColor: "#2F5233",
  },
  dropdownContainer: {
    display: "flex",
    alignItems: "center",
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
  table_container: {
    overflowX: "auto",
    maxWidth: "90%",
    margin: "10px auto"
  },
  taskTable_head: {
    position: "sticky",
    top: 0,
    background: "#07545e",
    color: "#FFFFFF",
    zIndex: 10,
    height: "55px"
  },
  thStyle: {
    border: "1px solid #ccc",
    padding: "8px 12px",
    textAlign: "center",
    whiteSpace: "nowrap"
  },
  tdStyle: {
    border: "1px solid #ccc",
    padding: "8px 12px",
    textAlign: "center",
    whiteSpace: "nowrap"
  },
  sticky_col: {
    position: "sticky",
    left: 0,
    color: "#fff",
    fontWeight: 600,
    backgroundColor: "#07545e",
    borderRight: "2px solid #fff",
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
    zIndex: 1,
  }
};

const HistogramWithSCurve = ({ isDarkMode, data, tabularResourceSpreadPeriodList, chartTitle, xAxisTitle, yAxisTitleLeft, yAxisTitleRight, projectInfoData, plannedPointsColor = "#00ff00",  actualPointsColor= "#2F5233" }) => {

  function toDateOnly(dateInput) {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0); // Reset time to 00:00:00
    return date;
  }

  const groupData = (data, interval, renderChartType) => {
    const groupedData = d3.group(data, (d) => {
        const date = new Date(d.startDate);
        if (interval === "daily") {
            return new Date(d3.timeFormat("%Y-%m-%d")(date));
        } else if (interval === "weekly") {
            const weekStart = d3.timeMonday(date); // Start from Monday for weekly grouping
            return new Date(d3.timeFormat("%Y-%m-%d")(weekStart));
        } else if (interval === "monthly") {
            return new Date(d3.timeFormat("%Y-%m")(date));
        }
    });
    
    const runningTotals = {};
    let points = Array.from(groupedData, ([key, values]) => {
        const aggregated = { date: new Date(key) };
        values.forEach(d => {
            for (const measure of Object.keys(d)) {
                if (measure.startsWith('cumSum')) {
                  const chartType = renderChartType || selectedValue;
                  if (chartType === "scurve") {
                    if (toDateOnly(projectInfoData.statusDate) >= toDateOnly(d.startDate) || measure.startsWith("cumSumPlanned")) {
                      runningTotals[measure] = (runningTotals[measure] || 0) + d[measure];

                      // Assign cumulative sum
                      aggregated[measure] = runningTotals[measure];
                    } else {
                      aggregated[measure] = d[measure];
                    }
                  } else {
                    aggregated[measure] = (aggregated[measure] || 0) + d[measure];
                  }
                }
            }
            // Map resourceId to corresponding measure values for stacked chart
            aggregated[d.resourceId] = aggregated[d.resourceId] || {};
            for (const measure of Object.keys(d)) {
                if (measure.startsWith('cumSum')) {
                    aggregated[d.resourceId][measure] = (aggregated[d.resourceId][measure] || 0) + d[measure];
                }
            }
        });
        if (values && values[values.length - 1].startDate) {
            aggregated.date = new Date(values[values.length - 1].startDate);
        }
        return aggregated;
    });
    if (interval === "monthly" && (renderChartType === "scurve" || selectedValue === "scurve")) {
      points = [{date: new Date(data[0].startDate), ...data[0]}, ...points];
    }
    return points;
  };

  const transformDataForTable = (data, interval) => {
    const groupedData = d3.group(data, (d) => {
      const date = new Date(d.startDate);
      if (interval === "daily") {
        return new Date(d3.timeFormat("%Y-%m-%d")(date));
      } else if (interval === "weekly") {
        const weekStart = d3.timeMonday(date);
        return new Date(d3.timeFormat("%Y-%m-%d")(weekStart));
      } else if (interval === "monthly") {
        return new Date(d3.timeFormat("%Y-%m")(date));
      }
    });

    return Array.from(groupedData, ([key, values]) => {
      // const totalPlanned = d3.sum(values, (d) => d.sumPlannedLabourUnit);
      // const totalActual = d3.sum(values, (d) => d.sumActualLabourUnit);
      // return { date: new Date(key), sumPlannedLabourUnit: totalPlanned, sumActualLabourUnit: totalActual };
      return { date: new Date(key), 
        cumSumPlannedLabourUnit: values[values.length - 1].sumPlannedLabourUnit > 0 ? values[values.length - 1].cumSumPlannedLabourUnit : 0,
        cumSumActualLabourUnit: values[values.length - 1].sumActualLabourUnit > 0 ? values[values.length - 1].cumSumActualLabourUnit : 0};
    });
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (timeInterval === "daily") {
      return d3.timeFormat("%d %b %Y")(date);
    } else if (timeInterval === "weekly") {
      const weekStart = d3.timeMonday(date);
      const weekEnd = d3.timeDay.offset(weekStart, 6); // Sunday is 6 days after Monday
      const format = d3.timeFormat("%d %b %Y");
      const startString = format(weekStart);
      const endString   = format(weekEnd);
      return `${startString} - ${endString}`;
    } else if (timeInterval === "monthly") {
      return d3.timeFormat("%b %Y")(date);
    }
  }

  const chartRef = useRef();
  const [selectedValue, setSelectedValue] = useState('histogram');
  const [timeInterval, setTimeInterval] = useState("daily");
  const [groupDataPoints, setGroupDataPoints] = useState(groupData(data, 'daily', 'histogram'));
  const [tableData, setTableData] = useState(transformDataForTable(tabularResourceSpreadPeriodList, "daily"));
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [isMobile, setIsMobile] = useState(false);

  const handleChangeRadio = (event) => {
    setGroupDataPoints(groupData(data, timeInterval, event.target.value));
    setTableData(transformDataForTable(tabularResourceSpreadPeriodList, timeInterval));
    setSelectedValue(event.target.value);
  };

  const handleTimeIntervalChange = (timeInterval) => {
    setGroupDataPoints(groupData(data, timeInterval));
    setTableData(transformDataForTable(tabularResourceSpreadPeriodList, timeInterval));
    setTimeInterval(timeInterval);
  }

  const getActualPlannedYPoints = (plannedPoints, xDate, isPlanned) => {
    const closestPlannedPoint = plannedPoints.reduce((prev, curr) => {
      return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
        ? curr
        : prev;
    });
    const yValuePlanned = closestPlannedPoint
      ? (isPlanned ? closestPlannedPoint.cumSumPlannedLabourUnit : closestPlannedPoint.cumSumActualLabourUnit)
      : null;
    return {yValuePlanned};
  }

  const updateDimensions = () => {
    const containerWidth = chartRef.current.clientWidth;
    setDimensions({ width: containerWidth, height: 500 });
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 800);
  };

  const formatValues = (total) => {
    if (total >= 1e9) {
      total = `${(total / 1e9).toFixed(2)}B`;
    } else if (total >= 1e6) {
      total = `${(total / 1e6).toFixed(2)}M`;
    } else if (total >= 1e3) {
      total = `${(total / 1e3).toFixed(2)}K`;
    } else {
      total = `${total}`;
    }
    return total;
  }

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);
  
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // const groupDataPoints = groupData(data, timeInterval);
    const height = 420;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 30;
    let tickWidth = 75;
    if (selectedValue === "scurve") {
      tickWidth = 40;
      if (timeInterval === "daily") {
        tickWidth = 20;
      }
    }
    const resourceIds = Array.from(new Set(data.map(d => d.resourceId)));

    const stackPlanned = d3.stack()
      .keys(resourceIds)
      .value((d, key) => d[key]?.cumSumPlannedLabourUnit || 0);
    const stackActual = d3.stack()
      .keys(resourceIds)
      .value((d, key) => d[key]?.cumSumActualLabourUnit || 0);


    const stackedDataPlanned = stackPlanned(groupDataPoints);
    const stackedDataActual = stackActual(groupDataPoints);
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(resourceIds);

    const totalWidth = dimensions.width > (groupDataPoints.length * tickWidth ) ? dimensions.width : (groupDataPoints.length * tickWidth );
    const extent = d3.extent([...groupDataPoints], d => d.date);
    let startDate;
    if (timeInterval === "daily") {
      startDate = d3.timeDay.offset(extent[0], -1); // one day earlier
    } else if (timeInterval === "weekly") {
      startDate = d3.timeWeek.offset(extent[0], -1); // one week earlier
    } else if (timeInterval === "monthly") {
      startDate = d3.timeMonth.offset(extent[0], -1); // one month earlier
    }
    const endDate = extent[1];
    const xScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([marginLeft, totalWidth - marginRight]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max([...groupDataPoints], (d) => Math.max(d.cumSumPlannedLabourUnit, d.cumSumActualLabourUnit))])
      .nice()
      .range([height - marginBottom, marginTop]);
    const yScaleRight = d3
      .scaleLinear()
      .domain([0, d3.max([...groupDataPoints], (d) => Math.max(d.cumSumPlannedLabourUnit, d.cumSumActualLabourUnit))])
      .nice()
      .range([height - marginBottom, marginTop]);

    // Clear previous chart content
    d3.select(chartRef.current).selectAll("*").remove();

    // Create a parent div
    const parent = d3.select(chartRef.current);

    // Add SVG for the vertical axis, vertical axis labels and Variance
    const parentSVG = parent
      .append("svg")
      .attr("width", chartRef.current.clientWidth)
      .attr("height", height)
      .style("position", "absolute")
      .style("left", 0)
      .style("pointer-events", "none")
      .style("z-index", 1);

    parentSVG.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale).tickFormat((d) => `${d}`));

    parentSVG.append("g")
      .attr("transform", `translate(${chartRef.current.clientWidth},0)`)
      .call(d3.axisRight(yScaleRight).tickFormat((d) => `${d}`));

    const body = parent
      .append("div")
      .attr("class", "horizontal-scroll")
      .style("overflow-x", "auto")
      .style("-webkit-overflow-scrolling", "touch");

    const svg = body
      .append("svg")
      .attr("width", totalWidth)
      .attr("height", height)
      .style("display", "block")
      .style("padding-bottom", "20px");

    // Add horizontal axis
    const xAxis = d3.axisBottom(xScale);
    let timeFormat = "%d %b";
    if (timeInterval === "weekly") {
      xAxis.ticks(d3.timeWeek.every(1)) // Set weekly ticks
      .tickFormat((d, i) => {
        let weekNumber = d3.timeFormat("%U")(d);
        const monthYear = d3.timeFormat("%b %Y")(d);
        return weekNumber % 4 === 0 ?`W${weekNumber} \n ${monthYear}` : `W${weekNumber}`;
      });
    } else {
      if (timeInterval === "monthly") {
        timeFormat = "%b %Y";
        xAxis.tickFormat(d3.timeFormat(timeFormat));
      } else if ((timeInterval === "daily")) {
        xAxis.ticks(d3.timeDay.every(1))
          .tickFormat((d, i) => {
            const dayValue = d3.timeFormat("%a")(d);
            const month = d3.timeFormat("%b")(d);
            const date = d3.timeFormat("%d")(d);
            return (dayValue === "Sun" ? dayValue : dayValue.charAt(0)) + (dayValue === "Sun" ? `,\n ${month} ${date}` : "");
          })
          .tickSizeOuter(0);
      }
    }
    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .attr("class", "x-axis")
      .call(xAxis);

    if (timeInterval === "daily") {
      xAxisGroup.selectAll(".tick").each(function (d) {
        // Check if the tick corresponds to a Sunday
        if (d.getDay() === 0) { // Sunday has `getDay() === 0`
          d3.select(this).select("line") // Select the tick line
            .attr("y2", 20); // Increase the length of the tick line
          d3.select(this).select("text") // Select the tick text
            .attr("y", 21); // Increase the position of the tick text
          d3.select(this).select("text").selectAll("tspan").attr("x", 1);
        }
      });
    }

    if (isMobile) {
      svg
        .selectAll(".x-axis text")
        .style("transform", "rotate(-45deg)")
        .style("text-anchor", "end")
        .style("dominant-baseline", "hanging");
    }

    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", totalWidth / 2)
      .attr("y", height + 10)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", isDarkMode ? "white" : "#121212")
      .text(xAxisTitle);

    parentSVG
      .append("text")
      .attr("class", "y-axis1-label")
      .attr("x", -height / 2)
      .attr("y", -marginLeft)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", isDarkMode ? "white" : "#121212")
      .text(yAxisTitleLeft);

    parentSVG
      .append("text")
      .attr("class", "y-axis2-label")
      .attr("x", chartRef.current.clientWidth + marginRight - 10)
      .attr("y", height / 2)
      .attr(
        "transform",
        `rotate(90, ${chartRef.current.clientWidth + marginRight + 20}, ${height / 2})`
      ) // Rotate at the label position
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", isDarkMode ? "white" : "#121212")
      .text(yAxisTitleRight);
      
      if (timeInterval !== "monthly") {
        // Customize tick labels for multiline rendering
        const customizeXAxisTicks = () => {
          svg
            .selectAll(".x-axis text") // Select x-axis labels
            .each(function () {
              const text = d3.select(this);
              const lines = text.text().split("\n"); // Split text into lines
              text.text(null); // Clear existing text
              lines.forEach((line, i) => {
                text
                  .append("tspan")
                  .text(line) // Add each line
                  .attr("x", 0)
                  .attr("dy", i === 0 ? 8 : "1.2em"); // Offset subsequent lines
              });
            });
      };
      customizeXAxisTicks();
    }
  
    d3.selectAll(".tooltip-hs").remove();
    // Tooltip to show every point on hover
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip-hs")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "14px")
      .style("padding", "10px")
      .style("display", "none")
      .style("box-shadow", "0 0 5px rgba(0,0,0,0.3)")
      .style("z-index", 1);
    svg
      .append("rect")
      .attr("width", totalWidth)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")

      if (selectedValue === "scurve") {
        // S-curve planned
        const linePlanned = d3
          .line().x((d) => xScale(d.date))
          .y((d) => yScaleRight(d.cumSumPlannedLabourUnit));
        svg
          .append("path")
          .datum(groupDataPoints)
          .attr("class", "line planned")
          .attr("d", linePlanned)
          .attr("fill", "none")
          .attr("stroke", plannedPointsColor)
          .attr("stroke-width", 4)
          .on("mouseenter", function () {
            tooltip.style("opacity", 1).style("visibility", "visible").style("display", "block");
          })
          .on("mousemove", function (event) {
            const [mouseX] = d3.pointer(event);
            const xDate = xScale.invert(mouseX);
            const { yValuePlanned } = getActualPlannedYPoints(groupDataPoints, xDate, true);
      
            tooltip
              .html(`
                <strong>Date:</strong> ${d3.timeFormat("%d/%m/%Y")(xDate)}<br>
                <strong>Planned Units:</strong> ${yValuePlanned.toFixed(2)}<br>
              `)
              .style("left", `${event.pageX + 10}px`) // Offset slightly to the right
              .style("top", `${event.pageY + 10}px`)  // Offset slightly below the mouse
              .style("display", "block")
              .style("visibility", "visible");
          })
          .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
          });

        // S-curve Actual
        const lineActual = d3
          .line()
          .defined(d => d.cumSumActualLabourUnit > 0)
          .x((d) => xScale(d.date))
          .y((d) => yScaleRight(d.cumSumActualLabourUnit));
        svg
          .append("path")
          .datum(groupDataPoints)
          .attr("class", "line planned")
          .attr("d", lineActual)
          .attr("fill", "none")
          .attr("stroke", actualPointsColor)
          .attr("stroke-width", 4)
          .on("mouseenter", function () {
            tooltip.style("opacity", 1).style("visibility", "visible").style("display", "block");
          })
          .on("mousemove", function (event) {
            const [mouseX] = d3.pointer(event);
            const xDate = xScale.invert(mouseX);
            const { yValuePlanned } = getActualPlannedYPoints(groupDataPoints, xDate, false);
      
            tooltip
              .html(`
                <strong>Date:</strong> ${d3.timeFormat("%d/%m/%Y")(xDate)}<br>
                <strong>Actual Units:</strong> ${yValuePlanned.toFixed(2)}<br>
              `)
              .style("left", `${event.pageX + 10}px`) // Offset slightly to the right
              .style("top", `${event.pageY + 10}px`)  // Offset slightly below the mouse
              .style("display", "block")
              .style("visibility", "visible");
          })
          .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
          });

        const xDate = new Date(projectInfoData.statusDate);
        const xPos = xScale(xDate);
        const { yValuePlanned } = getActualPlannedYPoints(groupDataPoints, xDate, false);
        const yPos = yScale(yValuePlanned);
    
        svg
          .append("text")
          .attr("class", "fix-tooltip")
          .attr("x", xPos + 10)
          .attr("y", yPos - 10)
          .text(`Status Date: ${projectInfoData.statusDate}`)
          .style("fill", "red")
          .style("visibility", "visible");
    
        svg
          .append("line")
          .attr("class", "fix-line")
          .attr("x1", xPos + 5)
          .attr("y1", marginTop)
          .attr("x2", xPos)
          .attr("y2", height + marginTop)
          .attr("stroke", "red")
          .attr("stroke-dasharray", "10,10")
          .attr("stroke-width", "3px")
          .style("visibility", "visible");
      }

      // Draw the bars
      if (selectedValue === "histogram") {
        // Planned Bar plotting
        svg.selectAll('.layer')
          .data(stackedDataPlanned)
          .enter().append('g')
          .attr('class', 'layer')
          .attr('fill', d => {
            return color(d.key)
          })
          .attr('opacity', isDarkMode ? 0.6 : 0.75)
          .selectAll('rect')
          .data(d => d)
          .enter().append('rect')
          .attr('x', d => xScale(new Date(d.data.date)) - (timeInterval !== "daily" ? 50 : 43))
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1]))
          .attr('width', 25)
          // .attr('width', xScale(new Date(groupDataPoints[1]?.date)) - xScale(new Date(groupDataPoints[0]?.date)) - (timeInterval !== "monthly" ? 3 : 10))
          .on('mouseover', function(event, d) {
              const resource = d3.select(this.parentNode).datum().key;
              const value = d[1] - d[0];
              d3.selectAll(".tooltip").remove();
              d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('position', 'absolute')
                  .style('pointer-events', 'none')
                  .html(`<strong>Resource Name:</strong> ${resource}<br><strong>Planned Units:</strong> ${value.toFixed(2)}
                  <br><strong>Date:</strong> ${d3.timeFormat("%d/%m/%Y")(d.data.date)}`)
                  .style('left', `${event.pageX + 10}px`)
                  .style('top', `${event.pageY - 20}px`)
                  .style("background-color", "white")
                  .style("border", "1px solid #ccc")
                  .style("border-radius", "4px")
                  .style("font-size", "14px")
                  .style("padding", "10px")
                  .style("box-shadow", "0 0 5px rgba(0,0,0,0.3)")
                  .style("z-index", 1);
          })
          .on('mouseout', function() {
              d3.select('.tooltip').remove();
          });
        // Overall Value Adding on each bar
        groupDataPoints.forEach(d => {
          let total = resourceIds.reduce((sum, key) => sum + (d[key]?.cumSumPlannedLabourUnit || 0), 0);
          total = total.toFixed(2);
          if (total > 0) {
            const text = svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('fill', isDarkMode ? 'white' : 'black')
                .style('font-size', 10); 
            text.append('tspan')
              .attr('x', xScale(new Date(d.date)) - (timeInterval !== "daily" ? 38 : 30))
              .attr('y', yScale(total) - 13)
              .text("P");
            text.append('tspan')
              .attr('x', xScale(new Date(d.date)) - (timeInterval !== "daily" ? 38 : 30))
              .attr('y', yScale(total) - 3)
              .text(formatValues(total));
          }
        });

        // Actual Bar plotting
        svg.selectAll('.layer.actual')
          .data(stackedDataActual)
          .enter().append('g')
          .attr('class', 'layer actual')
          .attr('fill', d => {
            return color(d.key)
          })
          .selectAll('rect')
          .data(d => d)
          .enter().append('rect')
          .attr('x', d => xScale(new Date(d.data.date)) - (timeInterval !== "daily" ? 22 : 16))
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1]))
          .attr('width', 25)
          // .attr('width', xScale(new Date(groupDataPoints[1]?.date)) - xScale(new Date(groupDataPoints[0]?.date)) - (timeInterval !== "monthly" ? 3 : 10))
          .on('mouseover', function(event, d) {
              const resource = d3.select(this.parentNode).datum().key;
              const value = d[1] - d[0];
              d3.selectAll(".tooltip").remove();
              d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('position', 'absolute')
                  .style('pointer-events', 'none')
                  .html(`<strong>Resource Name:</strong> ${resource}<br><strong> Actual Units:</strong> ${value.toFixed(2)}
                  <br><strong>Date:</strong> ${d3.timeFormat("%d/%m/%Y")(d.data.date)}`)
                  .style('left', `${event.pageX + 10}px`)
                  .style('top', `${event.pageY - 20}px`)
                  .style("background-color", "white")
                  .style("border", "1px solid #ccc")
                  .style("border-radius", "4px")
                  .style("font-size", "14px")
                  .style("padding", "10px")
                  .style("box-shadow", "0 0 5px rgba(0,0,0,0.3)")
                  .style("z-index", 1);
          })
          .on('mouseout', function() {
              d3.select('.tooltip').remove();
          });
        // Overall Value Adding on each bar
        groupDataPoints.forEach(d => {
          let total = resourceIds.reduce((sum, key) => sum + (d[key]?.cumSumActualLabourUnit || 0), 0);
          total = total.toFixed(2);
          if (total > 0) {
            const text = svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('fill', isDarkMode ? 'white' : 'black')
                .style('font-size', 10); 
            text.append('tspan')
              .attr('x', xScale(new Date(d.date)) - (timeInterval !== "daily" ? 10 : 5))
              .attr('y', yScale(total) - 13)
              .text("A");
            text.append('tspan')
              .attr('x', xScale(new Date(d.date)) - (timeInterval !== "daily" ? 10 : 5))
              .attr('y', yScale(total) - 3)
              .text(formatValues(total));
          }
        });
      }

      d3.select(".legends").selectAll("*").remove();
      const legendContainer = d3.select(".legends");
      legendContainer.style("max-height", height + "px");
      if (selectedValue === "histogram") {
        resourceIds.forEach((key) => {
          // Create a container div for each legend item
          const legendItem = legendContainer.append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px");
        
          // Append a span for the color box
          legendItem.append("span")
            .attr("class", "legend-color")
            .style("display", "inline-block")
            .style("width", "10px")
            .style("height", "10px")
            .style("background-color", color(key))
            .style("margin-right", "5px");
        
          // Append a span for the label text
          legendItem.append("span")
            .attr("class", "legend-label")
            .style("color", isDarkMode ? "white" : "black")
            .text(key);
        });
      } else if (selectedValue === "scurve") {
        const legendItemPlanned = legendContainer.append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px");
        
          // Append a span for the color box
          legendItemPlanned.append("span")
            .attr("class", "legend-color")
            .style("display", "inline-block")
            .style("width", "10px")
            .style("height", "10px")
            .style("background-color", plannedPointsColor)
            .style("margin-right", "5px");
        
          // Append a span for the label text
          legendItemPlanned.append("span")
            .attr("class", "legend-label")
            .style("color", isDarkMode ? "white" : "black")
            .text("Planned Units");
          
          const legendItemActual = legendContainer.append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px");
        
          // Append a span for the color box
          legendItemActual.append("span")
            .attr("class", "legend-color")
            .style("display", "inline-block")
            .style("width", "10px")
            .style("height", "10px")
            .style("background-color", actualPointsColor)
            .style("margin-right", "5px");
        
          // Append a span for the label text
          legendItemActual.append("span")
            .attr("class", "legend-label")
            .style("color", isDarkMode ? "white" : "black")
            .text("Actual Units");
      }

  // If required to scroll to the end as initial position enable below line
  // body.node().scrollBy(totalWidth, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeInterval, dimensions, isDarkMode, selectedValue]);

  return (
    <div className={`wrapper ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div style={styles.scurveChartContainer}>
        <h3 style={styles.chartTitle}>{chartTitle}</h3>
        <div style={styles.legendFilter}>
          <div style={styles.legends}>
            {selectedValue === "histogram" && <div style={styles.legend}>
              P - Planned Units
            </div>}
            {selectedValue === "histogram" && <div style={styles.legend}>
              A - Actual Units
            </div>}
          </div>
          <div style={styles.dropdownContainer}>
            <div style={{ marginRight: "10px" }}>
              <label>
                <input
                  type="radio"
                  value="histogram"
                  checked={selectedValue === "histogram"}
                  onChange={(e) => handleChangeRadio(e)}
                />
                Histogram Chart
              </label>
              <label>
                <input
                  type="radio"
                  value="scurve"
                  checked={selectedValue === "scurve"}
                  onChange={(e) => handleChangeRadio(e)}
                />
                S-Curve Chart
              </label>
            </div>
            <select
              value={timeInterval}
              onChange={(e) => handleTimeIntervalChange(e.target.value)}
              style={styles.dropdown}
            >
              <option style={styles.dropdownOption} value="daily">Daily</option>
              <option style={styles.dropdownOption} value="weekly">Weekly</option>
              <option style={styles.dropdownOption} value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="chart" style={{ display: "flex" }}>
          <div ref={chartRef} style={{ position: "relative", width: "84%", margin: "auto" }} />
          <div className="legends"></div>
        </div>
      </div>
      <h3>Units</h3>
      <div className="horizontal-scroll" style={styles.table_container}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={styles.taskTable_head}>
            <tr>
              {/* Empty top-left cell */}
              <th style={{...styles.thStyle, ...styles.sticky_col}}></th>
              {/* Date headers */}
              {tableData.map((item, index) => (
                <th key={index} style={styles.thStyle}>
                  {formatDate(item.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Planned Units Row */}
            <tr>
              <td style={{...styles.tdStyle, ...styles.sticky_col}}>Planned Units</td>
              {tableData.map((item, index) => (
                <td key={index} style={styles.tdStyle}>
                  {formatValues(item.cumSumPlannedLabourUnit.toFixed(2))}
                </td>
              ))}
            </tr>
            {/* Actual Units Row */}
            <tr>
              <td style={{...styles.tdStyle, ...styles.sticky_col}}>Actual Units</td>
              {tableData.map((item, index) => (
                <td key={index} style={styles.tdStyle}>
                  {item.cumSumActualLabourUnit.toFixed(2) > 0 && formatValues(item.cumSumActualLabourUnit.toFixed(2))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistogramWithSCurve;
