import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const styles = {
  groupedBarContainer: {
    margin: "0px 20px 0px 90px",
    height: "100vh",
  },
  chartTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  legendFilter: {
    display: "flex",
    justifyContent: "space-between",
  },
  legends: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
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

const GroupedBarChart = ({ isDarkMode, data, chartTitle, xAxisTitle, yAxisTitleLeft, yAxisTitleRight, currencySymbol, plannedPointsColor = "steelblue", actualPointsColor = "red", actualLineColor = "yellow", plannedLineColor = "purple" }) => {
  const svgRef = useRef();
  const [timeInterval, setTimeInterval] = useState("daily");
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const actualData =
    data.filter((d) => d.projectType === "UPDATED_PROJECT") || [];
  const plannedData =
    data.filter((d) => d.projectType === "BASELINE_PROJECT") || [];

  const transformData = (planned, actual, timeInterval) => {
    const plannedPoints = groupData(planned, timeInterval);
    const actualPoints = groupData(actual, timeInterval);
    return { plannedPoints, actualPoints };
  };

  const groupData = (data, interval) => {
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
        const totalPlanned = d3.sum(values, (d) =>
          d.sumBaselinePlannedTotalCost ? d.sumBaselinePlannedTotalCost : d.sumActualCost
        );
        const totalPlannedCumulative = d3.sum(values, (d) =>
            d.cumSumBaselinePlannedTotalCost ? d.cumSumBaselinePlannedTotalCost : d.cumSumActualCost
        );
        if (values.length > 0 && values[0].sumBaselinePlannedTotalCost) {
          return {date: key, value: totalPlanned, ...values[0], startDate: key, sumBaselinePlannedTotalCost: totalPlanned, cumSumBaselinePlannedTotalCost: totalPlannedCumulative / values.length }
        } else if (values.length > 0 && values[0].sumActualCost) {
          return {date: key, value: totalPlanned, ...values[0], startDate: key, sumActualCost: totalPlanned, cumSumActualCost: totalPlannedCumulative / values.length }
        }
        return { date: key, value: totalPlanned };
      });
    };

  const updateDimensions = () => {
    const containerWidth = containerRef.current.clientWidth;
    setDimensions({ width: containerWidth, height: 500 });
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 800);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    const { plannedPoints, actualPoints } = transformData(
      plannedData,
      actualData,
      timeInterval
    );

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const xScale = d3
      .scaleTime()
      .domain([
        d3.timeDay.offset(
          d3.min([...plannedPoints, ...actualPoints], (d) => d.date),
          -3
        ),
        d3.timeDay.offset(
          d3.max([...plannedPoints, ...actualPoints], (d) => d.date),
          3
        ),
      ])
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(
        d.cumSumActualCost || 0,
        d.sumActualCost || 0,
        d.cumSumBaselinePlannedTotalCost || 0,
        d.sumBaselinePlannedTotalCost || 0
      ))])
      .range([height, 0]);
    const yScaleRight = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(
        d.cumSumActualCost || 0,
        d.sumActualCost || 0,
        d.cumSumBaselinePlannedTotalCost || 0,
        d.sumBaselinePlannedTotalCost || 0
      ))])
      .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    let timeFormat = "%d %b";
    if (timeInterval === "weekly") {
        const weekNumberFormatter = (d) => {
            const weekNumber = d3.timeFormat("%U")(d); // Get the week number (starts from 0)
            const year = d3.timeFormat("%Y")(d); // Get the year
            const month = d3.timeFormat("%b")(d);
            return `Week ${+weekNumber + 1},\n${month} ${year}`; // Increment by 1 to start from 1
        };
        xAxis.tickFormat(weekNumberFormatter);
    } else {
        if (timeInterval === "monthly") {
            timeFormat = "%b %Y";
        }
        xAxis.tickFormat(d3.timeFormat(timeFormat));
    }
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
        if (d >= 1e9) {
          return `${currencySymbol}${(d / 1e9).toFixed(2)}B`;
        } else if (d >= 1e6) {
          return `${currencySymbol}${(d / 1e6).toFixed(2)}M`;
        } else if (d >= 1e3) {
          return `${currencySymbol}${(d / 1e3).toFixed(2)}K`;
        } else {
          return `${currencySymbol}${d}`;
        }
      });
    const yAxisRight = d3.axisRight(yScaleRight).tickFormat((d) => {
        if (d >= 1e9) {
          return `${currencySymbol}${(d / 1e9).toFixed(2)}B`;
        } else if (d >= 1e6) {
          return `${currencySymbol}${(d / 1e6).toFixed(2)}M`;
        } else if (d >= 1e3) {
          return `${currencySymbol}${(d / 1e3).toFixed(2)}K`;
        } else {
          return `${currencySymbol}${d}`;
        }
      });
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    if (isMobile) {
      svg.selectAll(".x-axis text")
        .style("transform", "rotate(-45deg)")
        .style("text-anchor", "end")
        .style("dominant-baseline", "hanging");
    }
    
    if (timeInterval === "weekly") {
        // Customize tick labels for multiline rendering
        const customizeXAxisTicks = () => {
          svg.selectAll(".x-axis text") // Select x-axis labels
            .each(function () {
              const text = d3.select(this);
              const lines = text.text().split("\n"); // Split text into lines
              text.text(null); // Clear existing text
              lines.forEach((line, i) => {
                text.append("tspan")
                  .text(line) // Add each line
                  .attr("x", 0)
                  .attr("dy", i === 0 ? 8 : "1.2em"); // Offset subsequent lines
              });
            });
        };
        customizeXAxisTicks();
    }
      
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr(
        "y",
        timeInterval === "weekly"
          ? isMobile
            ? height + margin.bottom + 40
            : height + margin.bottom + 20
          : height + margin.bottom + 25
      )
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", isDarkMode ? "white" : "#121212")
      .text(xAxisTitle);

    svg.append("g").attr("class", "y-axis1").call(yAxis);
    svg
        .append("text")
        .attr("class", "y-axis1-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left - 25)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("fill", isDarkMode ? "white" : "#121212")
        .text(yAxisTitleLeft);

    svg
      .append("g")
      .attr("class", "y-axis2")
      .attr("transform", `translate(${width}, 0)`)
      .call(yAxisRight);
    svg
      .append("text")
      .attr("class", "y-axis2-label")
      .attr("x", width + margin.right - 10)
      .attr("y", height / 2)
      .attr("transform", `rotate(90, ${width + margin.right + 30}, ${height / 2})`) // Rotate at the label position
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", isDarkMode ? "white" : "#121212")
      .text(yAxisTitleRight);

    const linePlanned = d3
      .line()
      .x((d) => xScale(d.startDate))
      .y((d) => yScale(d.cumSumBaselinePlannedTotalCost));
    svg
      .append("path")
      .datum(plannedPoints)
      .attr("class", "line planned")
      .attr("d", linePlanned)
      .attr("fill", "none")
      .attr("stroke", plannedLineColor)
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", "10,10")
      .on("mouseenter", function () {
        tooltip.style("opacity", 1).style("visibility", "visible").style("display", "block");
      })
      .on("mousemove", function (event, d) {
        const [mouseX] = d3.pointer(event);
        const xDate = xScale.invert(mouseX);
        const bisect = d3.bisector((d) => d.startDate).left;
        const index = bisect(plannedPoints, xDate, 1);
        const d0 = plannedPoints[index - 1];
        const d1 = plannedPoints[index];
        const point = xDate - d0.startDate > d1.startDate - xDate ? d1 : d0;

        tooltip
          .html(
            `<strong>Planned:</strong> ${currencySymbol}${point.cumSumBaselinePlannedTotalCost.toFixed(2)}<br />
             <strong>Date:</strong> ${d3.timeFormat("%b %d, %Y")(
               point.startDate
             )}`
          )
          .style("display", "block")
          .style("left", `${mouseX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0).style("visibility", "hidden");
      });

    const lineActual = d3
      .line()
      .x((d) => xScale(d.startDate))
      .y((d) => yScale(d.cumSumActualCost));
    svg
      .append("path")
      .datum(actualPoints)
      .attr("class", "line actual")
      .attr("d", lineActual)
      .attr("fill", "none")
      .attr("stroke", actualLineColor)
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", "10,10")
      .on("mouseenter", function () {
        tooltip.style("opacity", 1).style("visibility", "visible").style("display", "block");
      })
      .on("mousemove", function (event, d) {
        const [mouseX] = d3.pointer(event);
        const xDate = xScale.invert(mouseX);
        const bisect = d3.bisector((d) => d.startDate).left;
        const index = bisect(actualPoints, xDate, 1);
        const d0 = actualPoints[index - 1];
        const d1 = actualPoints[index];
        const point = xDate - d0.startDate > d1.startDate - xDate ? d1 : d0;

        tooltip
          .html(
            `<strong>Actual:</strong> ${currencySymbol}${point.cumSumActualCost.toFixed(2)}<br />
             <strong>Date:</strong> ${d3.timeFormat("%b %d, %Y")(
               point.startDate
             )}`
          )
          .style("display", "block")
          .style("left", `${mouseX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0).style("visibility", "hidden");
      });

    // Bar width for the chart
    let barWidth = 5;
    if (timeInterval === "weekly") {
        barWidth = 10;
    } else if (timeInterval === "monthly") {
        barWidth = 15;
    }

    d3.selectAll(".tooltip1").remove();
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip1")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "14px")
      .style("padding", "10px")
      .style("display", "none")
      .style("box-shadow", "0 0 5px rgba(0,0,0,0.3)");

    // Planned Bars
    svg
      .selectAll(".bar.planned")
      .data(plannedPoints)
      .enter()
      .append("rect")
      .attr("class", "bar planned")
      .attr("x", (d) => xScale(d.startDate) - barWidth / 2) // Centering the bar
      .attr("y", (d) => yScale(d.sumBaselinePlannedTotalCost))
      .attr("width", barWidth)
      .attr("height", (d) => yScale(0) - yScale(d.sumBaselinePlannedTotalCost)) // Calculate height from value
      .attr("fill", plannedPointsColor)
      .attr("opacity", 0.7)
      .on("mouseenter", function (event, d) {
        tooltip
          .style("opacity", 1)
          .style("display", "block")
          .style("pointer-events", "none");
      })
      .on("mousemove", function (event, d) {
        const [mouseX] = d3.pointer(event);
        tooltip
          .html(
            `<strong>Date:</strong> ${d3.timeFormat("%b %d, %Y")(
              d.startDate
            )}<br />
            <strong>Planned Cost:</strong> ${currencySymbol}${d.sumBaselinePlannedTotalCost.toFixed(2)}`
          )
          .style("display", "block")
          .style("left", `${mouseX + 10}px`)
          .style("top", `${event.pageY + 10}px`) 
          .style("visibility", "visible");
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0).style("visibility", "hidden");
      });
      
    // Actual Bars
    svg
      .selectAll(".bar.actual")
      .data(actualPoints)
      .enter()
      .append("rect")
      .attr("class", "bar actual")
      .attr("x", (d) => xScale(d.startDate) + barWidth / 2) // Offset to the right
      .attr("y", (d) => yScale(d.sumActualCost))
      .attr("width", barWidth)
      .attr("height", (d) => yScale(0) - yScale(d.sumActualCost)) // Calculate height from value
      .attr("fill", actualPointsColor)
      .attr("opacity", 0.7)
      .on("mouseenter", function (event, d) {
        tooltip
          .style("opacity", 1)
          .style("display", "block")
          .style("pointer-events", "none");
      })
      .on("mousemove", function (event, d) {
        const [mouseX] = d3.pointer(event);
        tooltip
          .html(
            `<strong>Date:</strong> ${d3.timeFormat("%b %d, %Y")(
              d.startDate
            )}<br />
            <strong>Actual Cost:</strong> ${currencySymbol}${d.sumActualCost.toFixed(2)}`
          )
          .style("left", `${mouseX + 10}px`)
          .style("top", `${event.pageY + 10}px`) 
          .style("display", "block")
          .style("visibility", "visible");
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0);
        tooltip.style("visibility", "hidden");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeInterval, dimensions, isDarkMode]);

  return (
    <div className={`wrapper ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div style={styles.groupedBarContainer} ref={containerRef}>
        <h3 style={styles.chartTitle}>{chartTitle}</h3>
        <div style={styles.legendFilter}>
          <div style={styles.legends}>
            <div style={styles.legend}>
              <span style={{ ...styles.legendIcon, ...styles.legendIconPlanned }} ></span>
              Planned {currencySymbol}
            </div>
            <div style={styles.legend}>
              <span style={{ ...styles.legendIcon, ...styles.legendIconActual }} ></span>
              Actual {currencySymbol}
            </div>
          </div>
          <div style={styles.dropdownContainer}>
            <select
              value={timeInterval}
              onChange={(e) => setTimeInterval(e.target.value)}
              style={styles.dropdown}
            >
              <option style={styles.dropdownOption} value="daily">
                Daily
              </option>
              <option style={styles.dropdownOption} value="weekly">
                Weekly
              </option>
              <option style={styles.dropdownOption} value="monthly">
                Monthly
              </option>
            </select>
          </div>
        </div>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
        ></svg>
      </div>
    </div>
  );
};

export default GroupedBarChart;
