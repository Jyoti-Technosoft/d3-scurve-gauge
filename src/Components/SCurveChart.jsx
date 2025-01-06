import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import jsonData from "../Json/data.json";
import "../Styles/SCurveChart.css";

const SCurveChart = ({ data, chartTitle, xAxisTitle, yAxisTitleLeft, yAxisTitleRight }) => {
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
        d.baselinePlannedTotalCostPercentage
          ? d.baselinePlannedTotalCostPercentage
          : d.physicalProgressPercentage
      );
      return { date: key, value: totalPlanned / values.length };
    });
  };

  const calculateVariance = (planned, actual) => {
    return actual - planned;
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
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(d.value, 100))])
      .range([height, 0]);
    const yScaleRight = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => Math.max(d.value, 100))])
      .range([height, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y"));
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}%`);
    const yAxisRight = d3.axisRight(yScaleRight).tickFormat((d) => `${d}%`);

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
      .text(xAxisTitle);

    svg.append("g").attr("class", "y-axis1").call(yAxis);
    svg
    .append("text")
    .attr("class", "y-axis1-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
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
      .attr("transform", `rotate(90, ${width + margin.right + 10}, ${height / 2})`) // Rotate at the label position
      .attr("text-anchor", "middle")
      .text(yAxisTitleRight);

    const tooltip = svg
      .append("text")
      .attr("class", "tooltip")
      .attr("x", 0)
      .attr("y", 0)
      .style("visibility", "hidden");

    const tooltipVariance = svg
      .append("text")
      .attr("class", "tooltip")
      .attr("x", 0)
      .attr("y", 0)
      .style("visibility", "hidden");

    const line = svg
      .append("line")
      .attr("class", "vertical-line")
      .attr("stroke", "red")
      .attr("stroke-dasharray", "10,10")
      .attr("stroke-width", "3px")
      .style("visibility", "hidden");

    svg.on("mousemove", function (event) {
      const [mouseX] = d3.pointer(event);
      const xDate = xScale.invert(mouseX);
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

      tooltip
        .attr("x", mouseX)
        .attr("y", yScale(yValuePlanned || yValueActual))
        .text(`Status Date: ${d3.timeFormat("%m/%d/%Y")(xDate)}`)
        .style("visibility", "visible")
        .style("fill", "red");

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
        .attr("y1", margin.top)
        .attr("x2", mouseX)
        .attr("y2", height + margin.top)
        .style("visibility", "visible");
    });

    svg.on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      line.style("visibility", "hidden");
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
      .attr("stroke", "#00FF00")
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
      .attr("stroke", "#2F5233")
      .attr("stroke-width", 4);

      if (actualPoints.length > 0) {
        const lastPoint = actualPoints[actualPoints.length - 1];
        const xPos = xScale(lastPoint.date);
        const yPos = yScale(lastPoint.value);
    
        svg
          .append("text")
          .attr("class", "fix-tooltip")
          .attr("x", xPos + 10)
          .attr("y", yPos - 10)
          .text(`Status Date: ${jsonData.statusDate}`)
          .style("fill", "red")
          .style("visibility", "visible");
    
        svg
          .append("line")
          .attr("class", "fix-line")
          .attr("x1", xPos)
          .attr("y1", margin.top)
          .attr("x2", xPos)
          .attr("y2", height + margin.top)
          .attr("stroke", "red")
          .attr("stroke-dasharray", "10,10")
          .attr("stroke-width", "3px")
          .style("visibility", "visible");
      }
  }, [timeInterval, dimensions]);

  return (
    <div className="scurve-chart-container">
      <h2 className="chart-title">{chartTitle}</h2>

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

export default SCurveChart;
