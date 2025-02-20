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
  }
};

const HistogramWithSCurve = ({ isDarkMode, data, chartTitle, xAxisTitle, yAxisTitleLeft, yAxisTitleRight, projectInfoData, plannedPointsColor = "#00ff00",  actualPointsColor= "#2F5233" }) => {
  const chartRef = useRef();
  const [timeInterval, setTimeInterval] = useState("daily");
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedValue, setSelectedValue] = useState('histogram');

  const handleChangeRadio = (event) => {
    setSelectedValue(event.target.value);
  };

  const groupData = (data, interval) => {
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
    return Array.from(groupedData, ([key, values]) => {
        const aggregated = { date: new Date(key) };
        values.forEach(d => {
            for (const measure of Object.keys(d)) {
                if (measure.startsWith('cumSum')) {
                  if (selectedValue === "scurve") {
                    runningTotals[measure] = (runningTotals[measure] || 0) + d[measure];

                    // Assign cumulative sum
                    aggregated[measure] = runningTotals[measure];
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
  };

  const getActualPlannedYPoints = (plannedPoints, actualPoints, xDate) => {
    const closestPlannedPoint = plannedPoints.reduce((prev, curr) => {
      return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
        ? curr
        : prev;
    });
    // const closestActualPoint = actualPoints.reduce((prev, curr) => {
    //   return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
    //     ? curr
    //     : prev;
    // });
    const yValuePlanned = closestPlannedPoint
      ? closestPlannedPoint.cumSumPlannedLabourUnit
      : null;
    // const yValueActual = closestActualPoint ? closestActualPoint.value : null;
    return {yValuePlanned};
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
    const groupDataPoints = groupData(data, timeInterval);
    const height = 420;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 30;
    let tickWidth = 50;
    if (timeInterval !== "daily") {
      tickWidth = 60;
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
            const { yValuePlanned } = getActualPlannedYPoints(groupDataPoints, groupDataPoints, xDate);
      
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
      }

      // Draw the bars
      if (selectedValue === "histogram") {
        svg.selectAll('.layer')
          .data(stackedDataPlanned)
          .enter().append('g')
          .attr('class', 'layer')
          .attr('fill', d => {
            return color(d.key)
          })
          .selectAll('rect')
          .data(d => d)
          .enter().append('rect')
          .attr('x', d => xScale(new Date(d.data.date)))
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1]))
          .attr('width', xScale(new Date(groupDataPoints[1]?.date)) - xScale(new Date(groupDataPoints[0]?.date)) - (timeInterval !== "monthly" ? 3 : 10))
          .on('mouseover', function(event, d) {
              const resource = d3.select(this.parentNode).datum().key;
              const value = d[1] - d[0];
              d3.selectAll(".tooltip").remove();
              d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('position', 'absolute')
                  .style('pointer-events', 'none')
                  .html(`<strong>Resource Name:</strong> ${resource}<br><strong>Units:</strong> ${value.toFixed(2)}
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
          const totalYValue = total;
          if (total >= 1e9) {
            total = `${(total / 1e9).toFixed(2)}B`;
          } else if (total >= 1e6) {
            total = `${(total / 1e6).toFixed(2)}M`;
          } else if (total >= 1e3) {
            total = `${(total / 1e3).toFixed(2)}K`;
          } else {
            total = `${total}`;
          }
          svg.append('text')
              .attr('x', xScale(new Date(d.date)) + (timeInterval !== "daily" ? 30 : 16))
              .attr('y', yScale(totalYValue) - 3)
              .attr('text-anchor', 'middle')
              .attr('fill', isDarkMode ? 'white' : 'black')
              .text(total)
              .style('font-size', 10);
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
            .style("background-color", plannedPointsColor)
            .style("margin-right", "5px");
        
          // Append a span for the label text
          legendItem.append("span")
            .attr("class", "legend-label")
            .style("color", isDarkMode ? "white" : "black")
            .text("Planned Units");
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
          </div>
          <div style={styles.dropdownContainer}>
            <div style={{ marginRight: "10px" }}>
              <label>
                <input
                  type="radio"
                  value="histogram"
                  checked={selectedValue === "histogram"}
                  onChange={handleChangeRadio}
                />
                Histogram Chart
              </label>
              <label>
                <input
                  type="radio"
                  value="scurve"
                  checked={selectedValue === "scurve"}
                  onChange={handleChangeRadio}
                />
                S-Curve Chart
              </label>
            </div>
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
        <div className="chart" style={{ display: "flex" }}>
          <div ref={chartRef} style={{ position: "relative", width: "80%", margin: "auto" }} />
          <div className="legends"></div>
        </div>
      </div>
    </div>
  );
};

export default HistogramWithSCurve;
