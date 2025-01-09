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
  }
};

const SCurveChart = ({ isDarkMode, data, chartTitle, xAxisTitle, yAxisTitleLeft, yAxisTitleRight, projectInfoData, plannedPointsColor = "#00ff00",  actualPointsColor= "#2F5233" }) => {
  const chartRef = useRef();
  const [timeInterval, setTimeInterval] = useState("daily");
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [isMobile, setIsMobile] = useState(false);

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
        const weekStart = d3.timeFriday(date);
        return new Date(d3.timeFormat("%Y-%m-%d")(weekStart));
      } else if (interval === "monthly") {
        return new Date(d3.timeFormat("%Y-%m")(date));
      }
    });

    return Array.from(groupedData, ([key, values]) => {
      const totalPlanned = d3.sum(values, (d) =>
        d.baselinePlannedTotalCostPercentage
          ? d.baselinePlannedTotalCostPercentage
          : d.physicalProgressPercentage
      );
      if (values && values[values.length - 1].startDate) {
        key = values[values.length - 1].startDate;
      }
      return { date: new Date(key), value: totalPlanned / values.length };
    });
  };

  const calculateVariance = (planned, actual) => {
    return actual - planned;
  };

  const getActualPlannedYPoints = (plannedPoints, actualPoints, xDate) => {
    const closestPlannedPoint = plannedPoints.reduce((prev, curr) => {
      return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
        ? curr
        : prev;
    });
    const closestActualPoint = actualPoints.reduce((prev, curr) => {
      return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
        ? curr
        : prev;
    });
    const yValuePlanned = closestPlannedPoint
      ? closestPlannedPoint.value
      : null;
    const yValueActual = closestActualPoint ? closestActualPoint.value : null;
    return {yValuePlanned, yValueActual};
  }

  const updateDimensions = () => {
    const containerWidth = chartRef.current.clientWidth;
    setDimensions({ width: containerWidth, height: 500 });
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 800);
  };

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
    const { plannedPoints, actualPoints } = transformData(
      plannedData,
      actualData,
      timeInterval
    );
    const height = 420;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 30;
    let tickWidth = 20;
    if (timeInterval !== "daily") {
      tickWidth = 30;
    }
    const totalWidth = dimensions.width > (plannedPoints.length * tickWidth ) ? dimensions.width : (plannedPoints.length * tickWidth );
    const xScale = d3
      .scaleTime()
      .domain(d3.extent([...plannedPoints, ...actualPoints], (d) => d.date))
      .range([marginLeft, totalWidth - marginRight]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(d.value, 100))])
      .range([height - marginBottom, marginTop]);
    const yScaleRight = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(d.value, 100))])
      .range([height- marginBottom, marginTop]);

    // Clear previous chart content
    d3.select(chartRef.current).selectAll("*").remove();

    // Create a parent div
    const parent = d3.select(chartRef.current);

    // Add SVG for the vertical axis
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
      .call(d3.axisLeft(yScale).tickFormat((d) => `${d}%`));

    parentSVG.append("g")
      .attr("transform", `translate(${chartRef.current.clientWidth},0)`)
      .call(d3.axisRight(yScaleRight).tickFormat((d) => `${d}%`));

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
        weekNumber = +weekNumber + 1;
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
        // Check if the tick corresponds to a Monday
        if (d.getDay() === 0) { // Monday has `getDay() === 1`
          d3.select(this).select("line") // Select the tick line
            .attr("y2", 20); // Increase the length of the tick line
          d3.select(this).select("text") // Select the tick line
            .attr("y", 21); // Increase the length of the tick line
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
      .attr(
        "y", height + 10
        // timeInterval === "weekly"
        //   ? isMobile
        //     ? height + marginBottom + 40
        //     : height + marginBottom + 20
        //   : height + marginBottom + 25
      )
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
  
    d3.selectAll(".tooltip").remove();
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "14px")
      .style("padding", "10px")
      .style("display", "none")
      .style("box-shadow", "0 0 5px rgba(0,0,0,0.3)");
    // Tooltip to show every point on hover
    svg
      .append("rect")
      .attr("width", totalWidth)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
    
    // Tooltip to show variance
    const tooltipVariance = parentSVG
      .append("text")
      .attr("class", "tooltip")
      .attr("x", 0)
      .attr("y", 0)
      .style("visibility", "hidden");

    const line = svg
      .append("line")
      .attr("class", "vertical-line")
      .attr("stroke", "steelblue")
      .attr("stroke-dasharray", "10,10")
      .attr("stroke-width", "3px")
      .style("visibility", "hidden");

    svg.on("mousemove", function (event) {
      const [mouseX] = d3.pointer(event);
      const xDate = xScale.invert(mouseX);
      const { yValueActual, yValuePlanned } = getActualPlannedYPoints(plannedPoints, actualPoints, xDate);

      tooltip
        .html(`
          <strong>Date:</strong> ${d3.timeFormat("%m/%d/%Y")(xDate)}<br>
          <strong>Planned (%):</strong> ${yValuePlanned.toFixed(2)}<br>
          <strong>Actual (%):</strong> ${yValueActual.toFixed(2)}<br>
        `)
        .style("left", `${event.pageX + 10}px`) // Offset slightly to the right
        .style("top", `${event.pageY + 10}px`)  // Offset slightly below the mouse
        .style("display", "block")
        .style("visibility", "visible");
      const variance =
        calculateVariance(yValuePlanned, yValueActual).toFixed(2) || 0;
      tooltipVariance
        .attr("x", 50)
        .attr("y", 50)
        .text(`Variance: ${variance}%`)
        .style("visibility", "visible")
        .style("fill", variance > 0 ? "green" : "red");

      line
        .attr("x1", mouseX)
        .attr("y1", marginTop)
        .attr("x2", mouseX)
        .attr("y2", height + marginTop)
        .style("visibility", "visible");
    });

    svg.on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      line.style("visibility", "hidden");
      const xPos = xScale(new Date(projectInfoData.statusDate));
      const xDate = xScale.invert(xPos + 10);
      const { yValueActual, yValuePlanned } = getActualPlannedYPoints(plannedPoints, actualPoints, xDate);
      const variance =
          calculateVariance(yValuePlanned, yValueActual).toFixed(2) || 0;
      tooltipVariance
        .attr("x", 50)
        .attr("y", 50)
        .text(`Variance: ${variance}%`)
        .style("visibility", "visible")
        .style("fill", variance > 0 ? "green" : "red");
    });

    const linePlanned = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));
    svg
      .append("path")
      .datum(plannedPoints)
      .attr("class", "line planned")
      .attr("d", linePlanned)
      .attr("fill", "none")
      .attr("stroke", plannedPointsColor)
      .attr("stroke-width", 4);

    const lineActual = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));
    svg
      .append("path")
      .datum(actualPoints)
      .attr("class", "line actual")
      .attr("d", lineActual)
      .attr("fill", "none")
      .attr("stroke", actualPointsColor)
      .attr("stroke-width", 4);

      // Fixed line tooltip where actual point end
      if (actualPoints.length > 0) {
        const lastPoint = actualPoints[actualPoints.length - 1];
        const xPos = xScale(lastPoint.date);
        const yPos = yScale(lastPoint.value);
    
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
          .attr("x1", xPos)
          .attr("y1", marginTop)
          .attr("x2", xPos)
          .attr("y2", height + marginTop)
          .attr("stroke", "red")
          .attr("stroke-dasharray", "10,10")
          .attr("stroke-width", "3px")
          .style("visibility", "visible");

        const xDate = xScale.invert(xPos);
        const { yValueActual, yValuePlanned } = getActualPlannedYPoints(plannedPoints, actualPoints, xDate);
        const variance =
          calculateVariance(yValuePlanned, yValueActual).toFixed(2) || 0;
        tooltipVariance
          .attr("x", 50)
          .attr("y", 50)
          .text(`Variance: ${variance}%`)
          .style("visibility", "visible")
          .style("fill", variance > 0 ? "green" : "red");
      }

  // body.node().scrollBy(totalWidth, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeInterval, dimensions, isDarkMode]);

  return (
    <div className={`wrapper ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div style={styles.scurveChartContainer}>
        <h3 style={styles.chartTitle}>{chartTitle}</h3>
        <div style={styles.legendFilter}>
          <div style={styles.legends}>
            <div style={styles.legend}>
              <span style={{ ...styles.legendIcon, ...styles.legendIconPlanned }}></span>
              Planned %
            </div>
            <div style={styles.legend}>
              <span style={{ ...styles.legendIcon, ...styles.legendIconActual }}></span>
              Actual %
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
        <div ref={chartRef} style={{ position: "relative", width: "90%", margin: "auto" }} />
      </div>
    </div>
  );
};

export default SCurveChart;
