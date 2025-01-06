import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import "../Styles/SCurveChart.css";

const GroupedBarChart = ({ data }) => {
  const svgRef = useRef();
  const [timeInterval, setTimeInterval] = useState("daily");
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
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
        // return { date: key, value: totalPlanned };
      });
    };

  const updateDimensions = () => {
    const containerWidth = document.querySelector(
      ".scurve-chart-container"
    ).clientWidth;
    setDimensions({ width: containerWidth, height: 500 });
  };

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
      .domain(d3.extent([...plannedPoints, ...actualPoints], (d) => d.date))
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(
        d.sumActualCost || 0,
        d.sumBaselinePlannedTotalCost || 0
      ))])
      .range([height, 0]);
    const yScaleRight = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(
        // d.value || 0,
        // d.cumSumActualCost || 0,
        d.sumActualCost || 0,
        // d.cumSumBaselinePlannedTotalCost || 0,
        d.sumBaselinePlannedTotalCost || 0
      ))])
      .range([height, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y"));
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
        if (d >= 1e9) {
          return `$${(d / 1e9).toFixed(2)}B`;
        } else if (d >= 1e6) {
          return `$${(d / 1e6).toFixed(2)}M`;
        } else if (d >= 1e3) {
          return `$${(d / 1e3).toFixed(2)}K`;
        } else {
          return `$${d}`;
        }
      });
    const yAxisRight = d3.axisRight(yScaleRight).tickFormat((d) => {
        if (d >= 1e9) {
          return `$${(d / 1e9).toFixed(2)}B`;
        } else if (d >= 1e6) {
          return `$${(d / 1e6).toFixed(2)}M`;
        } else if (d >= 1e3) {
          return `$${(d / 1e3).toFixed(2)}K`;
        } else {
          return `$${d}`;
        }
      });
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom + 10)
      .attr("text-anchor", "middle")
      .text("Start Date");

    svg.append("g").attr("class", "y-axis1").call(yAxis);
    svg
        .append("text")
        .attr("class", "y-axis1-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Baseline Planned Total Cost (%)");

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
      .attr("transform", `rotate(90, ${width + margin.right + 10}, ${height / 2})`) // Rotate at the label position
      .attr("text-anchor", "middle")
      .text("Physical Progress (%)");

    // const tooltip = svg
    //   .append("text")
    //   .attr("class", "tooltip")
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .style("visibility", "hidden");

    // const tooltipVariance = svg
    //   .append("text")
    //   .attr("class", "tooltip")
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .style("visibility", "hidden");

    // const line = svg
    //   .append("line")
    //   .attr("class", "vertical-line")
    //   .attr("stroke", "red")
    //   .attr("stroke-dasharray", "10,10")
    //   .attr("stroke-width", "3px")
    //   .style("visibility", "hidden");

    // svg.on("mousemove", function (event) {
    //   const [mouseX] = d3.pointer(event);
    //   const xDate = xScale.invert(mouseX);
    //   const closestPlannedPoint = plannedPoints.reduce((prev, curr) => {
    //     return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
    //       ? curr
    //       : prev;
    //   });
    //   const closestActualPoint = actualPoints.reduce((prev, curr) => {
    //     return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
    //       ? curr
    //       : prev;
    //   });
    //   const yValuePlanned = closestPlannedPoint
    //     ? closestPlannedPoint.value
    //     : null;
    //   const yValueActual = closestActualPoint ? closestActualPoint.value : null;

    //   tooltip
    //     .attr("x", mouseX)
    //     .attr("y", yScale(yValuePlanned || yValueActual))
    //     .text(`Status Date: ${d3.timeFormat("%m/%d/%Y")(xDate)}`)
    //     .style("visibility", "visible")
    //     .style("fill", "red");

    //   const variance =
    //     calculateVariance(yValuePlanned, yValueActual).toFixed(2) || 0;
    //   tooltipVariance
    //     .attr("x", 50)
    //     .attr("y", 50)
    //     .text(`Variance: ${variance}%`)
    //     .style("visibility", "visible")
    //     .style("fill", variance > 0 ? "green" : "red");

    //   line
    //     .attr("x1", mouseX)
    //     .attr("y1", margin.top)
    //     .attr("x2", mouseX)
    //     .attr("y2", height + margin.top)
    //     .style("visibility", "visible");
    // });

    // svg.on("mouseout", function () {
    //   tooltip.style("visibility", "hidden");
    //   line.style("visibility", "hidden");
    // });

    // const linePlanned = d3
    //   .line()
    //   .x((d) => xScale(d.startDate))
    //   .y((d) => yScale(d.cumSumBaselinePlannedTotalCost));
    // svg
    //   .append("path")
    //   .datum(plannedPoints)
    //   .attr("class", "line planned")
    //   .attr("d", linePlanned)
    //   .attr("fill", "none")
    //   .attr("stroke", "purple")
    //   .attr("stroke-width", 4);

    // const lineActual = d3
    //   .line()
    //   .x((d) => xScale(d.startDate))
    //   .y((d) => yScale(d.cumSumActualCost));
    // svg
    //   .append("path")
    //   .datum(actualPoints)
    //   .attr("class", "line actual")
    //   .attr("d", lineActual)
    //   .attr("fill", "none")
    //   .attr("stroke", "yellow")
    //   .attr("stroke-width", 4);
    // Bar width for the chart
    let barWidth = 5;
    if (timeInterval === "weekly") {
        barWidth = 10;
    } else if (timeInterval === "monthly") {
        barWidth = 15;
    }

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
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);

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
        .attr("fill", "red")
        .attr("opacity", 0.7);
  }, [timeInterval, dimensions]);

  return (
    <div className="scurve-chart-container">
      <h2 className="chart-title">S-Curve</h2>

    <div className="legend-filter">
      <div className="legends">
        <div className="legend">
          <span className="legend-icon planned"></span>
          Planned %
        </div>
        <div className="legend">
          <span className="legend-icon actual"></span>
          Actual %
        </div>
      </div>

      <div className="dropdown-container">
        <select
          className="dropdown"
          value={timeInterval}
          onChange={(e) => setTimeInterval(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
      ></svg>
    </div>
  );
};

export default GroupedBarChart;
